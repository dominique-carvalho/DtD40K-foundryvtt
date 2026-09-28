import { postTest, rng } from "../dice/roll-service.mjs";
import { rollAndKeep } from "../rules/dice.mjs";
import { formatPool, normalizePool } from "../rules/pool.mjs";
import { runTest } from "../rules/test.mjs";
import {
  BOMBARD_TORPEDOES, SHIP_ACTIONS, WARP_VOYAGE, bombardScatter, shipPool, warpCourse, warpEncounter,
  warpEncounterModifier, warpPerilous, warpSteer, warpVoyage
} from "../rules/ship.mjs";
import { officerKept, officerOf, postShipCard } from "./ship-service.mjs";

/**
 * Warp travel and surface bombardment (spec 014, US4; research R9, R10; pp. 410–413).
 * Contract: specs/014-ships/contracts/foundry-api.md ("warp-service").
 */

const CARD_TEMPLATE = "systems/dtd40k/templates/chat/vehicle-card.hbs";
const DAMAGE_TEMPLATE = "systems/dtd40k/templates/chat/damage-card.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
const consoleKey = (ship, key) => ship.items.some((i) => i.type === "shipComponent" && i.system.automation?.key === key && !ship.system.state.disabled.includes(i.id));
const d = (faces) => Math.floor(rng() * faces) + 1;

/**
 * An officer's test for a Warp step: the character's skill (with a characteristic when given) and the ship's stat as
 * a bonus; an NPC officer with 4 and 4; an empty post with 1 and 1.
 */
async function officerTest(ship, { post, skill, characteristic, flat = 0, tn, label }) {
  const holder = officerOf(ship, post);
  if (holder?.actor) return holder.actor.rollSkill(skill, { fastForward: true, tn, characteristic, modifiers: { flat }, label });
  const n = holder ? 4 : 1;
  const testResult = runTest({ base: { rolled: 2 * n, kept: n, flat }, tn, rng });
  return postTest({ actor: ship, label, testResult });
}

/** Render the voyage card from its state. */
async function voyageContent(w) {
  const lines = w.log.map((text) => ({ text }));
  const buttons = w.done ? [] : [{ action: "warpStep", icon: "fa-solid fa-hurricane", label: localize(`DTD.Ship.WarpStep${w.step}`) }];
  return foundry.applications.handlebars.renderTemplate(CARD_TEMPLATE, {
    title: `${localize("DTD.Ship.WarpVoyage")} — ${w.shipName}`,
    subtitle: `${WARP_VOYAGE[w.distance].distance} · TN ${WARP_VOYAGE[w.distance].tn}${w.relay ? ` · ${localize("DTD.Ship.PortalRelay")}` : ""}`,
    lines, buttons
  });
}

/**
 * Start a voyage (p. 411): checks the Navigator (1 dot in Divination) and posts the voyage card.
 * @param {Actor} ship
 * @param {{distance: string, relay: boolean}} options
 */
export async function startVoyage(ship, { distance = "moderate", relay = false } = {}) {
  if (!ship.isOwner) return null;
  const log = [];
  const navigator = officerOf(ship, "navigator");
  const divination = navigator?.actor?.system.magic?.schools?.divination?.value;
  if (!navigator) log.push(localize("DTD.Ship.NoNavigator"));
  else if (navigator.actor && !(divination >= 1)) log.push(localize("DTD.Ship.NavigatorNoDivination"));
  if (log.length) ui.notifications.warn(log.join(" "));
  const w = { shipUuid: ship.uuid, shipName: ship.name, distance: WARP_VOYAGE[distance] ? distance : "moderate", relay: Boolean(relay), step: relay ? 2 : 1, modifier: 0, done: false, log };
  if (relay) log.push(localize("DTD.Ship.PortalAuto"));
  return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: ship }), content: await voyageContent(w), flags: { dtd40k: { warp: w } } });
}

/**
 * Roll the current step of a voyage card: 1 open the portal (Chief Arcana Officer, Arcana TN 20); 2 chart the course
 * (Navigator, Arcana + Wisdom + Sensors TN 25); 3 steer (Helmsman, Pilot vs the distance TN, with step 2's modifier),
 * then the encounter.
 * @param {ChatMessage} message
 */
export async function warpStep(message) {
  const w = foundry.utils.deepClone(message.getFlag("dtd40k", "warp"));
  const ship = w ? await foundry.utils.fromUuid(w.shipUuid) : null;
  if (!ship?.isOwner || w.done) return;
  const sensors = ship.system.stats.sensors;
  if (w.step === 1) {
    const roll = await officerTest(ship, { post: "chiefArcanaOfficer", skill: "arcana", tn: 20, label: `${localize("DTD.Ship.WarpStep1")} — ${ship.name}` });
    const ok = roll?.getFlag("dtd40k", "test")?.outcome?.success;
    w.log.push(ok ? localize("DTD.Ship.PortalOpen") : localize("DTD.Ship.PortalFailed"));
    if (ok) w.step = 2;
  } else if (w.step === 2) {
    const roll = await officerTest(ship, { post: "navigator", skill: "arcana", characteristic: "wis", flat: sensors, tn: 25, label: `${localize("DTD.Ship.WarpStep2")} — ${ship.name}` });
    const outcome = roll?.getFlag("dtd40k", "test")?.outcome ?? { success: false, raises: 0 };
    w.modifier = warpCourse(outcome);
    w.log.push(format("DTD.Ship.CourseCharted", { modifier: w.modifier >= 0 ? `+${w.modifier}` : w.modifier }));
    w.step = 3;
  } else {
    const voyage = warpVoyage(w.distance);
    const roll = await officerTest(ship, { post: "helmsman", skill: "pilot", flat: w.modifier, tn: voyage.tn, label: `${localize("DTD.Ship.WarpStep3")} — ${ship.name}` });
    const outcome = roll?.getFlag("dtd40k", "test")?.outcome ?? { success: false, raises: 0, checks: 0 };
    const steer = warpSteer({ outcome, relay: w.relay });
    const helm = consoleKey(ship, "ancientSpelljammingHelm");
    const divisor = steer.timeDivisor * (helm ? 2 : 1);
    w.log.push(format("DTD.Ship.VoyageTime", { warp: voyage.warpTime, real: voyage.realTime, mult: steer.timeMultiplier, div: divisor }));
    if (steer.offCourse) w.log.push(localize("DTD.Ship.OffCourse"));
    const mod = warpEncounterModifier({ chaplain: Boolean(officerOf(ship, "chaplain")), warpsbane: consoleKey(ship, "warpsbaneHull"), ancientHelm: helm, failed: !outcome.success });
    w.log.push(...(await encounter(ship, mod)));
    w.done = true;
  }
  await message.update({ content: await voyageContent(w), "flags.dtd40k.warp": w });
}

/**
 * Roll the encounter (p. 412): 1d10 + modifiers; 11+ is a perilous encounter (1d5) with its sub-tables; The Vanishing
 * takes its Crew.
 * @returns {Promise<string[]>} card lines
 */
async function encounter(ship, mod) {
  const d10 = d(10);
  const row = warpEncounter(d10 + mod);
  const out = [format("DTD.Ship.EncounterRoll", { d10, mod: mod >= 0 ? `+${mod}` : mod, name: row.name }), row.effect];
  if (row.mechanics.subtable) out.push(format("DTD.Ship.SubtableRoll", { value: row.mechanics.subtable[d(10) - 1] }));
  if (row.key === "theVanishing") {
    const n = d(5);
    await ship.update({ "system.crew.lost": ship.system.crew.lost + n });
    out.push(format("DTD.Ship.CrewLost", { n }));
  }
  if (row.key === "perilous") {
    const p = warpPerilous(d(5));
    out.push(`${p.name}: ${p.effect}`);
    if (p.mechanics.subtables) out.push(format("DTD.Ship.StrangerRoll", { source: p.mechanics.subtables.source[d(5) - 1], intent: p.mechanics.subtables.intent[d(5) - 1] }));
  }
  return out;
}

/**
 * Surface bombardment (p. 410): a Tactical action with committed Crew and the Tactical Officer's Ballistics at TN 30
 * (a torpedo may be spent); a miss scatters in a random direction by 1k1 km + 1k0 per check. The blast wave is a
 * personal-scale damage card (spec 008 Apply): 10k5+30 Explosive in 3 km, or the torpedo's variant.
 * @param {Actor} ship
 */
export async function bombard(ship) {
  if (!ship.isOwner) return null;
  const { commitShipCrew, takeShipAction } = await import("./ship-combat-service.mjs");
  const torpedoes = ship.items.filter((i) => i.type === "shipComponent" && i.system.category === "torpedo" && i.system.quantity > 0);
  const max = Math.min(10, ship.system.crew.available);
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: `${localize("DTD.Ship.Bombard")} — ${ship.name}` }, classes: ["dtd40k"], rejectClose: false,
    content: `<div class="form-group"><label>${localize("DTD.Ship.CrewCommitted")}</label><input type="number" name="crew" value="${max}" min="1" max="${max}"></div>
      <div class="form-group"><label>${localize("DTD.Ship.Torpedo")}</label><select name="torpedo"><option value="">—</option>${torpedoes.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}</select></div>`,
    buttons: [
      { action: "ok", label: "DTD.Ship.Bombard", icon: "fa-solid fa-meteor", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!choice || typeof choice !== "object") return null;
  const crew = Math.max(1, Math.min(max, Number(choice.crew) || 1));
  const action = { ...SHIP_ACTIONS.find((a) => a.key === "fireEverything"), name: localize("DTD.Ship.Bombard") };
  if (!(await takeShipAction(ship, action))) return null;
  if (!(await commitShipCrew(ship, crew))) return null;
  const torpedo = choice.torpedo ? ship.items.get(choice.torpedo) : null;
  if (torpedo) await torpedo.update({ "system.quantity": torpedo.system.quantity - 1 });
  const pool = shipPool({ crew, kept: officerKept(ship, "tactical").kept, stat: 0 });
  const roll = await postTest({ actor: ship, label: `${localize("DTD.Ship.Bombard")} — ${ship.name}`, testResult: runTest({ base: pool, tn: 30, rng }) });
  const outcome = roll.getFlag("dtd40k", "test").outcome;
  const lines = [];
  const torpKey = torpedo ? torpedo.name.replace(/ Torpedo$/, "").toLowerCase().replace(/-(\w)/g, (_, c) => c.toUpperCase()) : "";
  if (!outcome.success) {
    const scatter = bombardScatter(outcome.checks);
    const km = rollAndKeep(normalizePool(scatter), { rng }).total;
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    lines.push({ warning: true, text: format("DTD.Ship.Scatter", { km, dir: dirs[d(8) - 1], dice: `${scatter.rolled}k${scatter.kept}` }) });
    if (torpKey === "highAct") lines.push({ text: BOMBARD_TORPEDOES.highAct });
  }
  if (BOMBARD_TORPEDOES[torpKey] && torpKey !== "highAct") lines.push({ text: BOMBARD_TORPEDOES[torpKey] });
  lines.push({ text: localize("DTD.Ship.BlastWave") });
  await postShipCard(ship, { title: `${localize("DTD.Ship.Bombard")} — ${ship.name}`, lines });
  const blast = torpKey === "micro" ? { rolled: 8, kept: 4, flat: 0 } : { rolled: 10, kept: 5, flat: 30 };
  return postBlast(ship, blast);
}

/** The blast wave as a personal-scale damage card with the Apply of spec 008. */
async function postBlast(ship, pool) {
  const normalized = normalizePool(pool);
  const result = rollAndKeep(normalized, { rng });
  const content = await foundry.applications.handlebars.renderTemplate(DAMAGE_TEMPLATE, {
    label: format("DTD.Ship.BlastOf", { name: ship.name }), formula: formatPool(normalized), total: result.total,
    type: localize("DTD.DamageType.X"), pen: 0, location: localize("DTD.Location.body"), hits: 0, notes: [], proven: 0, volatile: false,
    dice: result.dice.map((die) => ({ total: die.total, kept: die.kept, exploded: die.chain.length > 1, chainText: die.chain.join(" + ") }))
  });
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: ship }), content,
    flags: { dtd40k: { damage: { total: result.total, pen: 0, type: "X", location: "body", tearing: false, unarmed: false, magic: false, resolve: {}, raises: 0, blast: 0 } } }
  });
}
