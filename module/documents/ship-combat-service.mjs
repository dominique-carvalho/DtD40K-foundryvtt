import { postTest, rng } from "../dice/roll-service.mjs";
import { rollAndKeep } from "../rules/dice.mjs";
import { defendedSd, stillHits } from "../rules/defense.mjs";
import { formatPool, normalizePool } from "../rules/pool.mjs";
import { runTest } from "../rules/test.mjs";
import {
  SHIP_ACTIONS, SHIP_CRIT, boardingLoss, boardingRange, commitCrew, critRow, emergencyRepair, multiphasicHit,
  multiphasicRegen, ramDamage, shieldHit, shieldRegen, shipPool, weaponProfile
} from "../rules/ship.mjs";
import { requestGm } from "./gm-socket.mjs";
import { officerKept, officerOf, postShipCard } from "./ship-service.mjs";

/**
 * Ship combat (spec 014, US3; research R4–R8): the ship's turn (one Manoeuver, one action per department), Crew
 * committed each round, ship actions and their effects, attacks by card, the ship Apply (shield → Hull → Crit Chart),
 * Evasive Manoeuvers, criticals, ramming and boarding.
 * Contract: specs/014-ships/contracts/foundry-api.md ("ship-combat-service").
 */

const EXTRA_TEMPLATE = "systems/dtd40k/templates/chat/ship-extra.hbs";
const DAMAGE_TEMPLATE = "systems/dtd40k/templates/chat/ship-damage.hbs";
const DEFENSE_TEMPLATE = "systems/dtd40k/templates/chat/defense.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
const actionOf = (key) => SHIP_ACTIONS.find((a) => a.key === key);
const currentRound = () => (game.combat?.started ? game.combat.round : 0);
// Squadrons share the attack and damage path with ships but have no consoles or round state.
const hasConsole = (ship, key) => ship.type === "ship" && ship.items.some((i) => i.type === "shipComponent" && i.system.category === "console"
  && i.system.automation?.key === key && !ship.system.state.disabled.includes(i.id));
const roundState = (ship, key) => {
  const entry = ship.system.state?.round?.[key];
  return entry && (entry.round === undefined || entry.round === currentRound()) ? entry : null;
};
const d = (n, faces) => Array.from({ length: n }, () => Math.floor(rng() * faces) + 1).reduce((a, b) => a + b, 0);
/** "1d5", "1d10" or a number → a rolled value. */
const amount = (value) => {
  if (typeof value === "number") return value;
  const m = String(value ?? "").match(/^(\d+)d(\d+)$/);
  return m ? d(Number(m[1]), Number(m[2])) : 0;
};

// ---------------------------------------------------------------------------------------------------------------
// Turn and Crew (R4)

/** The combatant of a ship in the active combat. */
export function shipCombatant(ship) {
  const combat = game.combat;
  if (!combat?.started) return null;
  return combat.combatants.find((c) => c.actor === ship || (c.actorId === ship.id && c.token?.actorLink)) ?? null;
}

/**
 * The ship's turn state in a round (the current one by default).
 * @param {Combatant} combatant
 * @param {number} [round]
 */
export function shipTurn(combatant, round = combatant?.combat?.round ?? 0) {
  const saved = combatant?.getFlag("dtd40k", "shipTurn");
  return saved?.round === round ? { reactions: 0, departments: [], ...saved } : { round, manoeuver: false, departments: [], reactions: 0 };
}

/** Reactions of the ship per round: those of the Helmsman (1 for an NPC). */
const reactionsMax = (ship) => officerOf(ship, "helmsman")?.actor?.system.combat?.reactionsMax ?? 1;

/**
 * Check the turn limits (FR-005) and record the action: one Manoeuver, one action per department (Damage Control
 * Station allows a second Emergency Repair), Reactions by the Helmsman's count. A refusal can be overridden by the GM.
 * Also refuses destroyed ships and actions blocked by criticals.
 * @param {Actor} ship
 * @param {object} action  SHIP_ACTIONS entry
 */
export async function takeShipAction(ship, action) {
  const refuse = async (reason, override = true) => {
    const message = format(`DTD.Ship.Refused.${reason}`, { name: ship.name, action: action.name });
    ui.notifications.warn(message);
    if (!override || !game.user.isGM) return false;
    return foundry.applications.api.DialogV2.confirm({ window: { title: action.name }, content: `<p>${message}</p><p>${localize("DTD.Combat.GMOverride")}</p>`, rejectClose: false });
  };
  const s = ship.system;
  if (s.state.destroyed) return refuse("destroyed", false);
  const b = s.blocked;
  const blocked = (action.department === "command" && b.command) || (action.key.startsWith("overcharge") && b.overcharge)
    || (action.key === "adjustHeading" && b.adjustHeading) || (action.key === "evasiveManoeuvers" && b.evasiveManoeuvers)
    || (["fireEverything", "snipe", "targetSubsystem"].includes(action.key) && b.weapons) || (action.department === "manoeuver" && b.manoeuver);
  if (blocked && !(await refuse("blocked"))) return false;
  const combatant = shipCombatant(ship);
  if (!combatant) return true;
  const turn = shipTurn(combatant);
  let ok = true;
  if (action.timing === "reaction") {
    if (turn.reactions >= reactionsMax(ship)) ok = await refuse("noReaction");
    if (ok) turn.reactions += 1;
  } else if (action.timing === "action") {
    if (action.department === "manoeuver") {
      if (turn.manoeuver) ok = await refuse("manoeuverUsed");
      if (ok) turn.manoeuver = true;
    } else {
      const extraRepair = action.key === "emergencyRepair" && hasConsole(ship, "damageControlStation") && !turn.departments.includes("extraRepair");
      if (turn.departments.includes(action.department) && !extraRepair) ok = await refuse("departmentUsed");
      if (ok) turn.departments.push(turn.departments.includes(action.department) ? "extraRepair" : action.department);
    }
  }
  if (!ok) return false;
  if (combatant.isOwner) await combatant.setFlag("dtd40k", "shipTurn", turn);
  return true;
}

/**
 * Commit Crew for an action (FR-006/FR-007): temporary Crew first; the reserve refills when the round changes.
 * @param {Actor} ship
 * @param {number} n
 * @returns {Promise<boolean>}
 */
export async function commitShipCrew(ship, n) {
  if (n <= 0) return true;
  const s = ship.system;
  if (n > s.crew.available) {
    ui.notifications.warn(format("DTD.Ship.Refused.noCrew", { name: ship.name, n, available: s.crew.available }));
    return false;
  }
  const round = currentRound();
  const committed = s.crew.committedRound === round ? s.crew.committed : 0;
  const next = commitCrew({ temp: s.crew.temp, committed }, n);
  await ship.update({ "system.crew.temp": next.temp, "system.crew.committed": next.committed, "system.crew.committedRound": round });
  return true;
}

/**
 * Ask how many Crew to commit (1–10, at most what is free).
 * @param {Actor} ship
 * @param {string} title
 * @param {string} [extra]  more form fields
 * @returns {Promise<object|null>}  the form data, with `crew` as a number
 */
async function promptCrew(ship, title, extra = "") {
  const max = Math.min(10, ship.system.crew.available);
  if (max < 1) {
    ui.notifications.warn(format("DTD.Ship.Refused.noCrew", { name: ship.name, n: 1, available: 0 }));
    return null;
  }
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title }, classes: ["dtd40k"], position: { width: 380 }, rejectClose: false,
    content: `<p class="hint">${format("DTD.Ship.CrewFree", { available: ship.system.crew.available, max: ship.system.crew.max })}</p>
      <div class="form-group"><label>${localize("DTD.Ship.CrewCommitted")}</label><input type="number" name="crew" value="${max}" min="1" max="${max}"></div>${extra}`,
    buttons: [
      { action: "ok", label: "DTD.Ship.Roll", icon: "fa-solid fa-dice-d10", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!choice || typeof choice !== "object") return null;
  return { ...choice, crew: Math.max(1, Math.min(max, Number(choice.crew) || 1)) };
}

/**
 * Roll a ship pool and post it (research R4).
 * @param {Actor} ship
 * @param {{pool: {rolled: number, kept: number, flat?: number}, tn?: number|null, label: string, lines?: object[], buttons?: object[], flags?: object}} options
 */
export async function rollShipPool(ship, { pool, tn = null, label, lines = [], buttons = [], flags = {} }) {
  const testResult = runTest({ base: { rolled: pool.rolled, kept: pool.kept, flat: pool.flat ?? 0 }, tn, rng });
  const extraContent = lines.length || buttons.length ? await foundry.applications.handlebars.renderTemplate(EXTRA_TEMPLATE, { lines, buttons }) : "";
  return postTest({ actor: ship, label, testResult, extraContent, flags });
}

/**
 * Pool of a department for an action: committed Crew rolled, the officer's dots kept (+1 with Picard Speech), the
 * ship stat added, Micromanage dice for the department.
 */
function departmentPool(ship, action, crew, extraFlat = 0) {
  const officer = officerKept(ship, action.department, action.skill || undefined);
  const picard = roundState(ship, "picard") ? 1 : 0;
  const micro = roundState(ship, "micromanage");
  const microDice = micro?.department === action.department ? micro.bonus : 0;
  const pool = shipPool({ crew, kept: officer.kept + picard, stat: (ship.system.stats[action.stat] ?? 0) + extraFlat });
  pool.rolled += microDice;
  return { pool, officer, microUsed: microDice > 0 };
}

// ---------------------------------------------------------------------------------------------------------------
// Ship actions (R4)

/**
 * Use a ship action from the sheet (FR-005/FR-006): turn limits, Crew, the roll of the department's officer and the
 * simple effect of the action. Attacks, ramming, boarding and fighters have their own entry points.
 * @param {Actor} ship
 * @param {string} key  SHIP_ACTIONS key
 */
export async function shipAction(ship, key) {
  if (!ship.isOwner) return null;
  const action = actionOf(key);
  if (!action) return null;
  if (["fireEverything", "snipe", "targetSubsystem"].includes(key)) return fire(ship, key);
  if (key === "rammingSpeed") return ram(ship);
  if (key === "boardingParty") return startBoarding(ship);
  if (key === "evasiveManoeuvers") {
    ui.notifications.info(localize("DTD.Ship.EvasiveFromCard"));
    return null;
  }
  if (key === "deployFightercraft") {
    const { deploy } = await import("./squadron-service.mjs");
    return deploy(ship);
  }
  if (action.department === "command") return commandAction(ship, action);
  if (key === "move") {
    if (!(await takeShipAction(ship, action))) return null;
    return postShipCard(ship, { title: `${action.name} — ${ship.name}`, lines: [{ text: format("DTD.Ship.MoveText", { half: Math.floor(ship.system.stats.speed / 2), full: ship.system.stats.speed }) }, ...engineLines(ship)] });
  }

  let extra = "";
  if (key === "emergencyRepair") extra = repairGoalField(ship);
  if (key === "restartShields") extra = `<div class="form-group"><label>${localize("DTD.Ship.RestartMode")}</label><select name="mode"><option value="cycle">${localize("DTD.Ship.CycleShields")}</option><option value="reboot">${localize("DTD.Ship.RebootShields")}</option></select></div>`;
  if (key === "overchargeShields" && ship.system.shield.collapsed) {
    ui.notifications.warn(localize("DTD.Ship.ShieldCollapsed"));
    return null;
  }
  const target = ["activeAugury", "spellJamming"].includes(key) ? [...game.user.targets][0]?.actor ?? null : null;
  if (key === "spellJamming" && target?.type !== "ship") {
    ui.notifications.warn(localize("DTD.Ship.NeedShipTarget"));
    return null;
  }
  const choice = await promptCrew(ship, `${action.name} — ${ship.name}`, extra);
  if (!choice) return null;
  if (!(await takeShipAction(ship, action))) return null;
  if (!(await commitShipCrew(ship, choice.crew))) return null;
  const { pool, officer, microUsed } = departmentPool(ship, action, choice.crew);
  const tn = key === "emergencyRepair" && choice.goal && choice.goal !== "tempHull"
    ? ship.system.state.crits.find((c, i) => `${i}` === choice.goal)?.tn ?? 15
    : typeof action.tn === "number" ? action.tn : null;
  const message = await rollShipPool(ship, { pool, tn, label: `${action.name} — ${ship.name}`, lines: officer.empty ? [{ warning: true, text: localize("DTD.Ship.EmptyPost") }] : [] });
  if (microUsed) await ship.update({ "system.state.round.micromanage": null });
  const test = message?.getFlag("dtd40k", "test");
  const outcome = test?.outcome;
  await actionEffect(ship, action, { outcome, total: test?.total ?? 0, choice, target });
  return message;
}

/** Text lines for the Move card when the engines were overcharged. */
function engineLines(ship) {
  const oc = roundState(ship, "overchargeEngines");
  if (!oc) return [];
  return [{ text: format("DTD.Ship.OverchargedMove", { extra: Math.floor(ship.system.stats.speed / 2) + oc.bonus }) }];
}

/** Select of the Emergency Repair goal: temporary Hull or a lasting effect (with its TN). */
function repairGoalField(ship) {
  const crits = ship.system.state.crits.map((c, i) => `<option value="${i}">${critLabel(ship, c)} (TN ${c.tn})</option>`).join("");
  return `<div class="form-group"><label>${localize("DTD.Ship.RepairGoal")}</label><select name="goal"><option value="tempHull">${localize("DTD.Ship.TempHull")}</option>${crits}</select></div>`;
}

/** Name of a lasting effect (a Crit Chart row, or a part knocked out by Target Subsystem). */
export function critLabel(ship, c) {
  const row = SHIP_CRIT.find((r) => r.key === c.key);
  const part = c.itemId ? ship.items.get(c.itemId)?.name : "";
  return `${row ? localize(`DTD.Ship.Crit.${row.key}`) : localize("DTD.Ship.Crit.subsystem")}${part ? `: ${part}` : ""}`;
}

/**
 * Command actions (p. 404): no Crew; the Captain tests Command with skill and characteristic as usual (an NPC captain
 * with 4 and 4).
 */
async function commandAction(ship, action) {
  if (action.key === "picardSpeech" && ship.system.state.round?.picardUsed) {
    ui.notifications.warn(format("DTD.Ship.Refused.picardUsed", { name: ship.name }));
    return null;
  }
  let choice = {};
  if (action.key === "micromanage") {
    const depts = ["manoeuver", "tactical", "engineering", "arcana"].map((d2) => `<option value="${d2}">${localize(`DTD.Ship.Department.${d2}`)}</option>`).join("");
    choice = await foundry.applications.api.DialogV2.wait({
      window: { title: action.name }, classes: ["dtd40k"], rejectClose: false,
      content: `<div class="form-group"><label>${localize("DTD.Ship.DepartmentLabel")}</label><select name="department">${depts}</select></div>`,
      buttons: [
        { action: "ok", label: "DTD.Ship.Roll", icon: "fa-solid fa-dice-d10", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
        { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
      ]
    });
    if (!choice || typeof choice !== "object") return null;
  }
  if (!(await takeShipAction(ship, action))) return null;
  const captain = officerOf(ship, "commandingOfficer");
  const label = `${action.name} — ${ship.name}`;
  let message;
  if (action.key === "hail") {
    return postShipCard(ship, { title: label, subtitle: captain?.actor?.name ?? "", lines: [{ text: action.summary }] });
  }
  const bridge = hasConsole(ship, "advancedBridgeDesign") ? { rolled: 1, kept: 1 } : { rolled: 0, kept: 0 };
  if (captain?.actor) {
    message = await captain.actor.rollSkill("command", { fastForward: true, tn: action.tn, modifiers: bridge, label });
  } else {
    message = await rollShipPool(ship, { pool: { rolled: 8 + bridge.rolled, kept: 4 + bridge.kept, flat: 0 }, tn: action.tn, label });
  }
  const test = message?.getFlag("dtd40k", "test");
  await actionEffect(ship, action, { outcome: test?.outcome, total: test?.total ?? 0, choice });
  return message;
}

/**
 * The simple effect of an action after its roll (research R4).
 * @param {Actor} ship
 * @param {object} action
 * @param {{outcome: object|null, total: number, choice: object, target?: Actor|null}} result
 */
async function actionEffect(ship, action, { outcome, total, choice, target = null }) {
  const round = currentRound();
  const ok = Boolean(outcome?.success);
  const raises = outcome?.raises ?? 0;
  const lines = [];
  const set = (key, value) => ship.update({ [`system.state.round.${key}`]: value });
  switch (action.key) {
    case "braceForImpact":
      if (ok) { await set("braced", { round, penalty: 1 + Math.floor(raises / 2) }); lines.push({ text: format("DTD.Ship.Braced", { n: 1 + Math.floor(raises / 2) }) }); }
      break;
    case "picardSpeech":
      await set("picardUsed", true);
      if (ok) { await set("picard", { round }); lines.push({ text: localize("DTD.Ship.PicardDone") }); }
      break;
    case "micromanage":
      if (ok) { await set("micromanage", { round, department: choice.department, bonus: 1 + Math.floor(raises / 2) }); lines.push({ text: format("DTD.Ship.Micromanaged", { department: localize(`DTD.Ship.Department.${choice.department}`), n: 1 + Math.floor(raises / 2) }) }); }
      break;
    case "adjustSpeed":
      if (ok) lines.push({ text: format("DTD.Ship.SpeedAdjusted", { n: 1 + raises }) });
      lines.push(...engineLines(ship));
      break;
    case "adjustHeading":
      lines.push({ text: ok ? localize("DTD.Ship.HeadingExtra") : localize("DTD.Ship.HeadingBase") });
      lines.push(...engineLines(ship));
      break;
    case "overchargeWeapons": {
      const eps = hasConsole(ship, "epsConduits") ? 2 : 0;
      if (ok) { const r = raises + eps; await set("overchargeWeapons", { rolled: 1 + Math.floor(r / 2), kept: 1 }); lines.push({ text: format("DTD.Ship.WeaponsOvercharged", { dice: `${1 + Math.floor(r / 2)}k1` }) }); }
      break;
    }
    case "overchargeShields":
      if (ok) {
        const s = ship.system.shield;
        const r = raises + (hasConsole(ship, "epsConduits") ? 2 : 0);
        const bonus = d(Math.floor(r / 2), 10);
        if (s.layerCount) await ship.update({ "system.shield.layers": multiphasicRegen(s.layers, s.max, s.regen + bonus) });
        else await ship.update({ "system.shield.value": Math.min(s.max, shieldRegen({ ...s, collapsed: s.collapsed }) + bonus) });
        lines.push({ text: format("DTD.Ship.ShieldsOvercharged", { bonus }) });
      }
      break;
    case "overchargeEngines":
      if (ok) { const r = raises + (hasConsole(ship, "epsConduits") ? 2 : 0); await set("overchargeEngines", { round, bonus: Math.floor(r / 2) }); lines.push({ text: localize("DTD.Ship.EnginesOvercharged") }); }
      break;
    case "emergencyRepair":
      if (ok && (!choice.goal || choice.goal === "tempHull")) {
        const temp = d(emergencyRepair(raises), 10);
        await ship.update({ "system.hull.temp": Math.max(ship.system.hull.temp, temp) });
        lines.push({ text: format("DTD.Ship.TempHullGained", { n: temp }) });
      } else if (ok) {
        const crit = ship.system.state.crits[Number(choice.goal)];
        if (crit) {
          await ship.update({
            "system.state.crits": ship.system.state.crits.filter((c, i) => `${i}` !== choice.goal),
            "system.state.disabled": ship.system.state.disabled.filter((id) => id !== crit.itemId)
          });
          lines.push({ text: format("DTD.Ship.EffectCleared", { name: critLabel(ship, crit) }) });
        }
      }
      break;
    case "activeAugury":
      if (ok && target) {
        await set("augury", { round, targetUuid: target.uuid });
        lines.push(...auguryLines(target, 1 + Math.floor(raises / 2)));
      }
      break;
    case "spellJamming":
      if (target) {
        await target.update({ "system.state.round.jamming": { total, by: ship.uuid } });
        lines.push({ text: format("DTD.Ship.Jammed", { name: target.name, total }) });
      }
      break;
    case "silentRunning":
      await set("silentRunning", { round, total });
      lines.push({ text: format("DTD.Ship.SilentRunning", { total }) });
      break;
    case "triage":
      if (ok) {
        const n = 1 + Math.floor(raises / 2);
        if (hasConsole(ship, "advancedSickbay")) await ship.update({ "system.crew.lost": Math.max(0, ship.system.crew.lost - n) });
        else await ship.update({ "system.crew.temp": ship.system.crew.temp + n });
        lines.push({ text: format("DTD.Ship.TriageDone", { n }) });
      }
      break;
    case "restartShields":
      if (ok) {
        if (choice.mode === "reboot" && !ship.system.shield.collapsed) lines.push({ warning: true, text: localize("DTD.Ship.NotCollapsed") });
        else { await set(choice.mode === "reboot" ? "rebootShields" : "cycleShields", { round }); lines.push({ text: localize(choice.mode === "reboot" ? "DTD.Ship.RebootNext" : "DTD.Ship.CycleNext") }); }
      }
      break;
    default:
      break;
  }
  if (!ok && typeof action.tn === "number") lines.push({ warning: true, text: localize("DTD.Ship.ActionFailed") });
  if (lines.length) await postShipCard(ship, { title: `${action.name} — ${ship.name}`, lines });
}

/** Details revealed by Active Augury, in a fixed order: weapons, consoles, Hull/shield/Crew. */
function auguryLines(target, n) {
  const s = target.system;
  const items = (c) => target.items.filter((i) => i.type === "shipComponent" && i.system.category === c).map((i) => i.name).join(", ") || "—";
  const all = [
    { label: localize("DTD.Ship.Weapons"), text: items("weapon") },
    { label: localize("DTD.Ship.Consoles"), text: items("console") },
    { label: localize("DTD.Ship.Status"), text: format("DTD.Ship.StatusText", { hull: s.hull.value, max: s.hull.max, shield: s.shield.value, crew: s.crew.max }) }
  ];
  return all.slice(0, n);
}

// ---------------------------------------------------------------------------------------------------------------
// Attacks, damage and the ship Apply (R5)

/** Weapons and torpedoes a ship can fire. */
function arsenal(ship) {
  const parts = ship.items.filter((i) => i.type === "shipComponent" && !ship.system.state.disabled.includes(i.id));
  const weapons = parts.filter((i) => i.system.category === "weapon").map((i) => ({ id: i.id, name: i.name, profile: weaponProfile({ ...i.system.weapon, cost: i.system.cost }, i.system.weapon.typeKey), torpedo: false }));
  const tubes = parts.filter((i) => i.system.category === "torpedoTube").length;
  const torpedoes = tubes ? parts.filter((i) => i.system.category === "torpedo" && i.system.quantity > 0).map((i) => ({
    id: i.id, name: `${i.name} (×${i.system.quantity})`, torpedo: true,
    profile: { kind: "lance", dam: i.system.torpedo.dam, dis: i.system.torpedo.dis, acc: i.system.torpedo.acc, crit: i.system.torpedo.crit, range: i.system.torpedo.range, arc: i.system.torpedo.arc }
  })) : [];
  return [...weapons, ...torpedoes];
}

/**
 * Fire Everything, Snipe or Target Subsystem (pp. 404–405, 408): weapons ticked in a dialog, Crew per roll (a Lance
 * rolls alone; ticked Arrays on the target share one roll with the worst Accuracy), against the target's Static
 * Defense (Snipe +2 per VU beyond range). Each roll posts an attack card.
 * @param {Actor} ship
 * @param {"fireEverything"|"snipe"|"targetSubsystem"} mode
 */
export async function fire(ship, mode = "fireEverything") {
  if (!ship.isOwner) return;
  const action = actionOf(mode);
  const target = [...game.user.targets][0]?.actor ?? null;
  if (!target || !["ship", "squadron"].includes(target.type)) {
    ui.notifications.warn(localize("DTD.Ship.NeedTarget"));
    return;
  }
  if (mode === "targetSubsystem" && target.type === "ship" && target.system.shield.value > 0 && !target.system.shield.collapsed
    && roundState(ship, "augury")?.targetUuid !== target.uuid) {
    ui.notifications.warn(localize("DTD.Ship.SubsystemNeedsAugury"));
    return;
  }
  const guns = arsenal(ship);
  if (!guns.length) {
    ui.notifications.warn(localize("DTD.Ship.NoWeapons"));
    return;
  }
  const single = mode !== "fireEverything";
  const rows = guns.map((g) => `<div class="form-group ship-fire-row"><label><input type="${single ? "radio" : "checkbox"}" name="${single ? "pick" : `use_${g.id}`}" value="${g.id}"> ${g.name} <span class="hint">${g.profile.dam.rolled}k${g.profile.dam.kept}, Acc ${g.profile.acc}, ${localize(`DTD.Ship.Kind.${g.profile.kind}`)}</span></label>
    <input type="number" name="crew_${g.id}" value="${Math.min(10, ship.system.crew.available)}" min="1" max="10"></div>`).join("");
  const parts = mode === "targetSubsystem" && target.type === "ship"
    ? `<div class="form-group"><label>${localize("DTD.Ship.SubsystemLabel")}</label><select name="subsystem">${target.items.filter((i) => i.type === "shipComponent" && ["weapon", "console", "torpedoTube"].includes(i.system.category)).map((i) => `<option value="${i.id}">${i.name}</option>`).join("")}</select></div>` : "";
  const snipe = mode === "snipe" ? `<div class="form-group"><label>${localize("DTD.Ship.BeyondRange")}</label><input type="number" name="beyond" value="1" min="0"></div>` : "";
  const group = mode === "fireEverything" ? `<label class="checkbox"><input type="checkbox" name="groupArrays" checked> ${localize("DTD.Ship.GroupArrays")}</label>` : "";
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: `${action.name} — ${ship.name} → ${target.name}` }, classes: ["dtd40k", "ship-fire-dialog"], position: { width: 480 }, rejectClose: false,
    content: `<p class="hint">${format("DTD.Ship.CrewFree", { available: ship.system.crew.available, max: ship.system.crew.max })}</p>${rows}${parts}${snipe}${group}`,
    buttons: [
      { action: "ok", label: "DTD.Ship.Fire", icon: "fa-solid fa-crosshairs", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!choice || typeof choice !== "object") return;
  const picked = single ? guns.filter((g) => g.id === choice.pick) : guns.filter((g) => choice[`use_${g.id}`]);
  if (!picked.length) return;
  // Rolls: every Lance and torpedo alone; Arrays together when grouped.
  const rolls = [];
  const arrays = picked.filter((g) => g.profile.kind === "array" && !g.torpedo);
  if (choice.groupArrays && arrays.length > 1) rolls.push(arrays);
  for (const g of picked) if (!(choice.groupArrays && arrays.length > 1 && arrays.includes(g))) rolls.push([g]);
  const crewFor = (group) => Math.max(1, Math.min(10, Number(choice[`crew_${group[0].id}`]) || 1));
  const totalCrew = rolls.reduce((n, g) => n + crewFor(g), 0);
  if (totalCrew > ship.system.crew.available) {
    ui.notifications.warn(format("DTD.Ship.Refused.noCrew", { name: ship.name, n: totalCrew, available: ship.system.crew.available }));
    return;
  }
  if (!(await takeShipAction(ship, action))) return;
  if (!(await commitShipCrew(ship, totalCrew))) return;
  const beyond = Math.max(0, Number(choice.beyond) || 0);
  const tn = target.system.derived.staticDefense + 2 * beyond;
  const targeting = ship.system.bonuses.ballisticsBonus ?? 0;
  for (const group of rolls) {
    const acc = Math.min(...group.map((g) => g.profile.acc));
    const { pool } = departmentPool(ship, { ...action, stat: "" }, crewFor(group), acc + targeting);
    for (const g of group.filter((x) => x.torpedo)) {
      const item = ship.items.get(g.id);
      await item.update({ "system.quantity": Math.max(0, item.system.quantity - 1) });
    }
    const label = `${action.name}: ${group.map((g) => g.name.replace(/ \(×\d+\)$/, "")).join(" + ")} → ${target.name}`;
    const testResult = runTest({ base: { rolled: pool.rolled, kept: pool.kept, flat: pool.flat }, tn, rng });
    const hit = Boolean(testResult.outcome?.success);
    const buttons = [];
    if (hit) buttons.push({ action: "shipDamage", icon: "fa-solid fa-burst", label: localize("DTD.Ship.RollDamage") });
    if (hit && target.type === "ship") buttons.push({ action: "shipEvasive", icon: "fa-solid fa-route", label: localize("DTD.Ship.Evasive") });
    const lines = [{ text: hit ? format("DTD.Ship.Hit", { n: group.length }) : localize("DTD.Ship.Miss") }];
    if (beyond) lines.push({ text: format("DTD.Ship.SnipeSd", { n: 2 * beyond }) });
    const extraContent = await foundry.applications.handlebars.renderTemplate(EXTRA_TEMPLATE, { lines, buttons });
    await postTest({
      actor: ship, label, testResult, extraContent,
      flags: { shipAttack: { shipUuid: ship.uuid, targetUuid: target.uuid, weapons: group.map((g) => ({ id: g.id, name: g.name.replace(/ \(×\d+\)$/, ""), profile: g.profile, torpedo: g.torpedo })), total: testResult.total, tn, hit, subsystemId: choice.subsystem ?? "" } }
    });
  }
}

/**
 * Roll the damage of an attack card, one card per weapon (p. 408): the weapon's dice, the first also with Overcharge
 * Weapons; Weapon Capacitor adds 1k0 to non-torpedo weapons.
 * @param {ChatMessage} message
 */
export async function rollShipDamage(message) {
  const attack = message.getFlag("dtd40k", "shipAttack");
  if (!attack?.hit) return;
  const defense = message.getFlag("dtd40k", "defense");
  if (defense && !defense.hits) {
    ui.notifications.warn(localize("DTD.Combat.Avoided"));
    return;
  }
  const ship = await foundry.utils.fromUuid(attack.shipUuid);
  if (!ship?.isOwner) return;
  let overcharge = roundState(ship, "overchargeWeapons");
  if (overcharge && ship.type === "ship") await ship.update({ "system.state.round.overchargeWeapons": null });
  const capacitor = hasConsole(ship, "weaponCapacitor");
  for (const w of attack.weapons) {
    const pool = { rolled: w.profile.dam.rolled + (overcharge?.rolled ?? 0) + (capacitor && !w.torpedo ? 1 : 0), kept: w.profile.dam.kept + (overcharge?.kept ?? 0), flat: 0 };
    const notes = [overcharge && localize("DTD.Ship.OverchargeApplied"), capacitor && !w.torpedo && localize("DTD.Ship.CapacitorApplied")].filter(Boolean);
    overcharge = null;
    // Target Subsystem ignores the shields (p. 405).
    await postShipDamage(ship, { label: format("DTD.Ship.DamageOf", { weapon: w.name }), pool, dis: w.profile.dis, crit: w.profile.crit, targetUuid: attack.targetUuid, subsystemId: attack.subsystemId, bypass: Boolean(attack.subsystemId), notes });
  }
}

/**
 * Post a ship damage card with its Apply button.
 * @param {Actor} ship
 * @param {{label: string, pool: object, dis: number, crit: number, targetUuid?: string, subsystemId?: string, bypass?: boolean, notes?: string[], total?: number}} damage
 */
export async function postShipDamage(ship, { label, pool, dis = 0, crit = 0, targetUuid = "", subsystemId = "", bypass = false, notes = [], total = null }) {
  const normalized = normalizePool(pool);
  const result = total === null ? rollAndKeep(normalized, { rng }) : { total, dice: [] };
  const content = await foundry.applications.handlebars.renderTemplate(DAMAGE_TEMPLATE, {
    label, formula: formatPool(normalized), total: result.total, dis, crit, bypass, notes,
    dice: result.dice.map((die) => ({ total: die.total, kept: die.kept, exploded: die.chain.length > 1, chainText: die.chain.join(" + ") }))
  });
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: ship }), content,
    flags: { dtd40k: { shipDamage: { shipUuid: ship.uuid, targetUuid, total: result.total, dis, crit, subsystemId, bypass } } }
  });
}

/**
 * The ship Apply (FR-008–FR-010): on a squadron one craft falls; on a ship the shield takes it first (Multiphasic by
 * layers; collapse wastes the excess; Disruption if it holds), then temporary Hull, then Hull with a Crit Chart roll
 * (+ the weapon's Crit); Hull 0 destroys the ship. Players' hits on ships they do not own go to the GM.
 * @param {ChatMessage} message
 * @param {string} [targetUuid]  defaults to the card's target, else the user's target
 */
export async function applyShipDamage(message, targetUuid) {
  const damage = message.getFlag("dtd40k", "shipDamage");
  if (!damage) return;
  const uuid = targetUuid || damage.targetUuid || [...game.user.targets][0]?.actor?.uuid;
  const target = uuid ? await foundry.utils.fromUuid(uuid) : null;
  if (!target || !["ship", "squadron"].includes(target.type)) {
    ui.notifications.warn(localize("DTD.Ship.NeedTarget"));
    return;
  }
  if (!target.isOwner) {
    requestGm("shipApply", { messageId: message.id, targetUuid: target.uuid });
    return;
  }
  if (target.type === "squadron") return hitSquadron(target, message);
  const s = target.system;
  const before = { hull: foundry.utils.deepClone(s.toObject().hull), shield: s.toObject().shield, crew: s.toObject().crew, state: s.toObject().state };
  const update = {};
  const lines = [];
  let toHull = damage.total;
  if (!damage.bypass) {
    if (s.shield.layerCount) {
      const r = multiphasicHit(s.shield.layers, damage.total, damage.dis);
      update["system.shield.layers"] = r.layers;
      toHull = r.toHull;
    } else {
      const r = shieldHit({ value: s.shield.value, disruption: s.shield.disruption, collapsed: s.shield.collapsed || s.shield.max === 0, damage: damage.total, dis: damage.dis });
      Object.assign(update, { "system.shield.value": r.value, "system.shield.disruption": r.disruption, "system.shield.collapsed": s.shield.max > 0 && r.collapsed });
      toHull = s.shield.max === 0 ? damage.total : r.toHull;
      if (s.shield.max > 0 && !s.shield.collapsed) lines.push({ text: r.collapsed ? localize("DTD.Ship.ShieldDown") : format("DTD.Ship.ShieldHit", { value: r.value, dis: r.disruption }) });
    }
  }
  if (toHull > 0 && hasConsole(target, "ablativeArmor") && !target.system.state.round?.ablative) {
    update["system.state.round.ablative"] = true;
    lines.push({ text: localize("DTD.Ship.AblativeSaved") });
    toHull = 0;
  }
  let crit = null;
  if (toHull > 0) {
    const fromTemp = Math.min(s.hull.temp, toHull);
    const hull = Math.max(0, s.hull.value - (toHull - fromTemp));
    Object.assign(update, { "system.hull.temp": s.hull.temp - fromTemp, "system.hull.value": hull, "system.state.destroyed": s.state.destroyed || hull <= 0 });
    lines.push({ text: format("DTD.Ship.HullHit", { n: toHull, hull, max: s.hull.max }) });
    if (hull <= 0) lines.push({ warning: true, text: localize("DTD.Ship.Destroyed") });
    else crit = damage.crit;
  }
  await target.update(update);
  if (damage.subsystemId && toHull > 0) {
    const part = target.items.get(damage.subsystemId);
    if (part) {
      await target.update({ "system.state.disabled": [...target.system.state.disabled, part.id], "system.state.crits": [...target.system.state.crits, { key: "subsystem", tn: damage.total, itemId: part.id }] });
      lines.push({ warning: true, text: format("DTD.Ship.SubsystemDown", { name: part.name, tn: damage.total }) });
    }
  }
  if (crit !== null && !target.system.state.destroyed) lines.push(...(await rollCrit(target, { bonus: crit })));
  await postShipCard(target, {
    title: `${localize("DTD.Ship.Applied")} — ${target.name}`, lines,
    buttons: [{ action: "shipUndo", icon: "fa-solid fa-rotate-left", label: localize("DTD.Combat.Undo"), gm: true }],
    flags: { shipApplied: { targetUuid: target.uuid, before } }
  });
}

/** A hit on a fighter squadron downs one craft; its Crew is lost to the ship (research R7). */
async function hitSquadron(squadron, message) {
  const { downCraft } = await import("./squadron-service.mjs");
  return downCraft(squadron, message);
}

/** Undo an applied ship card — GM only. */
export async function undoShipDamage(message) {
  if (!game.user.isGM) return;
  const applied = message.getFlag("dtd40k", "shipApplied");
  const target = applied ? await foundry.utils.fromUuid(applied.targetUuid) : null;
  if (!target) return;
  await target.update({ "system.hull": applied.before.hull, "system.shield": applied.before.shield, "system.crew": applied.before.crew, "system.state": applied.before.state });
  await message.setFlag("dtd40k", "undone", true);
}

/**
 * Roll the Crit Chart (p. 409) and apply the row: Crew lost, extra Hull, lasting effects (with their repair TN), a
 * console knocked out, another roll for a Secondary Explosion. Tenebro-Maze rolls twice and keeps the milder.
 * @param {Actor} ship
 * @param {{bonus?: number}} [options]  the weapon's Crit and other modifiers
 * @returns {Promise<object[]>} card lines
 */
export async function rollCrit(ship, { bonus = 0 } = {}) {
  const s = ship.system;
  const braced = roundState(ship, "braced")?.penalty ?? 0;
  const mod = bonus + s.critModifier - braced;
  let d10 = Math.floor(rng() * 10) + 1;
  if (hasConsole(ship, "tenebroMaze")) d10 = Math.min(d10, Math.floor(rng() * 10) + 1);
  const total = d10 + mod;
  const row = critRow(total);
  const m = row.mechanics;
  const lines = [{ label: `${localize("DTD.Ship.CritChart")} ${d10}${mod ? (mod > 0 ? `+${mod}` : mod) : ""}`, text: `${localize(`DTD.Ship.Crit.${row.key}`)} — ${row.effect}`, warning: row.key !== "armorScuffing" }];
  const crewLost = amount(m.crewLoss);
  const hullLost = amount(m.hullLoss);
  const update = {};
  if (crewLost) update["system.crew.lost"] = s.crew.lost + crewLost;
  if (hullLost) {
    const hull = Math.max(0, s.hull.value - hullLost);
    Object.assign(update, { "system.hull.value": hull, "system.state.destroyed": s.state.destroyed || hull <= 0 });
  }
  const crits = [...s.state.crits];
  const disabled = [...s.state.disabled];
  if (m.persistent) {
    const entry = { key: row.key, tn: m.repairTn ?? 15 };
    if (m.disable) {
      const consoles = ship.items.filter((i) => i.type === "shipComponent" && i.system.category === "console" && !disabled.includes(i.id));
      const hit = consoles.length ? consoles[Math.floor(rng() * consoles.length)] : null;
      if (hit) { entry.itemId = hit.id; disabled.push(hit.id); lines.push({ text: format("DTD.Ship.ConsoleDown", { name: hit.name }) }); }
      else lines.push({ text: localize("DTD.Ship.NoConsoleToHit") });
    }
    if (!m.disable || entry.itemId) crits.push(entry);
  }
  if (crewLost) lines.push({ text: format("DTD.Ship.CrewLost", { n: crewLost }) });
  if (hullLost) lines.push({ text: format("DTD.Ship.ExtraHull", { n: hullLost }) });
  Object.assign(update, { "system.state.crits": crits, "system.state.disabled": disabled });
  await ship.update(update);
  if (m.rollAgain && !ship.system.state.destroyed) lines.push(...(await rollCrit(ship, { bonus })));
  return lines;
}

/**
 * Evasive Manoeuvers against an attack card (p. 404): a Reaction of the Helmsman while Crew are free; the pilot roll
 * with the committed Crew plus Maneuverability, half added to the Static Defense against that attack.
 * @param {ChatMessage} message
 */
export async function evasive(message) {
  const attack = message.getFlag("dtd40k", "shipAttack");
  const ship = attack?.targetUuid ? await foundry.utils.fromUuid(attack.targetUuid) : null;
  if (ship?.type !== "ship" || !ship.isOwner) {
    ui.notifications.warn(localize("DTD.Combat.NotYourTarget"));
    return;
  }
  const action = actionOf("evasiveManoeuvers");
  const choice = await promptCrew(ship, `${action.name} — ${ship.name}`);
  if (!choice) return;
  if (!(await takeShipAction(ship, action))) return;
  if (!(await commitShipCrew(ship, choice.crew))) return;
  const { pool } = departmentPool(ship, action, choice.crew);
  const roll = await rollShipPool(ship, { pool, label: `${action.name} — ${ship.name}` });
  const total = roll?.getFlag("dtd40k", "test")?.total ?? 0;
  const sd = defendedSd(attack.tn, total);
  const hits = stillHits({ attackTotal: attack.total, sd });
  const content = await foundry.applications.handlebars.renderTemplate(DEFENSE_TEMPLATE, { name: ship.name, kind: action.name, total, bonus: Math.floor(Math.max(0, total) / 2), sd, hits });
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: ship }), content });
  if (game.user.isGM || message.isOwner) await message.setFlag("dtd40k", "defense", { kind: "evasive", total, sd, hits });
}

// ---------------------------------------------------------------------------------------------------------------
// Ramming and boarding (R8)

/**
 * Ramming Speed! (p. 404): a free action at the end of the move within 1 VU of the target; Pilot + Maneuverability
 * with committed Crew against its Static Defense; on a hit the target takes class damage + Speed past the shields and
 * the rammer half of it (none with a Ramming Prow); both roll the Crit Chart at +3 (+5 on the target with a Prow).
 * @param {Actor} ship
 */
export async function ram(ship) {
  const target = [...game.user.targets][0]?.actor ?? null;
  if (target?.type !== "ship") {
    ui.notifications.warn(localize("DTD.Ship.NeedShipTarget"));
    return null;
  }
  const action = actionOf("rammingSpeed");
  const choice = await promptCrew(ship, `${action.name} — ${ship.name} → ${target.name}`);
  if (!choice) return null;
  if (!(await takeShipAction(ship, action))) return null;
  if (!(await commitShipCrew(ship, choice.crew))) return null;
  const { pool } = departmentPool(ship, action, choice.crew);
  const message = await rollShipPool(ship, { pool, tn: target.system.derived.staticDefense, label: `${action.name} — ${ship.name} → ${target.name}`, lines: hasConsole(ship, "grapplerArms") ? [{ text: localize("DTD.Ship.GrapplerNote") }] : [] });
  if (!message?.getFlag("dtd40k", "test")?.outcome?.success) return message;
  const prow = hasConsole(ship, "rammingProw");
  const ramPool = ramDamage(ship.system.stats.hullClass, { prow, speed: ship.system.stats.speed });
  const dmg = await postShipDamage(ship, { label: format("DTD.Ship.RamTarget", { name: target.name }), pool: ramPool, crit: ramPool.targetCrit, targetUuid: target.uuid, bypass: true });
  if (ramPool.selfDamage) {
    const half = Math.floor(dmg.getFlag("dtd40k", "shipDamage").total / 2);
    await postShipDamage(ship, { label: format("DTD.Ship.RamSelf", { name: ship.name }), pool: ramPool, crit: ramPool.crit, targetUuid: ship.uuid, bypass: true, total: half });
  }
  return message;
}

/**
 * Boarding Party (p. 405): up to 10 Crew and optionally an officer cross to a ship in range; a boarding card then runs
 * the rounds.
 * @param {Actor} ship
 */
export async function startBoarding(ship) {
  const target = [...game.user.targets][0]?.actor ?? null;
  if (target?.type !== "ship") {
    ui.notifications.warn(localize("DTD.Ship.NeedShipTarget"));
    return null;
  }
  const action = actionOf("boardingParty");
  const range = boardingRange({ assaultShuttles: hasConsole(ship, "assaultShuttles"), teleportarium: hasConsole(ship, "teleportarium"), targetShielded: target.system.shield.value > 0 && !target.system.shield.collapsed });
  const choice = await promptCrew(ship, `${action.name} — ${ship.name} → ${target.name}`, `<p class="hint">${format("DTD.Ship.BoardingRange", { vu: range })}</p>`);
  if (!choice) return null;
  if (!(await takeShipAction(ship, action))) return null;
  await ship.update({ "system.crew.deployed": ship.system.crew.deployed + choice.crew });
  const boarding = { attackerUuid: ship.uuid, defenderUuid: target.uuid, party: choice.crew, round: 0, done: false, log: [] };
  return postShipCard(ship, {
    title: `${action.name} — ${ship.name} → ${target.name}`,
    lines: [{ text: format("DTD.Ship.BoardingStart", { n: choice.crew, vu: range }) }],
    buttons: [{ action: "boardingRound", icon: "fa-solid fa-people-group", label: localize("DTD.Ship.BoardingRound"), gm: true }],
    flags: { boarding }
  });
}

/**
 * A boarding round (GM): both sides commit up to 10 Crew to an opposed Weaponry test (attackers keep the boarding
 * officer's dots or 4; defenders the Chief of Security's, +2 raises on success, and Murder Servitors add 5 Crew); the
 * loser loses half of what it committed plus 1 per check, at most 10. The boarding ends when a side has no one left.
 * @param {ChatMessage} message
 */
export async function boardingRound(message) {
  if (!game.user.isGM) return;
  const b = foundry.utils.deepClone(message.getFlag("dtd40k", "boarding"));
  if (!b || b.done) return;
  const attacker = await foundry.utils.fromUuid(b.attackerUuid);
  const defender = await foundry.utils.fromUuid(b.defenderUuid);
  if (!attacker || !defender) return;
  const atkCrew = Math.min(10, b.party);
  const servitors = hasConsole(defender, "murderServitors") ? 5 : 0;
  const defCrew = Math.min(10, defender.system.crew.max - defender.system.crew.deployed) + servitors;
  const security = officerOf(defender, "chiefOfSecurity");
  const atkKept = officerKept(attacker, "tactical", "weaponry").kept;
  // The Chief of Security leads the defense (+2 raises); without one, the Tactical post.
  const defKept = security?.actor ? Math.max(1, security.actor.system.skills?.weaponry?.value ?? 0) : security ? 4 : officerKept(defender, "tactical", "weaponry").kept;
  const roll = (crew, kept, flat) => runTest({ base: { rolled: Math.max(1, Math.min(10, crew)), kept, flat }, tn: null, rng }).total;
  const atk = roll(atkCrew, atkKept, 0);
  const def = roll(Math.min(10, defCrew), defKept, security ? 10 : 0);
  const atkWins = atk > def;
  const checks = Math.floor(Math.abs(atk - def) / 5);
  const loss = boardingLoss({ committed: atkWins ? Math.min(10, defCrew) : atkCrew, checks });
  b.round += 1;
  if (atkWins) {
    await defender.update({ "system.crew.lost": defender.system.crew.lost + loss });
  } else {
    b.party = Math.max(0, b.party - loss);
    await attacker.update({ "system.crew.deployed": Math.max(0, attacker.system.crew.deployed - loss), "system.crew.lost": attacker.system.crew.lost + loss });
  }
  b.log.push(format("DTD.Ship.BoardingLog", { round: b.round, atk, def, winner: atkWins ? attacker.name : defender.name, loss }));
  const defenderLeft = defender.system.crew.max - defender.system.crew.deployed;
  if (b.party <= 0 || defenderLeft <= 0) {
    b.done = true;
    if (b.party > 0) await attacker.update({ "system.crew.deployed": Math.max(0, attacker.system.crew.deployed - b.party) });
    b.log.push(b.party > 0 ? format("DTD.Ship.BoardingWon", { name: attacker.name, target: defender.name }) : format("DTD.Ship.BoardingRepelled", { name: defender.name }));
  }
  const content = await foundry.applications.handlebars.renderTemplate("systems/dtd40k/templates/chat/vehicle-card.hbs", {
    title: `${localize("DTD.Ship.BoardingParty")} — ${attacker.name} → ${defender.name}`,
    subtitle: format("DTD.Ship.BoardingParty2", { n: b.party }),
    lines: b.log.map((text) => ({ text })),
    buttons: b.done ? [] : [{ action: "boardingRound", icon: "fa-solid fa-people-group", label: localize("DTD.Ship.BoardingRound"), gm: true }]
  });
  await message.update({ content, "flags.dtd40k.boarding": b });
}

// ---------------------------------------------------------------------------------------------------------------
// Start of turn and end of round

/**
 * Start of a ship's turn (active GM): the shield regenerates less its Disruption (Multiphasic by layers); Cycle Shields
 * clears the Disruption, Reboot Shields brings a collapsed shield back; a surprised ship loses its first turn.
 * @param {Combat} combat
 * @param {Combatant} combatant
 */
export async function startOfShipTurn(combat, combatant) {
  const ship = combatant?.actor;
  if (ship?.type !== "ship" || ship.system.state.destroyed) return;
  const s = ship.system;
  const r = s.state.round ?? {};
  const update = {};
  let collapsed = s.shield.collapsed;
  let disruption = s.shield.disruption;
  let value = s.shield.value;
  if (r.rebootShields && r.rebootShields.round < combat.round) { collapsed = false; value = 0; update["system.state.round.rebootShields"] = null; }
  if (r.cycleShields && r.cycleShields.round < combat.round) { disruption = 0; update["system.state.round.cycleShields"] = null; }
  if (s.shield.layerCount) update["system.shield.layers"] = multiphasicRegen(s.shield.layers, s.shield.max, s.shield.regen);
  else if (s.shield.max > 0) Object.assign(update, { "system.shield.value": shieldRegen({ value, max: s.shield.max, regen: s.shield.regen, disruption, collapsed }), "system.shield.collapsed": collapsed, "system.shield.disruption": disruption });
  if (Object.keys(update).length) await ship.update(update);
}

/**
 * End of a ship's turn: a missing Manoeuver is announced (it is mandatory); an adrift ship drifts half its Speed.
 * @param {Combatant} combatant
 * @param {{round?: number}} [context]  the turn that just ended (the combat may already be in the next round)
 */
export async function endOfShipTurn(combatant, context = {}) {
  const ship = combatant?.actor;
  if (ship?.type !== "ship" || ship.system.state.destroyed) return;
  const turn = shipTurn(combatant, context.round ?? combatant.combat?.round ?? 0);
  const lines = [];
  if (ship.system.blocked.manoeuver) lines.push({ text: format("DTD.Ship.Drifting", { n: Math.floor(ship.system.stats.speed / 2) }) });
  else if (!turn.manoeuver) lines.push({ warning: true, text: localize("DTD.Ship.NoManoeuver") });
  if (lines.length) await postShipCard(ship, { title: ship.name, lines });
}

/**
 * End of a round: Radiation Leak kills 1 Crew on every ship that has it (p. 409).
 * @param {Combat} combat
 */
export async function endOfShipRound(combat) {
  for (const ship of new Set(combat.combatants.map((c) => c.actor).filter((a) => a?.type === "ship"))) {
    const leaks = ship.system.state.crits.filter((c) => c.key === "radiationLeak").length;
    if (!leaks || ship.system.state.destroyed) continue;
    await ship.update({ "system.crew.lost": ship.system.crew.lost + leaks });
    await postShipCard(ship, { title: ship.name, lines: [{ warning: true, text: format("DTD.Ship.RadiationTick", { n: leaks }) }] });
  }
}
