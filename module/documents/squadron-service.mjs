import { postTest, rng } from "../dice/roll-service.mjs";
import { runTest } from "../rules/test.mjs";
import { SHIP_ACTIONS, fighterDamage, fighterPool } from "../rules/ship.mjs";
import { officerKept, postShipCard } from "./ship-service.mjs";

/**
 * Fightercraft (spec 014, US4; research R7; p. 407): a Fighter Bay turns 1–10 committed Crew into a squadron token
 * next to the ship; the squadron attacks with one die per craft keeping the Tactical Officer's Ballistics; every hit
 * on it downs one craft (its Crew is lost); docking returns the Crew of the craft left.
 * Contract: specs/014-ships/contracts/foundry-api.md ("squadron-service").
 */

const EXTRA_TEMPLATE = "systems/dtd40k/templates/chat/ship-extra.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);

/** The squadron actor of a ship, if it was ever launched. */
const squadronOf = (ship) => game.actors.find((a) => a.type === "squadron" && a.system.shipUuid === ship.uuid) ?? null;

/**
 * Deploy Fightercraft (Tactical, p. 405): needs a Fighter Bay; the Crew committed become craft of the ship's squadron,
 * placed next to the ship's token.
 * @param {Actor} ship
 * @param {number} [count]  skips the dialog
 */
export async function deploy(ship, count) {
  if (!ship.isOwner) return null;
  const bay = ship.items.some((i) => i.type === "shipComponent" && i.system.automation?.key === "fighterBay" && !ship.system.state.disabled.includes(i.id));
  if (!bay) {
    ui.notifications.warn(format("DTD.Ship.NoFighterBay", { name: ship.name }));
    return null;
  }
  const { takeShipAction } = await import("./ship-combat-service.mjs");
  let n = count;
  if (!n) {
    const max = Math.min(10, ship.system.crew.available);
    const choice = await foundry.applications.api.DialogV2.wait({
      window: { title: `${localize("DTD.Ship.DeployFighters")} — ${ship.name}` }, classes: ["dtd40k"], rejectClose: false,
      content: `<div class="form-group"><label>${localize("DTD.Ship.Fighters")}</label><input type="number" name="n" value="${max}" min="1" max="${max}"></div>`,
      buttons: [
        { action: "ok", label: "DTD.Ship.DeployFighters", icon: "fa-solid fa-jet-fighter", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
        { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
      ]
    });
    if (!choice || typeof choice !== "object") return null;
    n = Number(choice.n) || 0;
  }
  const existing = squadronOf(ship);
  n = Math.max(1, Math.min(n, ship.system.crew.available, 10 - (existing?.system.count ?? 0)));
  if (n < 1 || ship.system.crew.available < 1) {
    ui.notifications.warn(format("DTD.Ship.Refused.noCrew", { name: ship.name, n: 1, available: ship.system.crew.available }));
    return null;
  }
  if (!(await takeShipAction(ship, SHIP_ACTIONS.find((a) => a.key === "deployFightercraft")))) return null;
  const squadron = existing ?? await Actor.create({
    name: format("DTD.Ship.SquadronName", { name: ship.name }), type: "squadron",
    system: { count: 0, shipUuid: ship.uuid }, prototypeToken: { actorLink: true, disposition: ship.prototypeToken.disposition }, ownership: ship.ownership
  });
  await squadron.update({ "system.count": squadron.system.count + n });
  await ship.update({ "system.crew.deployed": ship.system.crew.deployed + n });
  const shipToken = canvas?.scene?.tokens.find((t) => t.actor === ship);
  if (shipToken && !canvas.scene.tokens.some((t) => t.actor === squadron)) {
    const doc = await squadron.getTokenDocument({ x: shipToken.x + canvas.grid.size * (shipToken.width ?? 1), y: shipToken.y });
    await canvas.scene.createEmbeddedDocuments("Token", [doc.toObject()]);
  }
  return postShipCard(ship, { title: `${localize("DTD.Ship.DeployFighters")} — ${ship.name}`, lines: [{ text: format("DTD.Ship.FightersOut", { n, total: squadron.system.count }) }] });
}

/**
 * The squadron attacks the targeted ship or squadron: count k (the Tactical Officer's Ballistics) against its Static
 * Defense; a hit rolls XkX with X = half the squadron.
 * @param {Actor} squadron
 */
export async function squadronAttack(squadron) {
  if (!squadron.isOwner || squadron.system.count < 1) return null;
  const target = [...game.user.targets][0]?.actor ?? null;
  if (!target || !["ship", "squadron"].includes(target.type)) {
    ui.notifications.warn(localize("DTD.Ship.NeedTarget"));
    return null;
  }
  const ship = await foundry.utils.fromUuid(squadron.system.shipUuid);
  const ballistics = ship ? officerKept(ship, "tactical").kept : 1;
  const pool = fighterPool({ count: squadron.system.count, ballistics });
  const tn = target.system.derived.staticDefense;
  const testResult = runTest({ base: { rolled: pool.rolled, kept: pool.kept, flat: 0 }, tn, rng });
  const hit = Boolean(testResult.outcome?.success);
  const damage = fighterDamage(squadron.system.count);
  const extraContent = await foundry.applications.handlebars.renderTemplate(EXTRA_TEMPLATE, {
    lines: [{ text: hit ? format("DTD.Ship.FighterHit", { dice: `${damage.rolled}k${damage.kept}` }) : localize("DTD.Ship.Miss") }],
    buttons: hit ? [{ action: "shipDamage", icon: "fa-solid fa-burst", label: localize("DTD.Ship.RollDamage") }] : []
  });
  return postTest({
    actor: squadron, label: `${squadron.name} → ${target.name}`, testResult, extraContent,
    flags: { shipAttack: { shipUuid: squadron.uuid, targetUuid: target.uuid, weapons: [{ id: "", name: localize("DTD.Ship.Fighters"), profile: { kind: "array", dam: damage, dis: 0, acc: 0, crit: 0 }, torpedo: false }], total: testResult.total, tn, hit, subsystemId: "" } }
  });
}

/**
 * A hit on the squadron: one craft falls and its Crew is lost to the ship.
 * @param {Actor} squadron
 */
export async function downCraft(squadron) {
  if (squadron.system.count < 1) return null;
  const ship = await foundry.utils.fromUuid(squadron.system.shipUuid);
  await squadron.update({ "system.count": squadron.system.count - 1 });
  if (ship) await ship.update({ "system.crew.deployed": Math.max(0, ship.system.crew.deployed - 1), "system.crew.lost": ship.system.crew.lost + 1 });
  return postShipCard(squadron, { title: squadron.name, lines: [{ warning: true, text: format("DTD.Ship.CraftDown", { n: squadron.system.count }) }] });
}

/**
 * Dock the squadron: the Crew of the craft left return to the ship; the squadron tokens leave the scene.
 * @param {Actor} squadron
 */
export async function dock(squadron) {
  if (!squadron.isOwner) return null;
  const ship = await foundry.utils.fromUuid(squadron.system.shipUuid);
  const n = squadron.system.count;
  if (ship) await ship.update({ "system.crew.deployed": Math.max(0, ship.system.crew.deployed - n) });
  await squadron.update({ "system.count": 0 });
  const tokens = canvas?.scene?.tokens.filter((t) => t.actor === squadron).map((t) => t.id) ?? [];
  if (tokens.length) await canvas.scene.deleteEmbeddedDocuments("Token", tokens);
  return postShipCard(ship ?? squadron, { title: squadron.name, lines: [{ text: format("DTD.Ship.Docked", { n }) }] });
}
