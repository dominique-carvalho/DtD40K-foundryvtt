import { abilityActive, abilityOutcome, inArea } from "../rules/npc-traits.mjs";
import { fearRating } from "../rules/npc.mjs";
import { requestGm } from "./gm-socket.mjs";
import { addFatigue, toggleCondition } from "./condition-service.mjs";
import { fearTest } from "./mental-service.mjs";
import { takeAction } from "./turn-service.mjs";

/**
 * NPC special abilities (spec 022, US3, research R8): area attacks with a template and a save, auras triggered by a
 * Charge / All Out Attack or by the start of the turn, extra Critical Damage on a weapon's hit, spell-like abilities.
 * Contract: specs/022-npc-traits/contracts/foundry-api.md.
 */

const CARD_TEMPLATE = "systems/dtd40k/templates/chat/ability-card.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
const render = (path, data) => foundry.applications.handlebars.renderTemplate(path, data);

/** Scene units → pixels. */
const pxPerUnit = () => canvas.dimensions.size / canvas.dimensions.distance;

/** Centre of a token document, in pixels. */
const centerOf = (token) => ({ x: token.x + (token.width * canvas.dimensions.size) / 2, y: token.y + (token.height * canvas.dimensions.size) / 2 });

/**
 * Warn about a refusal; the GM may go on anyway (constitution IV).
 * @param {string} message
 */
async function refuseUnlessGM(message) {
  ui.notifications.warn(message);
  if (!game.user.isGM) return false;
  return Boolean(await foundry.applications.api.DialogV2.confirm({
    window: { title: localize("DTD.Npc.Abilities") }, content: `<p>${message}</p><p>${localize("DTD.Combat.GMOverride")}</p>`, rejectClose: false
  }));
}

/**
 * Tokens other than the actor's within its melee reach (auras).
 * @param {TokenDocument} own
 */
function tokensInReach(own) {
  const reach = Math.max(2, canvas.grid.distance) * pxPerUnit();
  const origin = centerOf(own);
  return own.parent.tokens.filter((token) => token.id !== own.id && token.actor
    && inArea({ shape: "blast", origin, distance: reach + (token.width * canvas.dimensions.size) / 2, point: centerOf(token) }));
}

/**
 * Place the area of an ability from the actor's token toward the first target, and list the tokens inside.
 * @param {TokenDocument} own
 * @param {object} ability
 * @returns {Promise<TokenDocument[]>}
 */
async function areaTargets(own, ability) {
  const target = [...game.user.targets][0]?.document ?? null;
  const ownCenter = centerOf(own);
  const blast = ability.area.shape === "blast";
  const origin = blast && target ? centerOf(target) : ownCenter;
  const aim = target ? centerOf(target) : { x: ownCenter.x + 1, y: ownCenter.y };
  const direction = (Math.toDegrees(Math.atan2(aim.y - ownCenter.y, aim.x - ownCenter.x)) + 360) % 360;
  const distance = ability.area.size || 2;
  const shape = { cone: "cone", blast: "circle", line: "ray" }[ability.area.shape];
  await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
    t: shape, x: origin.x, y: origin.y, direction, distance, angle: 60, width: shape === "ray" ? 2 : undefined,
    fillColor: game.user.color?.css ?? "#ff0000", flags: { dtd40k: { ability: { actorUuid: own.actor.uuid, name: ability.name } } }
  }]);
  return own.parent.tokens.filter((token) => token.actor && token.id !== own.id && inArea({
    shape: ability.area.shape, origin, direction, distance: distance * pxPerUnit(), width: 2 * pxPerUnit(), point: centerOf(token)
  }));
}

/**
 * Post the ability card for its targets.
 * @param {Actor} actor
 * @param {object} ability
 * @param {number} index
 * @param {TokenDocument[]} targets
 */
async function postCard(actor, ability, index, targets) {
  const save = ability.save;
  const saveLabel = save.characteristic === "fear"
    ? format("DTD.Npc.FearSave", { rating: fearRating(actor.system.npc.traits) ?? 0 })
    : save.characteristic
      ? `${localize(CONFIG.DTD.CHARACTERISTICS[save.characteristic]?.label ?? save.characteristic)}${save.skill ? ` + ${localize(CONFIG.DTD.SKILLS[save.skill]?.label ?? save.skill)}` : ""} · TN ${save.tn}`
      : "";
  const rows = targets.map((token) => ({ tokenUuid: token.uuid, actorUuid: token.actor.uuid, name: token.name }));
  const content = await render(CARD_TEMPLATE, {
    name: ability.name, effect: ability.effect, saveLabel, failure: failureText(ability.onFail), rows, hasSave: Boolean(save.characteristic)
  });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }), content,
    flags: { dtd40k: { ability: { actorUuid: actor.uuid, index, save, onFail: ability.onFail, targets: rows } } }
  });
}

/** Readable failure effect. */
function failureText(onFail) {
  const parts = [];
  if (onFail.condition) parts.push(onFail.rounds ? format("DTD.Npc.FailCondition", { condition: localize(`DTD.Condition.${onFail.condition}`), rounds: onFail.rounds }) : localize(`DTD.Condition.${onFail.condition}`));
  if (onFail.fatigue) parts.push(format("DTD.Npc.FailFatigue", { value: onFail.fatigue }));
  if (onFail.damage?.kept) parts.push(`${onFail.damage.rolled}k${onFail.damage.kept}${onFail.damage.type}`);
  return parts.join(" · ");
}

/**
 * Use an ability from the sheet (US3): uses, action, area or target, card. Spell-like abilities roll their test.
 * @param {Actor} actor
 * @param {number} index  in system.npc.abilities
 */
export async function useAbility(actor, index) {
  const ability = actor.system.npc.abilities[index];
  if (!ability || ability.kind === "text" || ability.kind === "onHit") return;
  if (!abilityActive(actor.system.npc, ability) && !(await refuseUnlessGM(format("DTD.Npc.FormAbility", { name: ability.name })))) return;
  if (ability.uses.max && ability.uses.value >= ability.uses.max && !(await refuseUnlessGM(format("DTD.Npc.NoUses", { name: ability.name })))) return;
  if (ability.action && !(await takeAction(actor, { key: "ability", name: ability.name, type: ability.action }))) return;
  if (ability.uses.max) await updateAbility(actor, index, { "uses.value": ability.uses.value + 1 });

  if (ability.kind === "spell") {
    const message = ability.spell.skill
      ? await actor.rollSkill(ability.spell.skill, { characteristic: ability.spell.characteristic || undefined, label: `${ability.name} (${ability.spell.name})` })
      : await actor.rollCharacteristic(ability.spell.characteristic || "wil", { label: `${ability.name} (${ability.spell.name})` });
    if (message) await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${format("DTD.Npc.SpellLike", { name: ability.name, spell: ability.spell.name })}</p><p>${ability.effect}</p>` });
    return;
  }
  const own = actor.getActiveTokens(false, true)[0];
  let targets;
  if (ability.kind === "area" && ability.area.shape && own && canvas.scene) targets = await areaTargets(own, ability);
  else if (ability.kind === "aura" && own) targets = tokensInReach(own);
  else targets = [...game.user.targets].map((token) => token.document);
  await postCard(actor, ability, index, targets);
}

/**
 * Update one ability of the stored list.
 * @param {Actor} actor
 * @param {number} index
 * @param {object} changes  dotted paths inside the ability
 */
async function updateAbility(actor, index, changes) {
  const list = foundry.utils.deepClone(actor._source.system.npc.abilities);
  for (const [path, value] of Object.entries(changes)) foundry.utils.setProperty(list[index], path, value);
  await actor.update({ "system.npc.abilities": list });
}

/**
 * Auras of an actor for a trigger (FR-013): "assault" after a Charge or an All Out Attack; "turnStart" when its turn
 * begins. Every creature in melee reach gets the card.
 * @param {Actor} actor
 * @param {"assault"|"turnStart"} trigger
 */
export async function triggerAuras(actor, trigger) {
  if (actor?.type !== "npc") return;
  const own = actor.getActiveTokens(false, true)[0];
  if (!own) return;
  const list = actor.system.npc.abilities;
  for (const [index, ability] of list.entries()) {
    if (ability.kind !== "aura" || ability.trigger !== trigger || !abilityActive(actor.system.npc, ability)) continue;
    const targets = tokensInReach(own);
    if (targets.length) await postCard(actor, ability, index, targets);
  }
}

/**
 * Extra Critical Damage of a weapon's hit (Gauss Weapon): onHit abilities naming the weapon.
 * @param {Actor} actor
 * @param {Item|null} item
 * @returns {number}
 */
export function onHitCritical(actor, item) {
  if (actor?.type !== "npc" || !item) return 0;
  return actor.system.npc.abilities
    .filter((a) => a.kind === "onHit" && a.weapon && a.weapon === item.name && abilityActive(actor.system.npc, a))
    .reduce((sum, a) => sum + a.extraCritical, 0);
}

/**
 * "Resist" on the card: the target's owner rolls the save; a failure applies the effect to that target.
 * @param {ChatMessage} message
 * @param {{actorUuid: string, tokenUuid: string}} dataset
 */
export async function resistAbility(message, { actorUuid }) {
  const flag = message.getFlag("dtd40k", "ability");
  const target = await foundry.utils.fromUuid(actorUuid);
  if (!flag || !target?.isOwner) {
    ui.notifications.warn(localize("DTD.Npc.NotYourTarget"));
    return;
  }
  const save = flag.save;
  // Frightful Presence: the Fear Test of spec 012 applies its own consequences.
  if (save.characteristic === "fear") {
    const source = await foundry.utils.fromUuid(flag.actorUuid);
    await fearTest(target, fearRating(source?.system.npc.traits ?? []) ?? 0);
    return;
  }
  const roll = save.skill
    ? await target.rollSkill(save.skill, { characteristic: save.characteristic, tn: save.tn, fastForward: true })
    : await target.rollCharacteristic(save.characteristic, { tn: save.tn, fastForward: true });
  const success = Boolean(roll?.getFlag("dtd40k", "test")?.outcome?.success);
  await applyOutcome(target, abilityOutcome({ save: { success }, onFail: flag.onFail }));
}

/**
 * GM: apply the failure effect to a target without a roll (it did not resist or was helpless).
 * @param {ChatMessage} message
 * @param {{actorUuid: string, tokenUuid: string}} dataset
 */
export async function applyAbility(message, { actorUuid, tokenUuid }) {
  if (!game.user.isGM) return requestGm("ability", { messageId: message.id, actorUuid, tokenUuid });
  const flag = message.getFlag("dtd40k", "ability");
  const target = await foundry.utils.fromUuid(actorUuid);
  if (flag && target) await applyOutcome(target, abilityOutcome({ save: { success: false }, onFail: flag.onFail }));
}

/**
 * Apply a failure: condition (with its rounds) and Fatigue. Damage on a failure is shown on the card for the GM (no
 * compendium ability has one).
 * @param {Actor} target
 * @param {object|null} outcome
 */
async function applyOutcome(target, outcome) {
  if (!outcome) {
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>${format("DTD.Npc.Resisted", { name: target.name })}</p>` });
    return;
  }
  if (outcome.condition) await toggleCondition(target, outcome.condition, { active: true, rounds: outcome.rounds || null });
  if (outcome.fatigue) await addFatigue(target, outcome.fatigue);
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>${format("DTD.Npc.Affected", { name: target.name, effect: failureText({ ...outcome, damage: outcome.damage ?? {} }) })}</p>` });
}
