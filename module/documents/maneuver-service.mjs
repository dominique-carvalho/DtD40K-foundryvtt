import { CHARACTERISTICS, SKILLS } from "../config.mjs";
import { rng } from "../dice/roll-service.mjs";
import { opposedResult, pushDistance, slipFreeTn } from "../rules/maneuvers.mjs";
import { buildCharacteristicPool, buildSkillPool } from "../rules/pool.mjs";
import { runTest } from "../rules/test.mjs";
import { hitLocation } from "../rules/weapon.mjs";
import { rollDamage } from "./attack-service.mjs";
import { toggleCondition } from "./condition-service.mjs";
import { requestGm } from "./damage-service.mjs";

/**
 * Opposed tests and the Grapple (spec 017, research R1 and R5): Bull Rush, Knock Down, Disarm and Feint against a
 * target; entering, keeping and escaping a grapple. Contract: specs/017-combat-actions/contracts/foundry-api.md.
 */

const OPPOSED_TEMPLATE = "systems/dtd40k/templates/chat/opposed-card.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
const hasFeat = (actor, name) => actor.items.some((item) => item.type === "feat" && item.name === name);
const grappleOf = (actor) => actor?.getFlag("dtd40k", "grapple") ?? null;

/**
 * Turn a condition on or off, through the GM for actors the user does not own.
 * @param {Actor} actor
 * @param {string} id
 * @param {boolean} active
 */
export async function setStatus(actor, id, active) {
  if (actor.statuses.has(id) === active) return;
  if (actor.isOwner) await toggleCondition(actor, id, { active });
  else requestGm("maneuver", { op: "status", actorUuid: actor.uuid, id, active });
}

/** Store or clear the grapple link of an actor (through the GM when needed). */
async function setGrapple(actor, value) {
  if (actor.isOwner) await (value ? actor.setFlag("dtd40k", "grapple", value) : actor.unsetFlag("dtd40k", "grapple"));
  else requestGm("maneuver", { op: "grapple", actorUuid: actor.uuid, value });
}

/**
 * GM side of the requests above (called from the socket in dtd40k.mjs).
 * @param {{op: string, actorUuid: string, id?: string, active?: boolean, value?: object|null}} payload
 */
export async function maneuverAsGm(payload) {
  const actor = await foundry.utils.fromUuid(payload.actorUuid);
  if (!actor) return;
  if (payload.op === "status") await toggleCondition(actor, payload.id, { active: payload.active });
  if (payload.op === "grapple") await setGrapple(actor, payload.value);
}

/**
 * A test rolled without its own card: characteristic k characteristic, or skill + characteristic.
 * @param {Actor} actor
 * @param {{kind: "characteristic"|"skill", key: string, bonus?: number}} spec  bonus: characteristic dots
 */
function silentTest(actor, { kind, key, bonus = 0 }) {
  const base = kind === "skill"
    ? buildSkillPool({
      skill: actor.system.skills[key].value,
      characteristic: actor.system.characteristics[SKILLS[key].characteristic].value,
      advanced: SKILLS[key].advanced
    })
    : buildCharacteristicPool({ characteristic: actor.system.characteristics[key].value + bonus });
  return runTest({ base, tn: null, rng, ...actor.withRollModifiers({}, kind === "skill" ? key : undefined) });
}

/**
 * Opposed test (FR-006): both sides roll at once; the highest total wins (the defender on a tie), one raise per 5.
 * @param {Actor} a  the one who acts
 * @param {Actor} b  the one who resists
 * @param {{kind: string, key: string, bonusA?: number, bonusB?: number, label: string, outcome?: (r: object) => string}} spec
 * @returns {Promise<{winner: "a"|"b", raises: number, totalA: number, totalB: number}>}
 */
export async function opposedTest(a, b, { kind, key, bonusA = 0, bonusB = 0, label, outcome }) {
  const testA = silentTest(a, { kind, key, bonus: bonusA });
  const testB = silentTest(b, { kind, key, bonus: bonusB });
  const result = { ...opposedResult(testA.total, testB.total), totalA: testA.total, totalB: testB.total };
  const keyLabel = localize((kind === "skill" ? SKILLS : CHARACTERISTICS)[key].label);
  const side = (actor, test, bonus) => ({
    name: actor.name, total: test.total, dice: test.dice.map((die) => ({ value: die.total, kept: die.kept })),
    bonus: bonus ? `+${bonus}` : ""
  });
  const content = await foundry.applications.handlebars.renderTemplate(OPPOSED_TEMPLATE, {
    label, keyLabel, sides: [side(a, testA, bonusA), side(b, testB, bonusB)],
    winner: result.winner === "a" ? a.name : b.name, raises: result.raises, outcome: outcome?.(result) ?? ""
  });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: a }), content,
    flags: { dtd40k: { opposed: { a: a.uuid, b: b.uuid, ...result, kind, key } } }
  });
  return result;
}

/** The actor of the user's first target, or a warning. */
export function targetActor() {
  const actor = [...game.user.targets][0]?.actor ?? null;
  if (!actor) ui.notifications.warn(localize("DTD.Maneuver.NoTarget"));
  return actor;
}

/**
 * Bull Rush, Knock Down, Disarm or Feint against the user's target (FR-006, pp. 425–428).
 * @param {Actor} actor
 * @param {"bullRush"|"knockDown"|"disarm"|"feint"} key
 * @param {Actor} target
 */
export async function useManeuver(actor, key, target) {
  const kind = key === "bullRush" || key === "knockDown" ? "characteristic" : "skill";
  const stat = kind === "characteristic" ? "str" : "weaponry";
  const steady = hasFeat(target, "Squat Stability");
  const result = await opposedTest(actor, target, {
    kind, key: stat, label: localize(`DTD.Maneuver.${key}`),
    outcome: (r) => {
      if (key === "bullRush") return r.winner === "a" ? (steady ? localize("DTD.Maneuver.Steady") : format("DTD.Maneuver.Pushed", { name: target.name, m: 2 + 2 * r.raises })) : localize("DTD.Maneuver.NoEffect");
      if (key === "knockDown") {
        if (r.winner === "a") return steady ? localize("DTD.Maneuver.Steady") : format("DTD.Maneuver.KnockedDown", { name: target.name });
        return r.raises >= 2 ? format("DTD.Maneuver.KnockedDown", { name: actor.name }) : localize("DTD.Maneuver.NoEffect");
      }
      if (key === "disarm") return r.winner === "a" && r.raises >= 2 ? format("DTD.Maneuver.Disarmed", { name: target.name }) : localize("DTD.Maneuver.NoEffect");
      return r.winner === "a" ? format("DTD.Maneuver.Feinted", { name: target.name }) : localize("DTD.Maneuver.NoEffect");
    }
  });
  if (key === "knockDown" && result.winner === "a" && !steady) await setStatus(target, "prone", true);
  if (key === "knockDown" && result.winner === "b" && result.raises >= 2) await setStatus(actor, "prone", true);
  return result;
}

/**
 * "Start grapple" on the card of a Grapple attack that hit (FR-007): the attacker controls, the target is grappled;
 * both leave Pinned (being in melee frees from Pinning).
 * @param {ChatMessage} message
 */
export async function startGrapple(message) {
  const attack = message.getFlag("dtd40k", "attack");
  const actor = attack ? await foundry.utils.fromUuid(attack.actorUuid) : null;
  const target = attack?.targetUuid ? await foundry.utils.fromUuid(attack.targetUuid) : null;
  if (!actor?.isOwner || !target) {
    ui.notifications.warn(localize("DTD.Maneuver.NoTarget"));
    return;
  }
  if (message.getFlag("dtd40k", "defense")?.hits === false || attack.hits === 0) {
    ui.notifications.warn(localize("DTD.Grapple.Missed"));
    return;
  }
  await setStatus(actor, "grappling", true);
  await setStatus(target, "grappled", true);
  await setGrapple(actor, { partner: target.uuid, controller: true });
  await setGrapple(target, { partner: actor.uuid, controller: false });
  for (const who of [actor, target]) await setStatus(who, "pinned", false);
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${format("DTD.Grapple.Started", { a: actor.name, b: target.name })}</p>` });
}

/**
 * End a grapple: both conditions and links go.
 * @param {Actor} actor  either side
 */
export async function endGrapple(actor) {
  const partner = await foundry.utils.fromUuid(grappleOf(actor)?.partner ?? "");
  for (const who of [actor, partner].filter(Boolean)) {
    await setStatus(who, "grappling", false);
    await setStatus(who, "grappled", false);
    await setGrapple(who, null);
  }
}

/** Swap the controller of a grapple (Take Control). */
async function swapControl(actor, partner) {
  await setStatus(partner, "grappling", false);
  await setStatus(actor, "grappled", false);
  await setStatus(actor, "grappling", true);
  await setStatus(partner, "grappled", true);
  await setGrapple(actor, { partner: partner.uuid, controller: true });
  await setGrapple(partner, { partner: actor.uuid, controller: false });
}

/** A Half Action back after escaping (p. 427): the Full Action spent becomes one Half. */
async function regainHalf(actor, key) {
  const combatant = game.combat?.combatants.find((c) => c.actor === actor);
  if (!combatant?.isOwner) return;
  await combatant.setTurnState({ ...combatant.turnState, full: false, halves: [key] });
}

/** Damage of an automatic hit on the grappled partner (Attack with Weapon, Crushing Bear). */
async function grappleDamage(actor, partner, itemId, raises) {
  const attack = {
    actorUuid: actor.uuid, ownerUuid: "", vehicle: false, itemId, raises, hits: 1, location: hitLocation(Math.floor(rng() * 10) + 1),
    targetUuid: partner.uuid, helpless: false, melee: true, special: null, ammoId: "",
    options: { range: "normal", aim: 0, mode: "single", braced: false, oneHanded: true, thrown: false }
  };
  const damage = await rollDamage({ getFlag: (scope, key) => (key === "attack" ? attack : undefined) });
  const token = partner.getActiveTokens(false, true)[0];
  if (damage && token) await damage.setFlag("dtd40k", "damage", { ...damage.getFlag("dtd40k", "damage"), tokenUuids: [token.uuid] });
}

/** One-handed weapons for Attack with Weapon (p. 427). */
const oneHanded = (actor) => actor.items.filter((item) => item.type === "weapon" && item.system.equipped
  && (item.system.weaponType === "pistol" || (item.system.weaponType === "melee" && item.system.group !== "Two Handed")));

/**
 * Controller's turn (FR-008): pick an option, opposed Strength (Bear Hug +1), apply it on a win; Release needs no
 * roll. After Take Control the option is taken at once with the raises of that test.
 * @param {Actor} actor
 * @param {{won?: {winner: string, raises: number}|null}} [options]
 */
export async function controlGrapple(actor, { won = null } = {}) {
  const link = grappleOf(actor);
  const partner = link?.controller ? await foundry.utils.fromUuid(link.partner) : null;
  if (!partner) {
    ui.notifications.warn(localize("DTD.Grapple.NotControlling"));
    return null;
  }
  const weapons = oneHanded(actor);
  const options = ["weapon", "throwDown", "push", "ready", "stand", "useItem", "release"]
    .filter((key) => key !== "weapon" || weapons.length)
    .map((key) => `<label class="grapple-option"><input type="radio" name="option" value="${key}" ${key === "throwDown" ? "checked" : ""}> ${localize(`DTD.Grapple.Option.${key}`)}</label>`).join("");
  const select = weapons.length ? `<select name="weapon">${weapons.map((w) => `<option value="${w.id}">${w.name}</option>`).join("")}</select>` : "";
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: format("DTD.Grapple.ControlTitle", { name: partner.name }) },
    content: `<div class="grapple-options">${options}${select}</div>`, rejectClose: false,
    buttons: [{ action: "ok", label: "DTD.Grapple.Go", default: true, callback: (event, button) => ({ option: button.form.elements.option.value, weapon: button.form.elements.weapon?.value ?? "" }) }]
  });
  if (!choice) return null;
  if (choice.option === "release") return endGrapple(actor);
  const steady = hasFeat(partner, "Squat Stability");
  const result = won ?? await opposedTest(actor, partner, {
    kind: "characteristic", key: "str", bonusA: hasFeat(actor, "Bear Hug") ? 1 : 0, label: localize(`DTD.Grapple.Option.${choice.option}`),
    outcome: (r) => {
      if (r.winner !== "a") return localize("DTD.Grapple.Held");
      if ((choice.option === "throwDown" || choice.option === "push") && steady) return localize("DTD.Maneuver.Steady");
      if (choice.option === "push") return format("DTD.Maneuver.Pushed", { name: partner.name, m: pushDistance({ raises: r.raises, speed: actor.system.derived.speed }) });
      if (choice.option === "throwDown") return format("DTD.Maneuver.KnockedDown", { name: partner.name });
      return localize(`DTD.Grapple.Done.${choice.option}`);
    }
  });
  if (result.winner !== "a") return result;
  if (won) await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><b>${localize(`DTD.Grapple.Option.${choice.option}`)}</b> — ${partner.name}</p>` });
  if (choice.option === "throwDown" && !steady) await setStatus(partner, "prone", true);
  if (choice.option === "stand") await setStatus(actor, "prone", false);
  if (choice.option === "weapon") await grappleDamage(actor, partner, choice.weapon, result.raises);
  // Crushing Bear (p. 182): unarmed damage each turn the grapple is kept.
  if (hasFeat(actor, "Crushing Bear")) await grappleDamage(actor, partner, "unarmed", 0);
  return result;
}

/**
 * Grappled character's turn (FR-009): Break Free (opposed Strength), Slip Free (Dexterity TN 20, 25 against Bear
 * Hug) or Take Control (opposed Strength, then an option at once); escaping gives a Half Action back.
 * @param {Actor} actor
 * @param {"breakFree"|"slipFree"|"takeControl"} mode
 */
export async function escapeGrapple(actor, mode) {
  const link = grappleOf(actor);
  const partner = link && !link.controller ? await foundry.utils.fromUuid(link.partner) : null;
  if (!partner) {
    ui.notifications.warn(localize("DTD.Grapple.NotGrappled"));
    return;
  }
  const bearHug = hasFeat(partner, "Bear Hug") ? 1 : 0;
  if (mode === "slipFree") {
    const roll = await actor.rollCharacteristic("dex", { fastForward: true, tn: slipFreeTn({ bearHug: Boolean(bearHug) }), label: localize("DTD.Grapple.SlipFree") });
    if (!roll?.getFlag("dtd40k", "test")?.outcome?.success) return;
    await endGrapple(actor);
    await regainHalf(actor, mode);
    return;
  }
  const result = await opposedTest(actor, partner, {
    kind: "characteristic", key: "str", bonusB: bearHug, label: localize(`DTD.Grapple.${mode === "breakFree" ? "BreakFree" : "TakeControl"}`),
    outcome: (r) => localize(r.winner === "a" ? `DTD.Grapple.Won.${mode}` : "DTD.Grapple.Held")
  });
  if (result.winner !== "a") return;
  if (mode === "breakFree") {
    await endGrapple(actor);
    await regainHalf(actor, mode);
    return;
  }
  await swapControl(actor, partner);
  await controlGrapple(actor, { won: result });
}

