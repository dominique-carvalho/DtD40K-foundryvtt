import { CUSTOMIZATION, SHIP_DEPARTMENTS, SHIP_NPC_KEPT, SHIP_WEAPON_TYPES } from "../config.mjs";
import { rng } from "../dice/roll-service.mjs";
import { rollAndKeep } from "../rules/dice.mjs";
import { normalizePool } from "../rules/pool.mjs";
import { fieldRepair as fieldRepairPool } from "../rules/ship.mjs";

/**
 * Ships out of combat: building by drop with warnings, officers, customization, hangar, repairs and port services
 * (spec 014, US2/US4; research R2, R11, R12). Contract: specs/014-ships/contracts/foundry-api.md ("ship-service").
 */

const CARD_TEMPLATE = "systems/dtd40k/templates/chat/vehicle-card.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
const components = (ship, category) => ship.items.filter((i) => i.type === "shipComponent" && i.system.category === category);

/**
 * Post a ship chat card (the vehicle card layout of spec 013).
 * @param {Actor} ship
 * @param {{title: string, subtitle?: string, lines?: object[], buttons?: object[], flags?: object}} card
 */
export async function postShipCard(ship, { title, subtitle = "", lines = [], buttons = [], flags = {} }) {
  const content = await foundry.applications.handlebars.renderTemplate(CARD_TEMPLATE, { title, subtitle, lines, buttons });
  return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: ship }), content, flags: { dtd40k: { ship: { uuid: ship.uuid }, ...flags } } });
}

/** Notify the build warnings of the ship (FR-004): never blocks. */
export function warnBuild(ship) {
  for (const key of ship.system.warnings) {
    if (key === "missingOfficers" || key === "printedCost") continue;
    ui.notifications.warn(format(`DTD.Ship.Warn.${key.replace(".", "_")}`, { spent: ship.system.bp.spent, budget: ship.system.bp.budget }));
  }
}

/**
 * The actor of an officer post: a linked actor, or the only token of an unlinked one on the scene (as the crew of
 * spec 013).
 * @param {string} uuid
 * @returns {Actor|null}
 */
export function officerActor(uuid) {
  const actor = uuid ? foundry.utils.fromUuidSync(uuid) ?? null : null;
  if (!actor || actor.isToken || actor.prototypeToken?.actorLink) return actor;
  const tokens = canvas?.scene?.tokens.filter((t) => t.actorId === actor.id && !t.actorLink) ?? [];
  return tokens.length === 1 ? tokens[0].actor : actor;
}

/**
 * Dice kept for a department (p. 403): the dots of the officer holding its post in the skill, 4 for an NPC officer,
 * 1 when the post is empty.
 * @param {Actor} ship
 * @param {string} department  SHIP_DEPARTMENTS key
 * @param {string} [skill]  defaults to the department's skill
 * @returns {{kept: number, name: string, actor: Actor|null, empty: boolean}}
 */
export function officerKept(ship, department, skill) {
  const post = SHIP_DEPARTMENTS[department]?.post;
  const item = components(ship, "officer").find((i) => i.system.officer.post === post);
  const key = skill ?? SHIP_DEPARTMENTS[department]?.skill;
  if (!item) return { kept: 1, name: "", actor: null, empty: true };
  const actor = officerActor(item.system.officer.actorUuid);
  const kept = actor ? actor.system.skills?.[key]?.value ?? 0 : SHIP_NPC_KEPT;
  return { kept: Math.max(1, kept), name: actor?.name ?? item.name, actor, empty: false };
}

/**
 * The officer holding a post, by post key.
 * @param {Actor} ship
 * @param {string} post
 */
export function officerOf(ship, post) {
  const item = components(ship, "officer").find((i) => i.system.officer.post === post);
  return item ? { item, actor: officerActor(item.system.officer.actorUuid) } : null;
}

/**
 * Weapon type and mount of a weapon being installed.
 * @param {object} data
 * @returns {Promise<{typeKey: string, mount: string}|null>}
 */
async function promptWeapon(data) {
  const types = Object.keys(SHIP_WEAPON_TYPES).map((k) => `<option value="${k}" ${k === data.system.weapon.typeKey ? "selected" : ""}>${localize(`DTD.Ship.WeaponType.${k}`)}</option>`).join("");
  const mounts = ["forward", "rear"].map((k) => `<option value="${k}" ${k === data.system.weapon.mount ? "selected" : ""}>${localize(`DTD.Ship.Mount.${k}`)}</option>`).join("");
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: data.name }, classes: ["dtd40k"], position: { width: 360 }, rejectClose: false,
    content: `<div class="form-group"><label>${localize("DTD.Ship.WeaponTypeLabel")}</label><select name="typeKey">${types}</select></div>
      <div class="form-group"><label>${localize("DTD.Ship.MountLabel")}</label><select name="mount">${mounts}</select></div>`,
    buttons: [
      { action: "ok", label: "DTD.Ship.Install", icon: "fa-solid fa-screwdriver-wrench", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  return choice && typeof choice === "object" ? choice : null;
}

/**
 * Install a dropped component (FR-003/FR-004): a hull or a shield replaces the old one (and fills Hull or Capacity);
 * a weapon asks its type and mount; Hardened Armor and torpedo sets add up; weapon types are chosen on the weapon.
 * Warnings for BP, slots and limits, never a block.
 * @param {Actor} ship
 * @param {object} data  item data
 * @returns {Promise<Item|null>}
 */
export async function addComponent(ship, data) {
  if (!ship.isOwner) return null;
  const c = data.system.category;
  data = foundry.utils.deepClone(data);
  let item = null;
  if (c === "weaponType") {
    ui.notifications.warn(localize("DTD.Ship.TypeOnWeapon"));
    return null;
  }
  if (c === "hull" || c === "customHull" || c === "shield") {
    const old = ship.items.filter((i) => i.type === "shipComponent" && (c === "shield" ? i.system.category === "shield" : ["hull", "customHull"].includes(i.system.category)));
    if (old.length) await ship.deleteEmbeddedDocuments("Item", old.map((i) => i.id));
  }
  if (c === "weapon") {
    const choice = await promptWeapon(data);
    if (!choice) return null;
    data.system.weapon.typeKey = choice.typeKey;
    data.system.weapon.mount = choice.mount;
  }
  if (c === "officer") {
    const taken = components(ship, "officer").find((i) => i.system.officer.post === data.system.officer.post);
    if (taken) {
      ui.notifications.warn(format("DTD.Ship.PostTaken", { post: localize(`DTD.Ship.Post.${data.system.officer.post}`) }));
      return null;
    }
  }
  if (c === "console" || c === "torpedo") {
    const same = components(ship, c).find((i) => i.name === data.name);
    if (same) {
      if (c === "console" && !same.system.automation?.stackable) ui.notifications.warn(format("DTD.Ship.NotRepeatable", { name: data.name }));
      await same.update({ "system.quantity": same.system.quantity + (c === "torpedo" ? 5 : 1) });
      item = same;
    }
  }
  if (!item) [item] = await ship.createEmbeddedDocuments("Item", [data]);
  if (c === "hull" || c === "customHull") await ship.update({ "system.hull.value": ship.system.hull.max, "system.hull.temp": 0 });
  if (c === "shield") await resetShield(ship);
  warnBuild(ship);
  return item;
}

/**
 * Fill the shield (a new shield, a full repair): full Capacity, no Disruption; Multiphasic layers rebuilt.
 * @param {Actor} ship
 */
export async function resetShield(ship) {
  const s = ship.system.shield;
  const layers = s.layerCount ? Array.from({ length: s.layerCount }, () => ({ value: s.max, disruption: 0 })) : [];
  await ship.update({ "system.shield.value": s.layerCount ? 0 : s.max, "system.shield.disruption": 0, "system.shield.collapsed": false, "system.shield.layers": layers });
}

/**
 * Put a character or NPC on an officer post (a character's dots are then kept for its department).
 * @param {Actor} ship
 * @param {string} itemId
 * @param {Actor|null} actor  null clears the post (NPC officer)
 */
export async function assignOfficer(ship, itemId, actor) {
  const item = ship.items.get(itemId);
  if (!item || !ship.isOwner) return;
  await item.update({ "system.officer.actorUuid": actor?.uuid ?? "" });
}

/**
 * Buy or refund a customization of a custom hull (p. 393); limits warn only.
 * @param {Actor} ship
 * @param {string} key  CUSTOMIZATION key
 * @param {number} delta
 */
export async function setUpgrade(ship, key, delta) {
  if (!CUSTOMIZATION[key] || !ship.isOwner) return;
  const n = Math.max(0, (ship.system.custom.upgrades[key] ?? 0) + delta);
  await ship.update({ [`system.custom.upgrades.${key}`]: n });
  warnBuild(ship);
}

/**
 * Split the non-universal console slots of a custom hull among the four console types.
 * @param {Actor} ship
 * @param {string} type
 * @param {number} n
 */
export async function setNonUniversal(ship, type, n) {
  if (!ship.isOwner) return;
  await ship.update({ [`system.custom.nonUniversal.${type}`]: Math.max(0, Number(n) || 0) });
  warnBuild(ship);
}

/**
 * Carry a vehicle (spec 013) aboard: a reference with a link; the vehicle itself is not changed.
 * @param {Actor} ship
 * @param {Actor} vehicle
 */
export async function addToHangar(ship, vehicle) {
  if (!ship.isOwner || vehicle?.type !== "vehicle" || ship.system.hangar.includes(vehicle.uuid)) return;
  await ship.update({ "system.hangar": [...ship.system.hangar, vehicle.uuid] });
}

/** Take a vehicle off the hangar list (the vehicle is not deleted). */
export async function removeFromHangar(ship, uuid) {
  if (!ship.isOwner) return;
  await ship.update({ "system.hangar": ship.system.hangar.filter((u) => u !== uuid) });
}

/**
 * Field repairs (p. 410): the Chief Engineer tests Crafts at TN 25, once per stock of supplies; success restores 1k1
 * Hull plus 1k1 per raise and clears every damaged component and lasting critical.
 * @param {Actor} ship
 */
export async function fieldRepair(ship) {
  if (!ship.isOwner) return null;
  if (ship.system.state.suppliesUsed) {
    ui.notifications.warn(format("DTD.Ship.NoSupplies", { name: ship.name }));
    return null;
  }
  const engineer = officerOf(ship, "chiefEngineer");
  if (!engineer) ui.notifications.warn(localize("DTD.Ship.NoChiefEngineer"));
  const kept = officerKept(ship, "engineering", "crafts");
  let outcome;
  if (kept.actor) {
    const message = await kept.actor.rollSkill("crafts", { fastForward: true, tn: 25, label: `${localize("DTD.Ship.FieldRepair")} — ${ship.name}` });
    outcome = message?.getFlag("dtd40k", "test")?.outcome ?? null;
  } else {
    const { rollShipPool } = await import("./ship-combat-service.mjs");
    // An NPC officer tests with 4 in skill and characteristic; an empty post with 1.
    const message = await rollShipPool(ship, { pool: { rolled: 2 * kept.kept, kept: kept.kept, flat: 0 }, tn: 25, label: `${localize("DTD.Ship.FieldRepair")} — ${ship.name}` });
    outcome = message?.getFlag("dtd40k", "test")?.outcome ?? null;
  }
  const update = { "system.state.suppliesUsed": true };
  const lines = [];
  if (outcome?.success) {
    const pool = fieldRepairPool(outcome.raises);
    const hull = rollAndKeep(normalizePool(pool), { rng }).total;
    Object.assign(update, {
      "system.hull.value": Math.min(ship.system.hull.max, ship.system.hull.value + hull),
      "system.state.crits": [], "system.state.disabled": []
    });
    lines.push({ text: format("DTD.Ship.FieldRepaired", { hull, dice: `${pool.rolled}k${pool.kept}` }) });
  } else lines.push({ warning: true, text: localize("DTD.Ship.FieldRepairFailed") });
  await ship.update(update);
  return postShipCard(ship, { title: `${localize("DTD.Ship.FieldRepair")} — ${ship.name}`, subtitle: kept.name, lines });
}

/**
 * Port services (p. 410), run by the GM: Full Repair (full Hull, no lasting effects, shield refilled), Recruit Crew
 * (every lost Crew replaced) or Resupply (supplies and torpedo sets refilled). The time depends on the Background.
 * @param {Actor} ship
 * @param {"fullRepair"|"recruitCrew"|"resupply"} kind
 */
export async function portService(ship, kind) {
  if (!game.user.isGM) return null;
  if (kind === "fullRepair") {
    await ship.update({ "system.hull.value": ship.system.hull.max, "system.hull.temp": 0, "system.state.crits": [], "system.state.disabled": [], "system.state.destroyed": false });
    await resetShield(ship);
  } else if (kind === "recruitCrew") {
    await ship.update({ "system.crew.lost": 0 });
  } else if (kind === "resupply") {
    await ship.update({ "system.state.suppliesUsed": false });
  }
  return postShipCard(ship, { title: `${localize(`DTD.Ship.Port.${kind}`)} — ${ship.name}`, lines: [{ text: localize(`DTD.Ship.PortDone.${kind}`) }, { text: localize("DTD.Ship.PortTime") }] });
}

/**
 * New scene or end of combat: temporary Crew and this round's effects end; Crew committed and fighters in the air
 * return.
 * @param {Actor} ship
 */
export async function newScene(ship) {
  await ship.update({
    "system.crew.temp": 0, "system.crew.committed": 0, "system.crew.committedRound": 0, "system.hull.temp": 0,
    ...Object.fromEntries(ROUND_KEYS.map((k) => [`system.state.round.${k}`, null]))
  });
}

/**
 * Keys of `state.round` that last a round or a scene (Picard Speech is once per session and stays until the GM
 * clears it).
 */
export const ROUND_KEYS = ["ablative", "braced", "micromanage", "overchargeWeapons", "overchargeEngines", "augury", "silentRunning", "jamming", "picard", "cycleShields", "rebootShields"];
