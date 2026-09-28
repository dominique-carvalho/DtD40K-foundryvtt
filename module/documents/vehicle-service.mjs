import { postTest, rng } from "../dice/roll-service.mjs";
import { rollAndKeep } from "../rules/dice.mjs";
import { defendedSd, stillHits } from "../rules/defense.mjs";
import { formatPool, normalizePool } from "../rules/pool.mjs";
import { resolveDamage } from "../rules/damage.mjs";
import { runTest } from "../rules/test.mjs";
import {
  STUNT_OPTIONS, VEHICLE_ACTIONS, controlTn, critCount, juryRigTemp, moveMomentum, outOfControl, punchIt as punchItMomentum,
  ramming, repairDays, repairDice, repairTn, stuntOption, vehicleCrit, vehicleHpAfter
} from "../rules/vehicle.mjs";
import { rollAttack } from "./attack-service.mjs";
import { takeAction } from "./turn-service.mjs";

/**
 * Vehicles in play: building by drop, crew, the vehicle actions through the crew's turn, Control Tests and Out of
 * Control, Ramming, Jury Rig, vehicle damage and criticals, explosions, repairs (spec 013, US2–US4; research R4/R5).
 * Contract: specs/013-vehicles/contracts/foundry-api.md ("vehicle-service").
 */

const CARD_TEMPLATE = "systems/dtd40k/templates/chat/vehicle-card.hbs";
const DAMAGE_TEMPLATE = "systems/dtd40k/templates/chat/damage-card.hbs";
const DEFENSE_TEMPLATE = "systems/dtd40k/templates/chat/defense.hbs";
const MOVE_TEMPLATE = "systems/dtd40k/templates/dialog/vehicle-move.hbs";
const REPAIR_TEMPLATE = "systems/dtd40k/templates/dialog/vehicle-repair.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
const vehicleAction = (key) => VEHICLE_ACTIONS.find((a) => a.key === key);
/** Components that a critical may knock offline (never control systems, p. 363). */
const OFFLINE_CATEGORIES = ["accessory", "accommodation", "modification", "weaponUpgrade"];

/** Current combat round, 0 outside combat. */
const currentRound = () => (game.combat?.started ? game.combat.round : 0);

/** Flaws and drive abilities of the vehicle, by automation key. */
const hasAutomation = (vehicle, test) => vehicle.items.some((i) => i.type === "vehicleComponent" && test(i.system.automation ?? {}));
const hasFlaw = (vehicle, flaw) => hasAutomation(vehicle, (a) => a.key === "flawed" && a.flaw === flaw);

/**
 * Post a vehicle chat card.
 * @param {Actor} vehicle
 * @param {{title: string, subtitle?: string, lines?: object[], buttons?: object[], flags?: object}} card
 */
async function postCard(vehicle, { title, subtitle = "", lines = [], buttons = [], flags = {} }) {
  const content = await foundry.applications.handlebars.renderTemplate(CARD_TEMPLATE, { title, subtitle, lines, buttons });
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: vehicle }), content,
    flags: { dtd40k: { vehicle: { uuid: vehicle.uuid }, ...flags } }
  });
}

/**
 * Crew of the vehicle with their actors.
 * @param {Actor} vehicle
 * @returns {{role: string, actorUuid: string, weaponIds: string[], actor: Actor|null}[]}
 */
export function crewOf(vehicle) {
  return vehicle.system.crew.map((c) => ({ ...c, actor: foundry.utils.fromUuidSync(c.actorUuid) ?? null }));
}

/** The pilot's actor, if any. */
export const pilotOf = (vehicle) => crewOf(vehicle).find((c) => c.role === "pilot")?.actor ?? null;

/**
 * The crew member who operates a weapon: the gunner it is assigned to, else the pilot.
 * @param {Actor} vehicle
 * @param {string} weaponId
 */
export function gunnerOf(vehicle, weaponId) {
  const crew = crewOf(vehicle);
  return crew.find((c) => c.weaponIds.includes(weaponId))?.actor ?? crew.find((c) => c.role === "pilot")?.actor ?? null;
}

/**
 * Vehicles in the world and on the current scene (unlinked tokens included).
 * @returns {Actor[]}
 */
export function allVehicles() {
  const found = new Map();
  for (const actor of game.actors.filter((a) => a.type === "vehicle")) found.set(actor.uuid, actor);
  for (const token of canvas?.scene?.tokens ?? []) if (token.actor?.type === "vehicle") found.set(token.actor.uuid, token.actor);
  return [...found.values()];
}

/** Vehicles whose pilot is this actor. */
export const vehiclesPilotedBy = (actor) => allVehicles().filter((v) => v.system.crew.some((c) => c.role === "pilot" && c.actorUuid === actor?.uuid));

/**
 * Check the vehicle state and spend the action from the acting crew member's turn (FR-007). Without a crew member
 * (the GM acting for the vehicle) nothing is tracked.
 * @param {Actor} vehicle
 * @param {string} key  VEHICLE_ACTIONS key
 * @param {Actor|null} actor
 * @param {{type?: string, move?: boolean}} [options]  type: override the action length; move: a movement action
 */
async function act(vehicle, key, actor, { type, move = false } = {}) {
  const state = vehicle.system.state;
  const round = currentRound();
  const base = vehicleAction(key);
  const action = type ? { ...base, type } : base;
  const refuse = (reason) => {
    ui.notifications.warn(format(`DTD.Vehicle.Refused.${reason}`, { name: vehicle.name }));
    return false;
  };
  if (state.destroyed) return refuse("destroyed");
  if (round && state.lockedUntil >= round && action.type !== "reaction") return refuse("locked");
  if (move && round && state.immobileUntil >= round) return refuse("immobile");
  if (move && state.flipped) return refuse("flipped");
  // A stalled engine allows only a Half Action (critical 2–3).
  if (state.stalled && action.type === "full") return refuse("stalled");
  if (!actor) return true;
  return takeAction(actor, action);
}

// ---------------------------------------------------------------------------------------------------------------
// Building and crew (US2)

/**
 * Add a dropped component or weapon (FR-005): repeatable components add to the quantity; a new frame or armor
 * replaces the old one; warns when the slots or the budget are exceeded.
 * @param {Actor} vehicle
 * @param {object} data  item data
 * @returns {Promise<Item|null>}
 */
export async function addComponent(vehicle, data) {
  if (!vehicle.isOwner) return null;
  let item = null;
  if (data.type === "vehicleComponent") {
    const category = data.system.category;
    if (category === "frame" || category === "armor") {
      const old = vehicle.items.filter((i) => i.type === "vehicleComponent" && i.system.category === category).map((i) => i.id);
      if (old.length) await vehicle.deleteEmbeddedDocuments("Item", old);
    }
    const same = category !== "drivetrain" && category !== "frame" && category !== "armor"
      && vehicle.items.find((i) => i.type === "vehicleComponent" && i.name === data.name);
    if (same) {
      await same.update({ "system.quantity": same.system.quantity + Math.max(1, data.system.quantity ?? 1) });
      item = same;
    }
  }
  if (!item) [item] = await vehicle.createEmbeddedDocuments("Item", [data]);
  const w = vehicle.system.warnings;
  if (w.overSlots) ui.notifications.warn(format("DTD.Vehicle.Warn.overSlots", { used: vehicle.system.slots.used, max: vehicle.system.slots.max }));
  if (w.overBudget) ui.notifications.warn(format("DTD.Vehicle.Warn.overBudget", { cost: vehicle.system.vp.cost, budget: vehicle.system.vp.budget }));
  return item;
}

/**
 * Put an actor in the crew with a role; there is one pilot, a previous pilot becomes a passenger.
 * @param {Actor} vehicle
 * @param {Actor} actor
 * @param {string} role
 */
export async function setCrew(vehicle, actor, role) {
  if (!vehicle.isOwner || !actor) return;
  const crew = vehicle.system.crew.map((c) => ({ ...c })).filter((c) => c.actorUuid !== actor.uuid);
  if (role === "pilot") for (const c of crew) if (c.role === "pilot") c.role = "passenger";
  const previous = vehicle.system.crew.find((c) => c.actorUuid === actor.uuid);
  crew.push({ role, actorUuid: actor.uuid, weaponIds: previous?.weaponIds ?? [] });
  await vehicle.update({ "system.crew": crew });
}

/**
 * Get in (Half Action of the crew member in combat, p. 361).
 * @param {Actor} vehicle
 * @param {Actor} actor
 * @param {string} role
 */
export async function embark(vehicle, actor, role) {
  if (!(await takeAction(actor, vehicleAction("vehicleEmbark")))) return;
  await setCrew(vehicle, actor, role);
  await postCard(vehicle, { title: vehicle.name, lines: [{ text: format("DTD.Vehicle.Embarked", { name: actor.name, role: localize(`DTD.Vehicle.Role.${role}`) }) }] });
}

/**
 * Get out (Half Action in combat).
 * @param {Actor} vehicle
 * @param {string} actorUuid
 */
export async function disembark(vehicle, actorUuid) {
  const actor = foundry.utils.fromUuidSync(actorUuid);
  if (actor && !(await takeAction(actor, vehicleAction("vehicleEmbark")))) return;
  await vehicle.update({ "system.crew": vehicle.system.crew.filter((c) => c.actorUuid !== actorUuid) });
  if (actor) await postCard(vehicle, { title: vehicle.name, lines: [{ text: format("DTD.Vehicle.Disembarked", { name: actor.name }) }] });
}

/**
 * Assign a mounted weapon to a crew member (or back to the pilot with an empty uuid).
 * @param {Actor} vehicle
 * @param {string} weaponId
 * @param {string} actorUuid
 */
export async function assignWeapon(vehicle, weaponId, actorUuid) {
  const crew = vehicle.system.crew.map((c) => ({ ...c, weaponIds: c.weaponIds.filter((id) => id !== weaponId) }));
  const target = crew.find((c) => c.actorUuid === actorUuid);
  if (target) target.weaponIds.push(weaponId);
  await vehicle.update({ "system.crew": crew });
}

/**
 * Switch the active drivetrain (Half Action of the pilot; a Reaction with Mobile Decouplers, p. 375).
 * @param {Actor} vehicle
 * @param {string} itemId
 */
export async function switchDrive(vehicle, itemId) {
  const drive = vehicle.items.get(itemId);
  if (!drive || drive.system.category !== "drivetrain" || vehicle.system.drive.id === itemId) return;
  const decouplers = hasAutomation(vehicle, (a) => a.swapDrivetrain === "reaction");
  if (!(await act(vehicle, "vehicleSwitchDrive", pilotOf(vehicle), { type: decouplers ? "reaction" : undefined }))) return;
  await vehicle.update({ "system.activeDrive": itemId });
  await postCard(vehicle, {
    title: vehicle.name,
    lines: [{ text: format("DTD.Vehicle.DriveSwitched", { drive: drive.name, rating: vehicle.system.drive.rating, skill: localize(CONFIG.DTD.SKILLS[vehicle.system.drive.controlSkill]?.label ?? "") }) }]
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Movement (US3, US4 stunts)

/**
 * Move / Punch It dialog: Momentum change, Punch It mode, stunt dice and option (p. 362).
 * @param {Actor} vehicle
 * @param {boolean} punchIt
 * @returns {Promise<{mode: string, delta: number, stunt: number, option: string}|null>}
 */
async function promptMove(vehicle, punchIt) {
  const system = vehicle.system;
  const content = await foundry.applications.handlebars.renderTemplate(MOVE_TEMPLATE, {
    punchIt, momentum: system.momentum, maxMomentum: system.maxMomentum, boostGain: 1 + system.acceleration,
    stunts: STUNT_OPTIONS.map((key) => ({ key, label: localize(`DTD.Vehicle.Stunt.${key}.label`), hint: localize(`DTD.Vehicle.Stunt.${key}.hint`) }))
  });
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: `${vehicle.name} — ${localize(punchIt ? "DTD.Vehicle.PunchIt" : "DTD.Vehicle.Move")}` },
    classes: ["dtd40k"], position: { width: 400 }, content, rejectClose: false,
    buttons: [
      { action: "go", label: "DTD.Vehicle.Go", icon: "fa-solid fa-gauge-high", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!choice || typeof choice !== "object") return null;
  return { mode: choice.mode ?? "", delta: Number(choice.delta) || 0, stunt: Number(choice.stunt) || 0, option: choice.option ?? "" };
}

/**
 * Barrel Roll (p. 362): one extra Reaction for the pilot until the start of their next turn.
 * @param {Actor} pilot
 */
async function barrelRoll(pilot) {
  if (!pilot) return;
  const combatant = game.combat?.started ? game.combat.combatants.find((c) => c.actor === pilot) : null;
  await pilot.createEmbeddedDocuments("ActiveEffect", [{
    name: localize("DTD.Vehicle.Stunt.barrelRoll.label"), img: "icons/svg/wing.svg",
    changes: [{ key: "system.modifiers.combat.reactions", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "1" }],
    flags: { dtd40k: { untilTurnOf: combatant?.id ?? null } }
  }]);
}

/**
 * Move or Punch It (pp. 360, 362): Momentum, the reach of the move on the chat card, the stunt option, and the
 * Overheating flaw (1 HP when Momentum is over 6 or Punch It is used).
 * @param {Actor} vehicle
 * @param {{punchIt?: boolean, mode?: string, delta?: number, stunt?: number, option?: string}|null} [preset]  skips the dialog
 * @param {boolean} [punchIt]
 */
async function drive(vehicle, preset, punchIt) {
  const system = vehicle.system;
  const pilot = pilotOf(vehicle);
  const inefficient = hasFlaw(vehicle, "inefficientControls");
  if (punchIt && inefficient) {
    ui.notifications.warn(format("DTD.Vehicle.Refused.noPunchIt", { name: vehicle.name }));
    return null;
  }
  // Untrained piloting (p. 363): an advanced control skill cannot be used; a basic one only allows a Full-Action Move.
  let type;
  if (pilot) {
    const key = system.drive.controlSkill;
    const trained = (pilot.system.skills?.[key]?.value ?? 0) > 0;
    if (!trained && CONFIG.DTD.SKILLS[key]?.advanced) {
      ui.notifications.warn(format("DTD.Vehicle.Refused.untrained", { name: pilot.name }));
      return null;
    }
    if (!trained && punchIt) {
      ui.notifications.warn(format("DTD.Vehicle.Refused.untrainedPunchIt", { name: pilot.name }));
      return null;
    }
    if (!trained || inefficient) type = "full";
  } else if (inefficient) type = "full";
  const choice = preset ?? (await promptMove(vehicle, punchIt));
  if (!choice) return null;
  if (!(await act(vehicle, punchIt ? "vehiclePunchIt" : "vehicleMove", pilot, { type, move: true }))) return null;

  const before = system.momentum;
  const max = system.maxMomentum;
  const momentum = punchIt
    ? punchItMomentum({ momentum: before, acceleration: system.acceleration, mode: choice.mode || "boost", delta: choice.delta, max })
    : moveMomentum({ momentum: before, delta: choice.delta, max });
  const update = { "system.momentum": momentum, "system.state.lastMoveRound": currentRound() };
  const lines = [
    { label: localize("DTD.Vehicle.Momentum"), text: `${before} → ${momentum}` },
    { label: localize("DTD.Vehicle.Reach"), text: format("DTD.Vehicle.ReachText", { meters: system.speed * system.drive.rating * momentum, arc: punchIt && choice.mode === "drift" ? 360 : 180 }) }
  ];
  if (system.drive.flying && momentum < system.drive.minMomentum) lines.push({ warning: true, text: format("DTD.Vehicle.BelowFlightMomentum", { min: system.drive.minMomentum }) });
  if (hasFlaw(vehicle, "overheating") && (momentum > 6 || punchIt)) {
    const after = vehicleHpAfter({ hpLoss: 1, hp: system.hp.value, temp: system.hp.temp });
    Object.assign(update, { "system.hp.value": after.hp, "system.hp.temp": after.temp, "system.state.destroyed": after.destroyed });
    lines.push({ warning: true, text: localize("DTD.Vehicle.Overheated") });
  }
  const option = stuntOption(choice.stunt, choice.option);
  if (choice.stunt) lines.push({ label: localize("DTD.Vehicle.StuntDice"), text: option ? localize(`DTD.Vehicle.Stunt.${option}.label`) : format("DTD.Vehicle.StuntBonus", { dice: choice.stunt }) });
  if (option) lines.push({ text: localize(`DTD.Vehicle.Stunt.${option}.hint`) });
  await vehicle.update(update);
  if (option === "barrelRoll") await barrelRoll(pilot);
  return postCard(vehicle, { title: `${vehicle.name} — ${localize(punchIt ? "DTD.Vehicle.PunchIt" : "DTD.Vehicle.Move")}`, subtitle: pilot?.name ?? "", lines });
}

/** Move (Half Action, p. 360). */
export const move = (vehicle, preset = null) => drive(vehicle, preset, false);
/** Punch It (Full Action, p. 360). */
export const punchIt = (vehicle, preset = null) => drive(vehicle, preset, true);

/**
 * End of the pilot's turn: without a Move or Punch It this round, Momentum drops to 0 (p. 360). Active GM only.
 * @param {Combat} combat
 * @param {Actor} pilot
 */
export async function endOfPilotTurn(combat, pilot) {
  for (const vehicle of vehiclesPilotedBy(pilot)) {
    const s = vehicle.system;
    if (s.momentum > 0 && s.state.lastMoveRound !== combat.round) {
      await vehicle.update({ "system.momentum": 0 });
      await postCard(vehicle, { title: vehicle.name, lines: [{ text: localize("DTD.Vehicle.MomentumLost") }] });
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Control Tests (US3)

/**
 * Roll the pilot's control skill + Maneuver (p. 359); without a pilot the GM enters the pool. Unstable: 2 checks.
 * @param {Actor} vehicle
 * @param {{tn: number|null, label: string}} options
 * @returns {Promise<ChatMessage|null>}
 */
async function controlRoll(vehicle, { tn, label }) {
  const system = vehicle.system;
  const flat = system.maneuver - (hasFlaw(vehicle, "unstable") ? 10 : 0);
  const pilot = pilotOf(vehicle);
  if (pilot) return pilot.rollSkill(system.drive.controlSkill, { fastForward: true, tn, modifiers: { flat }, label });
  const pool = await foundry.applications.api.DialogV2.wait({
    window: { title: label }, classes: ["dtd40k"], position: { width: 340 }, rejectClose: false,
    content: `<p class="hint">${localize("DTD.Vehicle.NoPilotPool")}</p><div class="form-group"><label>${localize("DTD.Vehicle.Pool")}</label><input type="number" name="rolled" value="3" min="1">k<input type="number" name="kept" value="3" min="1"></div>`,
    buttons: [
      { action: "roll", label: "DTD.Vehicle.Roll", icon: "fa-solid fa-dice-d10", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!pool || typeof pool !== "object") return null;
  const testResult = runTest({ base: { rolled: Number(pool.rolled) || 1, kept: Number(pool.kept) || 1 }, modifiers: { flat }, tn, rng });
  return postTest({ actor: vehicle, label, testResult });
}

/**
 * Control Test (FR-009): control skill + Maneuver against 5 × Momentum (Hover Drive: 2 more raises); a failure rolls
 * Out of Control.
 * @param {Actor} vehicle
 * @param {{reason?: string}} [options]
 */
export async function controlTest(vehicle, { reason = "" } = {}) {
  const system = vehicle.system;
  const tn = controlTn(system.momentum) + 5 * (Number(system.drive.automation?.controlTestExtraRaises) || 0);
  const label = `${localize("DTD.Vehicle.ControlTest")} — ${vehicle.name}${reason ? ` (${reason})` : ""}`;
  const message = await controlRoll(vehicle, { tn, label });
  const outcome = message?.getFlag("dtd40k", "test")?.outcome;
  if (outcome && !outcome.success) await rollOutOfControl(vehicle);
  return message;
}

/**
 * Out of Control (p. 359) and apply the row; a crash is an automatic 10 (p. 361). Turn Over: HP − Momentum, upside
 * down, Momentum 0. A flying vehicle also starts to fall (p. 362).
 * @param {Actor} vehicle
 * @param {{crash?: boolean}} [options]
 */
export async function rollOutOfControl(vehicle, { crash = false } = {}) {
  const system = vehicle.system;
  const d10 = crash ? 10 : Math.floor(rng() * 10) + 1;
  const row = outOfControl(d10);
  const lines = [{ label: `d10 ${d10}`, text: `${localize(`DTD.Vehicle.OutOfControlRow.${row.key}`)} — ${row.effect}` }];
  if (row.mechanics.flipped) {
    const after = vehicleHpAfter({ hpLoss: system.momentum, hp: system.hp.value, temp: system.hp.temp });
    await vehicle.update({
      "system.hp.value": after.hp, "system.hp.temp": after.temp, "system.momentum": 0,
      "system.state.flipped": true, "system.state.destroyed": system.state.destroyed || after.destroyed
    });
    lines.push({ warning: true, text: format("DTD.Vehicle.TurnedOver", { hp: system.momentum }) });
  }
  if (system.drive.flying && d10 > 4) lines.push({ warning: true, text: localize("DTD.Vehicle.FallNote") });
  return postCard(vehicle, { title: `${localize("DTD.Vehicle.OutOfControl")} — ${vehicle.name}`, lines });
}

/**
 * Evasive Maneuvers against an attack card (p. 361): the pilot's Reaction with Momentum 1+; half the control roll is
 * added to the vehicle's Static Defense against that attack.
 * @param {ChatMessage} message
 */
export async function evasive(message) {
  const attack = message.getFlag("dtd40k", "attack");
  const vehicle = attack?.targetUuid ? await foundry.utils.fromUuid(attack.targetUuid) : null;
  if (vehicle?.type !== "vehicle") return;
  const pilot = pilotOf(vehicle);
  if (!(pilot?.isOwner || (!pilot && vehicle.isOwner))) {
    ui.notifications.warn(localize("DTD.Combat.NotYourTarget"));
    return;
  }
  if (vehicle.system.momentum < 1) {
    ui.notifications.warn(format("DTD.Vehicle.Refused.noMomentum", { name: vehicle.name }));
    return;
  }
  if (!(await act(vehicle, "vehicleEvasive", pilot))) return;
  const roll = await controlRoll(vehicle, { tn: null, label: `${localize("DTD.Vehicle.Evasive")} — ${vehicle.name}` });
  const total = roll?.getFlag("dtd40k", "test")?.total;
  if (total === undefined) return;
  const sd = defendedSd(attack.tn ?? vehicle.system.derived.staticDefense, total);
  const hits = stillHits({ attackTotal: attack.total, sd, requiredRaises: attack.requiredRaises });
  const content = await foundry.applications.handlebars.renderTemplate(DEFENSE_TEMPLATE, {
    name: vehicle.name, kind: localize("DTD.Vehicle.Evasive"), total, bonus: Math.floor(total / 2), sd, hits
  });
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: vehicle }), content });
  if (game.user.isGM || message.isOwner) await message.setFlag("dtd40k", "defense", { kind: "evasive", total, sd, hits });
}

// ---------------------------------------------------------------------------------------------------------------
// Weapons and collisions (US3)

/**
 * Skirmish (one weapon, Half Action) or Barrage (two, Full Action) with the mounted weapons (p. 360; FR-008): the
 * attack uses the crew member's own skill without personal feats or bonuses (rollAttack with `vehicle`).
 * @param {Actor} vehicle
 * @param {string[]} weaponIds
 * @param {Actor} [gunner]  defaults to the crew member the first weapon is assigned to
 */
export async function fire(vehicle, weaponIds, gunner) {
  const ids = weaponIds.slice(0, 2).filter((id) => vehicle.items.get(id)?.type === "weapon");
  if (!ids.length) return;
  const offline = ids.find((id) => vehicle.system.state.disabled.includes(id));
  if (offline) {
    ui.notifications.warn(format("DTD.Vehicle.Refused.offline", { name: vehicle.items.get(offline).name }));
    return;
  }
  const shooter = gunner ?? gunnerOf(vehicle, ids[0]);
  if (!shooter) {
    ui.notifications.warn(format("DTD.Vehicle.Refused.noGunner", { name: vehicle.name }));
    return;
  }
  if (!shooter.isOwner) return;
  if (!(await act(vehicle, ids.length > 1 ? "vehicleBarrage" : "vehicleSkirmish", shooter))) return;
  for (const id of ids) await rollAttack(shooter, id, { weaponOwner: vehicle, vehicle: true });
}

/**
 * Roll a damage card with its Apply button, for Ramming and explosions.
 * @param {Actor} vehicle
 * @param {{label: string, pool: {rolled: number, kept: number, flat: number}, type: string, pen?: number, blast?: number, notes?: string[]}} damage
 */
async function postDamage(vehicle, { label, pool, type, pen = 0, blast = 0, notes = [] }) {
  const normalized = normalizePool(pool);
  const result = rollAndKeep(normalized, { rng });
  const content = await foundry.applications.handlebars.renderTemplate(DAMAGE_TEMPLATE, {
    label, formula: formatPool(normalized), total: result.total, type: localize(`DTD.DamageType.${type}`), pen,
    location: localize("DTD.Location.body"), hits: 0, notes, proven: 0, volatile: false,
    dice: result.dice.map((die) => ({ total: die.total, kept: die.kept, exploded: die.chain.length > 1, chainText: die.chain.join(" + ") }))
  });
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: vehicle }), content,
    flags: { dtd40k: { damage: { total: result.total, pen, type, location: "body", tearing: false, unarmed: false, magic: false, resolve: {}, raises: 0, blast } } }
  });
}

/**
 * Ramming Speed (p. 361): XkY+Z on the target and on the vehicle (two damage cards); then the vehicle goes Out of
 * Control if it took more wounds than the target, else makes a Control Test (buttons on the card).
 * @param {Actor} vehicle
 */
export async function ram(vehicle) {
  if (!vehicle.isOwner) return;
  const system = vehicle.system;
  if (system.momentum < 1) {
    ui.notifications.warn(format("DTD.Vehicle.Refused.noMomentum", { name: vehicle.name }));
    return;
  }
  const pool = ramming({ size: system.size, momentum: system.momentum, speed: system.speed });
  const target = [...game.user.targets][0]?.actor ?? null;
  const formula = `${pool.rolled}k${pool.kept}+${pool.flat}`;
  await postDamage(vehicle, { label: format("DTD.Vehicle.RamTarget", { target: target?.name ?? localize("DTD.Vehicle.TheTarget") }), pool, type: "I" });
  await postDamage(vehicle, { label: format("DTD.Vehicle.RamSelf", { name: vehicle.name }), pool, type: "I" });
  return postCard(vehicle, {
    title: `${localize("DTD.Vehicle.Ram")} — ${vehicle.name}`, subtitle: formula,
    lines: [{ text: localize("DTD.Vehicle.RamRule") }],
    buttons: [
      { action: "vehicleControl", icon: "fa-solid fa-gauge", label: localize("DTD.Vehicle.ControlTest") },
      { action: "vehicleOutOfControl", icon: "fa-solid fa-car-burst", label: localize("DTD.Vehicle.OutOfControl") }
    ]
  });
}

/**
 * The vehicle a card is about, for its buttons.
 * @param {ChatMessage} message
 */
export async function vehicleOfCard(message) {
  const uuid = message.getFlag("dtd40k", "vehicle")?.uuid;
  const vehicle = uuid ? await foundry.utils.fromUuid(uuid) : null;
  return vehicle?.isOwner ? vehicle : null;
}

// ---------------------------------------------------------------------------------------------------------------
// Damage, criticals, Jury Rig (US3)

/**
 * Apply a damage card to a vehicle (FR-010; called by damage-service.applyDamage): AP of every location and the
 * frame's Resilience, no Critical Damage, temporary HP first, destroyed at 0 HP; wounds in the scene roll the vehicle
 * critical every 5 (Tracked: 10; Junker: on any damage).
 * @param {Actor} vehicle
 * @param {TokenDocument} token
 * @param {object} damage
 */
export async function applyVehicleDamage(vehicle, token, damage) {
  const system = vehicle.system;
  const result = resolveDamage({
    total: damage.total, pen: damage.pen, location: damage.location, magic: damage.magic, tearing: damage.tearing,
    armor: system.armor.locations, aura: system.modifiers.combat.aura, resilience: system.derived.resilience,
    hp: system.hp.value + system.hp.temp, critical: 0, ...(damage.resolve ?? {}), noCritical: true
  });
  const before = { hp: system.hp.value, temp: system.hp.temp, momentum: system.momentum, state: system.toObject().state };
  const after = vehicleHpAfter({ hpLoss: result.hpLoss, hp: system.hp.value, temp: system.hp.temp });
  const wounds = result.wounds;
  const every = Number(system.drive.automation?.critEvery) || 5;
  let crits = critCount(system.state.sceneWounds, wounds, every);
  if (!crits && wounds > 0 && hasFlaw(vehicle, "junker")) crits = 1;
  await vehicle.update({
    "system.hp.value": after.hp, "system.hp.temp": after.temp,
    "system.state.sceneWounds": system.state.sceneWounds + wounds,
    "system.state.destroyed": system.state.destroyed || after.destroyed
  });
  let criticalText = "";
  if (after.destroyed) criticalText = localize("DTD.Vehicle.Destroyed");
  else if (crits > 0) criticalText = (await vehicleCritical(vehicle, crits)).join(" · ");
  return {
    actor: vehicle,
    row: {
      name: vehicle.name, location: localize(`DTD.Location.${damage.location}`), total: damage.total, effective: result.effective,
      resilience: result.steps.find((step) => step.label === "resilience")?.value ?? Math.max(1, system.derived.resilience),
      hpLoss: result.hpLoss, criticalGain: 0, critical: 0, fatigue: 0, coverHit: false,
      criticalText, criticalTable: crits > 0 && !after.destroyed ? localize("DTD.Vehicle.CritTable") : ""
    },
    undo: { actorUuid: vehicle.uuid, tokenUuid: token.uuid, vehicle: true, before }
  };
}

/**
 * Roll and apply vehicle criticals (p. 363).
 * @param {Actor} vehicle
 * @param {number} [n=1]
 * @returns {Promise<string[]>} texts of the rows
 */
export async function vehicleCritical(vehicle, n = 1) {
  const round = currentRound();
  const texts = [];
  const lines = [];
  let pilotHurt = 0;
  for (let i = 0; i < n; i++) {
    const state = vehicle.system.state;
    const d10 = Math.floor(rng() * 10) + 1;
    const row = vehicleCrit(d10);
    const m = row.mechanics;
    const update = {};
    let extra = "";
    if (m.stalled) update["system.state.stalled"] = true;
    if (m.momentum === 0) update["system.momentum"] = 0;
    if (m.immobileRounds) update["system.state.immobileUntil"] = round + m.immobileRounds;
    if (m.lockedRounds) update["system.state.lockedUntil"] = round + m.lockedRounds;
    if (m.explodeRounds) update["system.state.explodeRound"] = (round || 0) + m.explodeRounds;
    if (m.disable) {
      const options = vehicle.items.filter((item) => !state.disabled.includes(item.id)
        && (item.type === "weapon" || (item.type === "vehicleComponent" && OFFLINE_CATEGORIES.includes(item.system.category))));
      const hit = options.length ? options[Math.floor(rng() * options.length)] : null;
      if (hit) {
        update["system.state.disabled"] = [...state.disabled, hit.id];
        extra = format("DTD.Vehicle.Offline", { name: hit.name });
      }
    }
    if (m.pilotWounds) pilotHurt += rollAndKeep(normalizePool({ rolled: 1, kept: 1 }), { rng }).total;
    if (Object.keys(update).length) await vehicle.update(update);
    const text = `${localize(`DTD.Vehicle.CritRow.${row.key}`)}${extra ? ` (${extra})` : ""}`;
    texts.push(text);
    lines.push({ label: `d10 ${d10}`, text: `${text} — ${row.effect}`, warning: row.key === "explosion" });
  }
  const pilot = pilotOf(vehicle);
  if (pilotHurt && pilot) {
    await pilot.update({ "system.hp.value": Math.max(0, pilot.system.hp.value - pilotHurt) });
    lines.push({ warning: true, text: format("DTD.Vehicle.PilotHurt", { name: pilot.name, wounds: pilotHurt }) });
  }
  const buttons = vehicle.system.state.explodeRound && !round
    ? [{ action: "vehicleExplode", icon: "fa-solid fa-explosion", label: localize("DTD.Vehicle.Explode"), gm: true }]
    : [];
  await postCard(vehicle, { title: `${localize("DTD.Vehicle.CritTable")} — ${vehicle.name}`, lines, buttons });
  return texts;
}

/**
 * The hit core, fuel or ammunition blows up (critical 10): 10k5+30 X with Blast 10, everyone aboard dies.
 * @param {Actor} vehicle
 */
export async function explode(vehicle) {
  if (!vehicle.system.state.explodeRound) return;
  await vehicle.update({ "system.state.explodeRound": 0, "system.state.destroyed": true, "system.hp.value": 0, "system.hp.temp": 0 });
  const crit = vehicleCrit(10).mechanics.damage;
  await postDamage(vehicle, {
    label: format("DTD.Vehicle.Explosion", { name: vehicle.name }), pool: { rolled: crit.rolled, kept: crit.kept, flat: crit.flat },
    type: crit.type, blast: 10, notes: [localize("DTD.Vehicle.ExplosionNote")]
  });
}

/**
 * Start of a round: hit cores whose round has come explode. Active GM only.
 * @param {Combat} combat
 */
export async function explodeDue(combat) {
  for (const vehicle of allVehicles()) {
    const due = vehicle.system.state.explodeRound;
    if (due && combat.round >= due) await explode(vehicle);
  }
}

/**
 * Jury Rig (Full Action, p. 361): the engineer tests Tech-Use or Crafts at TN 20; success ends a condition (stall,
 * offline system, pending explosion) or gives 1 temporary HP plus 1 per raise, once between full repairs.
 * @param {Actor} vehicle
 * @param {Actor} engineer
 */
export async function juryRig(vehicle, engineer) {
  if (!engineer?.isOwner) return;
  const state = vehicle.system.state;
  const choices = [];
  if (!state.juryRigUsed) choices.push({ value: "tempHp", label: localize("DTD.Vehicle.JuryRigTempHp") });
  if (state.explodeRound) choices.push({ value: "explosion", label: localize("DTD.Vehicle.CritRow.explosion") });
  if (state.stalled) choices.push({ value: "stalled", label: localize("DTD.Vehicle.CritRow.stall") });
  for (const id of state.disabled) choices.push({ value: `disabled:${id}`, label: format("DTD.Vehicle.Offline", { name: vehicle.items.get(id)?.name ?? id }) });
  if (!choices.length) {
    ui.notifications.warn(format("DTD.Vehicle.Refused.nothingToRig", { name: vehicle.name }));
    return;
  }
  const skills = ["techUse", "crafts"].sort((a, b) => (engineer.system.skills[b]?.value ?? 0) - (engineer.system.skills[a]?.value ?? 0));
  const options = (list) => list.map((c) => `<option value="${c.value}">${c.label}</option>`).join("");
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: `${localize("DTD.Vehicle.JuryRig")} — ${vehicle.name}` }, classes: ["dtd40k"], position: { width: 380 }, rejectClose: false,
    content: `<div class="form-group"><label>${localize("DTD.Vehicle.JuryRigGoal")}</label><select name="goal">${options(choices)}</select></div>
      <div class="form-group"><label>${localize("DTD.Vehicle.Skill")}</label><select name="skill">${options(skills.map((s) => ({ value: s, label: localize(CONFIG.DTD.SKILLS[s].label) })))}</select></div>
      <div class="form-group"><label>TN</label><input type="number" name="tn" value="20" min="0"></div>`,
    buttons: [
      { action: "roll", label: "DTD.Vehicle.Roll", icon: "fa-solid fa-screwdriver-wrench", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!choice || typeof choice !== "object") return;
  if (!(await act(vehicle, "vehicleJuryRig", engineer))) return;
  const message = await engineer.rollSkill(choice.skill, { fastForward: true, tn: Number(choice.tn) || 20, label: `${localize("DTD.Vehicle.JuryRig")} — ${vehicle.name}` });
  const outcome = message?.getFlag("dtd40k", "test")?.outcome;
  if (!outcome?.success) return;
  const s = vehicle.system;
  let text;
  if (choice.goal === "tempHp") {
    const temp = juryRigTemp({ raises: outcome.raises, hp: s.hp.value, temp: s.hp.temp, max: s.hp.max });
    await vehicle.update({ "system.hp.temp": s.hp.temp + temp, "system.state.juryRigUsed": true });
    text = format("DTD.Vehicle.JuryRigHp", { hp: temp });
  } else if (choice.goal === "explosion") {
    await vehicle.update({ "system.state.explodeRound": 0 });
    text = localize("DTD.Vehicle.JuryRigDefused");
  } else if (choice.goal === "stalled") {
    await vehicle.update({ "system.state.stalled": false });
    text = localize("DTD.Vehicle.JuryRigRestarted");
  } else {
    const id = choice.goal.split(":")[1];
    await vehicle.update({ "system.state.disabled": s.state.disabled.filter((d) => d !== id) });
    text = format("DTD.Vehicle.JuryRigOnline", { name: vehicle.items.get(id)?.name ?? id });
  }
  await postCard(vehicle, { title: `${localize("DTD.Vehicle.JuryRig")} — ${vehicle.name}`, subtitle: engineer.name, lines: [{ text }] });
}

/**
 * New scene (the GM's button; the end of a combat): wounds in the scene and the round-based conditions reset.
 * @param {Actor} vehicle
 */
export async function newScene(vehicle) {
  await vehicle.update({ "system.state.sceneWounds": 0, "system.state.lockedUntil": 0, "system.state.immobileUntil": 0, "system.state.lastMoveRound": 0 });
}

// ---------------------------------------------------------------------------------------------------------------
// Repair (US4)

/**
 * Repair cycle (p. 363; FR-013): the Chief Engineer tests Crafts at TN Size + HP lost (success halves the Size days,
 * each raise halves again); at the end the vehicle regains 1k1 per dedicated dot of Wealth, Followers or Backing plus
 * per Crafts dot. A full repair clears the Jury Rig HP, offline systems and the stall.
 * @param {Actor} vehicle
 * @param {Actor|null} engineer
 */
export async function repair(vehicle, engineer) {
  if (!vehicle.isOwner) return;
  const s = vehicle.system;
  const hpLost = Math.max(0, s.hp.max - s.hp.value);
  const tn = repairTn({ size: s.size, hpLost });
  const crew = crewOf(vehicle).filter((c) => c.actor);
  const content = await foundry.applications.handlebars.renderTemplate(REPAIR_TEMPLATE, {
    tn, size: s.size, hpLost,
    engineers: crew.map((c) => ({ uuid: c.actorUuid, name: c.actor.name, crafts: c.actor.system.skills?.crafts?.value ?? 0, selected: c.actor === engineer || (!engineer && c.role === "engineer") }))
  });
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: `${localize("DTD.Vehicle.Repair")} — ${vehicle.name}` }, classes: ["dtd40k"], position: { width: 420 }, content, rejectClose: false,
    buttons: [
      { action: "roll", label: "DTD.Vehicle.Repair", icon: "fa-solid fa-wrench", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!choice || typeof choice !== "object") return;
  const chief = choice.engineer ? foundry.utils.fromUuidSync(choice.engineer) : null;
  const crafts = chief?.system.skills?.crafts?.value ?? 0;
  let outcome = null;
  if (chief) {
    const message = await chief.rollSkill("crafts", { fastForward: true, tn, label: `${localize("DTD.Vehicle.Repair")} — ${vehicle.name}` });
    outcome = message?.getFlag("dtd40k", "test")?.outcome ?? null;
  }
  const days = repairDays({ size: s.size, success: Boolean(outcome?.success), raises: outcome?.raises ?? 0 });
  const dice = repairDice({ dots: Number(choice.dots) || 0, crafts });
  let regained = 0;
  for (let i = 0; i < dice.rolled; i++) regained += rollAndKeep(normalizePool({ rolled: 1, kept: 1 }), { rng }).total;
  const hp = Math.min(s.hp.max, s.hp.value + regained);
  await vehicle.update({
    "system.hp.value": hp, "system.hp.temp": 0, "system.state.disabled": [], "system.state.juryRigUsed": false,
    "system.state.stalled": false, "system.state.destroyed": s.state.destroyed && hp <= 0
  });
  return postCard(vehicle, {
    title: `${localize("DTD.Vehicle.Repair")} — ${vehicle.name}`, subtitle: chief?.name ?? "",
    lines: [
      { label: localize("DTD.Vehicle.RepairDays"), text: String(days) },
      { label: localize("DTD.Vehicle.RepairHp"), text: format("DTD.Vehicle.RepairHpText", { dice: dice.rolled, regained, hp, max: s.hp.max }) }
    ]
  });
}
