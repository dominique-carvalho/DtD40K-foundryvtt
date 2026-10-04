import { inCone, pinningImmune, pinningTn, suppressionHits } from "../rules/maneuvers.mjs";
import { rollAttack, rollDamage } from "./attack-service.mjs";
import { rollDefense } from "./turn-service.mjs";
import { setStatus } from "./maneuver-service.mjs";
import { checkAmmo, spendAmmo } from "./ammo-service.mjs";

/**
 * Kill zones of Suppressing Fire and Overwatch (spec 017, research R2–R4, R6): a 45° cone template from the shooter's
 * token, the Pinning Tests of the tokens inside, the burst at the start of the shooter's next turn and the Overwatch
 * shot. Contract: specs/017-combat-actions/contracts/foundry-api.md ("zone-service").
 */

const ZONE_TEMPLATE = "systems/dtd40k/templates/chat/zone-card.hbs";
const PINNING_TEMPLATE = "systems/dtd40k/templates/chat/pinning-card.hbs";
const SUPPRESSION_TEMPLATE = "systems/dtd40k/templates/chat/suppression-card.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
const render = (path, data) => foundry.applications.handlebars.renderTemplate(path, data);
const zoneOf = (template) => template?.flags?.dtd40k?.zone ?? null;
const featNames = (actor) => actor.featNames();

/** Attack options of a full-auto shot fired by the system; `tn`: the target's Static Defense (none for the burst). */
const autoOptions = (braced, tn = null) => ({
  tn, modifiers: {}, specialty: false, rollMode: undefined, ammoId: "",
  weapon: { range: "normal", aim: 0, mode: "auto", braced, oneHanded: false, thrown: false },
  situation: { advantage: false, targetProne: false, targetRan: false, gangUp: 0, intoMelee: false, terrain: "", calledLocation: "" }
});

/** Pixels per scene unit. */
const pxPerUnit = () => canvas.dimensions.size / canvas.dimensions.distance;

/** Center of a token document in pixels. */
const centerOf = (token) => {
  const size = canvas.dimensions.size;
  return { x: token.x + (token.width * size) / 2, y: token.y + (token.height * size) / 2 };
};

/**
 * Tokens whose center lies in a cone template (research R2).
 * @param {MeasuredTemplateDocument} template
 * @returns {TokenDocument[]}
 */
export function tokensInZone(template) {
  const cone = { origin: { x: template.x, y: template.y }, direction: template.direction, angle: template.angle, distance: template.distance * pxPerUnit() };
  return template.parent.tokens.filter((token) => token.actor && inCone({ ...cone, point: centerOf(token) }));
}

/**
 * Whether a token stands in an active kill zone — "under fire" for the escape from Pinning (research R4).
 * @param {TokenDocument} token
 */
export function activeZoneAt(token) {
  if (!token?.parent) return false;
  return token.parent.templates.some((template) => zoneOf(template)?.state === "active" && tokensInZone(template).some((t) => t.id === token.id));
}

/**
 * Weapon of Suppressing Fire or Overwatch (FR-001): full auto, braced if heavy.
 * @param {Actor} actor
 * @param {string} weaponId
 * @returns {Promise<{weapon: Item, braced: boolean}|null>}  null when refused (the action is not spent)
 */
export async function checkZoneWeapon(actor, weaponId) {
  const weapon = actor.items.get(weaponId);
  if (!weapon || !(weapon.system.rof?.auto > 0)) {
    ui.notifications.warn(localize("DTD.Zone.NeedAuto"));
    return null;
  }
  let braced = false;
  if (weapon.system.weaponType === "heavy") {
    braced = await foundry.applications.api.DialogV2.confirm({
      window: { title: weapon.name }, content: `<p>${localize("DTD.Zone.Braced")}</p>`, rejectClose: false
    });
    if (!braced) {
      ui.notifications.warn(localize("DTD.Zone.NeedBrace"));
      return null;
    }
  }
  return { weapon, braced };
}

/**
 * Place the cone (FR-002) from the shooter's token towards the first target, as long as the weapon's range; the
 * player may move, turn and stretch it (up to 4× the range) before confirming it on the card.
 * @param {Actor} actor
 * @param {{weapon: Item, braced: boolean}} shot
 * @param {"suppressing"|"overwatch"} kind
 * @param {{attack?: "suppressing"|"burst", trigger?: string}} [overwatch]
 */
export async function placeZone(actor, { weapon, braced }, kind, { attack = "suppressing", trigger = "" } = {}) {
  const token = actor.getActiveTokens(false, true)[0];
  if (!token || !canvas.scene) {
    ui.notifications.warn(localize("DTD.Zone.NoToken"));
    return null;
  }
  const origin = centerOf(token);
  const target = [...game.user.targets][0];
  const aim = target ? centerOf(target.document) : { x: origin.x + 1, y: origin.y };
  const direction = (Math.toDegrees(Math.atan2(aim.y - origin.y, aim.x - origin.x)) + 360) % 360;
  const combatant = game.combat?.combatants.find((c) => c.tokenId === token.id) ?? null;
  const zone = {
    kind, actorUuid: actor.uuid, tokenId: token.id, combatantId: combatant?.id ?? "", weaponId: weapon.id, braced, attack, trigger,
    state: "placing", round: game.combat?.round ?? 0, maxDistance: (weapon.system.range?.value || 30) * 4
  };
  const [template] = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
    t: "cone", x: origin.x, y: origin.y, direction, angle: 45, distance: weapon.system.range?.value || 30,
    fillColor: game.user.color?.css ?? "#ff0000", flags: { dtd40k: { zone } }
  }]);
  const content = await render(ZONE_TEMPLATE, {
    title: localize(kind === "overwatch" ? "DTD.Zone.Overwatch" : "DTD.Zone.Suppressing"),
    name: actor.name, weapon: weapon.name, rof: weapon.system.rof.auto, overwatch: kind === "overwatch",
    attack: localize(`DTD.Zone.Attack.${attack}`), trigger
  });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }), content,
    flags: { dtd40k: { zone: { templateUuid: template.uuid, kind } } }
  });
  return template;
}

/**
 * Post the Pinning Tests of the tokens in the zone (FR-003) and make it active.
 * @param {Actor} actor  shooter
 * @param {MeasuredTemplateDocument} template
 */
async function startSuppression(actor, template) {
  const zone = zoneOf(template);
  // The rounds are spent now, once (spec 019): the ROF left is the burst's ROF next turn.
  const weapon = actor.items.get(zone.weaponId);
  let rof = weapon?.system.rof?.auto ?? 0;
  if (weapon?.system.ammo?.tracked) {
    if (!(await checkAmmo(weapon))) return;
    rof = (await spendAmmo(weapon, "auto")).effectiveRof;
  }
  const inside = tokensInZone(template).filter((token) => token.id !== zone.tokenId);
  const targets = inside.map((token) => ({
    tokenUuid: token.uuid, actorUuid: token.actor.uuid, name: token.name, immune: pinningImmune(featNames(token.actor))
  }));
  await template.update({
    "flags.dtd40k.zone": { ...zone, kind: "suppressing", state: "active", round: game.combat?.round ?? 0, pinned: inside.map((t) => t.id), rof }
  });
  const content = await render(PINNING_TEMPLATE, { title: localize("DTD.Pinning.Title"), tn: pinningTn(), targets, escape: false });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }), content,
    flags: { dtd40k: { pinning: { tn: pinningTn(), escape: false, targets } } }
  });
}

/**
 * "Confirm zone" on the card: Suppressing Fire tests the tokens inside; Overwatch starts waiting for its trigger.
 * @param {ChatMessage} message
 */
export async function confirmZone(message) {
  const template = await foundry.utils.fromUuid(message.getFlag("dtd40k", "zone")?.templateUuid ?? "");
  const zone = zoneOf(template);
  const actor = zone ? await foundry.utils.fromUuid(zone.actorUuid) : null;
  if (!actor?.isOwner || zone.state !== "placing") return;
  if (template.distance > zone.maxDistance) await template.update({ distance: zone.maxDistance });
  if (zone.kind === "overwatch") await template.update({ "flags.dtd40k.zone.state": "active" });
  else await startSuppression(actor, template);
}

/**
 * Pinning Test from the card (FR-003, FR-005): Willpower of the target's owner; a failure pins, an escape success
 * frees.
 * @param {ChatMessage} message
 * @param {{token: string}} data
 */
export async function rollPinning(message, data) {
  const pinning = message.getFlag("dtd40k", "pinning");
  const token = await foundry.utils.fromUuid(data.token ?? "");
  const actor = token?.actor;
  if (!pinning || !actor?.isOwner) {
    ui.notifications.warn(localize("DTD.Combat.NotYourTarget"));
    return;
  }
  const roll = await actor.rollCharacteristic("wil", {
    fastForward: true, tn: pinning.tn, label: localize(pinning.escape ? "DTD.Pinning.Escape" : "DTD.Pinning.Title")
  });
  const success = roll?.getFlag("dtd40k", "test")?.outcome?.success;
  if (success === undefined) return;
  if (pinning.escape && success) await setStatus(actor, "pinned", false);
  if (!pinning.escape && !success) await setStatus(actor, "pinned", true);
}

/**
 * Escape card at the end of a Pinned character's turn (FR-005): TN 20 inside an active zone, 10 otherwise.
 * @param {Actor} actor
 */
export async function postPinningEscape(actor) {
  const token = actor.getActiveTokens(false, true)[0];
  const tn = pinningTn({ escape: true, underFire: activeZoneAt(token) });
  const targets = [{ tokenUuid: token?.uuid ?? "", actorUuid: actor.uuid, name: actor.name, immune: false }];
  const content = await render(PINNING_TEMPLATE, { title: localize("DTD.Pinning.Escape"), tn, targets, escape: true });
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content, flags: { dtd40k: { pinning: { tn, escape: true, targets } } } });
}

/**
 * The burst of Suppressing Fire at the start of the shooter's next turn (FR-004): one full-auto roll; hits on the
 * uncovered tokens in the cone whose Static Defense is below the total, up to the ROF; the cone is removed.
 * @param {MeasuredTemplateDocument} template
 */
async function resolveSuppression(template) {
  const zone = zoneOf(template);
  const actor = await foundry.utils.fromUuid(zone.actorUuid);
  const weapon = actor?.items.get(zone.weaponId);
  if (!actor || !weapon) return template.delete();
  const attackMessage = await rollAttack(actor, weapon.id, { preset: { ...autoOptions(zone.braced), noAmmo: true, rof: zone.rof ?? weapon.system.rof.auto } });
  const total = attackMessage?.getFlag("dtd40k", "attack")?.total;
  // The roll card keeps only the roll: damage and Dodge go by target on the burst card.
  if (attackMessage) await attackMessage.update({ content: attackMessage.content.replace(/<button[^>]*data-dtd-action="(?:rollDamage|dodge|parry)"[^>]*>[\s\S]*?<\/button>/g, "") });
  const inside = tokensInZone(template).filter((token) => token.id !== zone.tokenId);
  await template.delete();
  if (total === undefined) return;
  const candidates = inside.map((token) => ({
    id: token.uuid, sd: token.actor.system.derived?.staticDefense ?? 0, covered: token.actor.statuses.has("inCover")
  }));
  const hitIds = suppressionHits({ total, targets: candidates, rof: zone.rof ?? weapon.system.rof.auto });
  const rows = inside.map((token) => ({
    tokenUuid: token.uuid, actorUuid: token.actor.uuid, name: token.name,
    sd: token.actor.system.derived?.staticDefense ?? 0, covered: token.actor.statuses.has("inCover"), hit: hitIds.includes(token.uuid)
  }));
  const content = await render(SUPPRESSION_TEMPLATE, {
    title: format("DTD.Zone.Burst", { weapon: weapon.name }), total, rof: zone.rof ?? weapon.system.rof.auto, rows,
    hits: rows.filter((row) => row.hit), misses: rows.filter((row) => !row.hit)
  });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }), content,
    flags: { dtd40k: { suppression: { attackMessageId: attackMessage.id, rows } } }
  });
}

/** The attack flags of a burst, aimed at one of its targets (one hit, no damage per raise). */
function burstAttack(message, data) {
  const suppression = message.getFlag("dtd40k", "suppression");
  const attackMessage = game.messages.get(suppression?.attackMessageId ?? "");
  const attack = attackMessage?.getFlag("dtd40k", "attack");
  if (!attack) return null;
  return { ...attack, targetUuid: data.actor, hits: 1, raises: 0 };
}

/** A message-like object carrying one attack (reuses the damage and defense of spec 008). */
const asMessage = (attack) => ({ getFlag: (scope, key) => (key === "attack" ? attack : undefined), setFlag: async () => {}, isOwner: false });

/**
 * Damage of one target hit by the burst; the damage card applies to that token.
 * @param {ChatMessage} message
 * @param {{token: string, actor: string}} data
 */
export async function suppressionDamage(message, data) {
  const attack = burstAttack(message, data);
  if (!attack) return;
  const damage = await rollDamage(asMessage(attack));
  if (damage) await damage.setFlag("dtd40k", "damage", { ...damage.getFlag("dtd40k", "damage"), tokenUuids: [data.token] });
}

/**
 * Dodge of one target against the burst (research R3).
 * @param {ChatMessage} message
 * @param {{token: string, actor: string}} data
 */
export async function suppressionDodge(message, data) {
  const attack = burstAttack(message, data);
  if (attack) await rollDefense(asMessage({ ...attack, tn: null }), "dodge");
}

/**
 * Overwatch shot (FR-011): Suppressing Fire starts the Pinning Tests and the burst of the next turn; a Full Auto Burst
 * is rolled at once on the user's target. Once only; the Overwatch ends.
 * @param {ChatMessage} message
 */
export async function fireOverwatch(message) {
  const template = await foundry.utils.fromUuid(message.getFlag("dtd40k", "zone")?.templateUuid ?? "");
  const zone = zoneOf(template);
  const actor = zone ? await foundry.utils.fromUuid(zone.actorUuid) : null;
  if (!actor?.isOwner || zone.kind !== "overwatch" || zone.state !== "active") {
    ui.notifications.warn(localize("DTD.Zone.NoOverwatch"));
    return;
  }
  if (zone.attack === "suppressing") {
    const combatant = game.combat?.combatants.get(zone.combatantId);
    await template.update({ "flags.dtd40k.zone.combatantId": combatant?.id ?? "" });
    await startSuppression(actor, template);
    return;
  }
  await template.delete();
  const target = [...game.user.targets][0]?.actor;
  await rollAttack(actor, zone.weaponId, { preset: autoOptions(zone.braced, target?.system.derived?.staticDefense ?? 15) });
}

/**
 * End the Overwatch of a character (any action or reaction, or the start of his next turn).
 * @param {Actor} actor
 */
export async function endOverwatch(actor) {
  for (const scene of game.scenes) {
    const ids = scene.templates.filter((t) => t.isOwner && zoneOf(t)?.kind === "overwatch" && zoneOf(t).actorUuid === actor.uuid).map((t) => t.id);
    if (ids.length) await scene.deleteEmbeddedDocuments("MeasuredTemplate", ids);
  }
}

/**
 * Start of a combatant's turn: his Suppressing Fire bursts resolve; his Overwatch and unconfirmed zones end.
 * @param {Combat} combat
 * @param {Combatant} combatant
 */
export async function zonesAtTurnStart(combat, combatant) {
  const scene = combat.scene ?? canvas.scene;
  if (!scene) return;
  for (const template of [...scene.templates]) {
    const zone = zoneOf(template);
    if (!zone || zone.combatantId !== combatant.id) continue;
    // Declared on his own turn (after its start) or during others' turns: this is the next start of his turn.
    if (zone.kind === "suppressing" && zone.state === "active") await resolveSuppression(template);
    else if (zone.kind === "overwatch" || zone.state === "placing") await template.delete();
  }
}

/**
 * End of combat: every zone goes.
 * @param {Combat} combat
 */
export async function clearZones(combat) {
  const scene = combat.scene ?? canvas.scene;
  const ids = scene?.templates.filter((t) => zoneOf(t)).map((t) => t.id) ?? [];
  if (ids.length) await scene.deleteEmbeddedDocuments("MeasuredTemplate", ids);
}
