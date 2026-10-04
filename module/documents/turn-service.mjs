import { postTest, rng } from "../dice/roll-service.mjs";
import { COMBAT_ACTIONS } from "../rules/combat-actions.mjs";
import { combatFlags, defendedSd, dodgeModifiers, multipleAttackPenalty, parryPool, stillHits } from "../rules/defense.mjs";
import { runTest } from "../rules/test.mjs";
import { canUse, spend, usesDelay } from "../rules/turn.mjs";
import { restriction } from "../rules/maneuvers.mjs";
import { isProficient } from "../rules/weapon.mjs";
import { rollAttack } from "./attack-service.mjs";
import { addFatigue, toggleCondition } from "./condition-service.mjs";
import { checkZoneWeapon, endOverwatch, placeZone, postPinningEscape, zonesAtTurnStart } from "./zone-service.mjs";
import { ammoWeapon, clearJam, reloadCheck, reloadWeapon, resetReloadProgress } from "./ammo-service.mjs";
import { controlGrapple, endGrapple, escapeGrapple, useManeuver } from "./maneuver-service.mjs";

/**
 * Combat actions, turn limits, reactions and start/end of turn (spec 008, US2; research R4–R7).
 * Contract: specs/008-combat/contracts/foundry-api.md ("turn-service").
 */

const localize = (key) => game.i18n.localize(key);
const DEFENSE_TEMPLATE = "systems/dtd40k/templates/chat/defense.hbs";

/**
 * The combatant of an actor in the active combat, if any.
 * @param {Actor} actor
 * @returns {Combatant|null}
 */
export function combatantOf(actor) {
  const combat = game.combat;
  if (!combat?.started) return null;
  return combat.combatants.find((c) => c.actor === actor || c.actorId === actor.id) ?? null;
}

/**
 * Check the turn limits and record the action (FR-007). Outside combat nothing is tracked; a refusal can be
 * overridden by the GM.
 * @param {Actor} actor
 * @param {object} action
 * @param {{as?: string, count?: number}} [options]  count: reactions spent at once (Multiple Attacks)
 * @returns {Promise<boolean>}
 */
export async function takeAction(actor, action, { as, count = 1 } = {}) {
  const combatant = combatantOf(actor);
  if (!combatant) return true;
  // Any other action breaks a reload under way (spec 019, p. 424); Reload keeps its own weapon's progress.
  if (action.type !== "free" && action.type !== "reaction" && action.key !== "reload" && as !== "free") await resetReloadProgress(actor);
  // Any action or reaction ends Overwatch; free actions do not (spec 017, p. 429).
  if (action.type !== "free" && action.key !== "overwatch") await endOverwatch(actor);
  // A Half Action held by Delay is used outside the turn without touching the turn state (p. 426).
  const delay = combatant.getFlag("dtd40k", "delay");
  if (usesDelay({ delay, ownTurn: game.combat.combatant?.id === combatant.id, action, as })) {
    if (combatant.isOwner) await combatant.unsetFlag("dtd40k", "delay");
    ui.notifications.info(game.i18n.format("DTD.Delay.Used", { name: actor.name, action: action.name }));
    return true;
  }
  let state = combatant.turnState;
  const reactionsMax = actor.system.combat.reactionsMax;
  for (let i = 0; i < count; i++) {
    const check = canUse(state, action, { reactionsMax, as });
    if (!check.ok) {
      const message = game.i18n.format(`DTD.Combat.Refused.${check.reason}`, { action: action.name });
      ui.notifications.warn(message);
      if (!game.user.isGM) return false;
      const allow = await foundry.applications.api.DialogV2.confirm({
        window: { title: action.name }, content: `<p>${message}</p><p>${localize("DTD.Combat.GMOverride")}</p>`, rejectClose: false
      });
      if (!allow) return false;
    }
    state = spend(state, action, { as });
  }
  if (combatant.isOwner) await combatant.setTurnState(state);
  return true;
}

/**
 * Weapon used for an action: the chosen one, else the first equipped weapon, else unarmed.
 * @param {Actor} actor
 * @param {string} [itemId]
 */
function weaponFor(actor, itemId) {
  if (itemId) return itemId;
  return actor.items.find((item) => item.type === "weapon" && item.system.equipped)?.id ?? "unarmed";
}

/**
 * Use a combat action from the sheet (FR-006).
 * @param {Actor} actor
 * @param {string} key
 * @param {{weaponId?: string, as?: "half"|"full", special?: object}} [options]
 *   special: a Special Attack or Trick Shot made with this action (spec 010)
 */
export async function useAction(actor, key, { weaponId, as, special = null } = {}) {
  const action = COMBAT_ACTIONS.find((a) => a.key === key);
  if (!action || !actor.isOwner) return;
  const flags = combatFlags(actor.statuses);
  if (flags.cannotAct && action.key !== "spendHeroPoint") {
    ui.notifications.warn(game.i18n.format("DTD.Combat.CannotAct", { name: actor.name }));
    return;
  }
  // Pinned: no Full Actions; grappled or grappling: only the grapple (spec 017). The GM may allow it.
  const limit = restriction({ statuses: actor.statuses, action, as });
  if (!limit.allowed) {
    const message = game.i18n.format(`DTD.Maneuver.Refused.${limit.reason}`, { name: actor.name, action: action.name });
    ui.notifications.warn(message);
    if (!game.user.isGM || !(await foundry.applications.api.DialogV2.confirm({
      window: { title: action.name }, content: `<p>${message}</p><p>${localize("DTD.Combat.GMOverride")}</p>`, rejectClose: false
    }))) return;
  }
  const auto = action.automation;
  // A Hero Point ends Stunned (p. 444).
  if (action.key === "spendHeroPoint" && actor.statuses.has("stunned") && actor.system.heroPoints.value > 0) {
    const end = await foundry.applications.api.DialogV2.confirm({
      window: { title: action.name }, content: `<p>${localize("DTD.Combat.EndStunned")}</p>`, rejectClose: false
    });
    if (end) {
      await actor.update({ "system.heroPoints.value": actor.system.heroPoints.value - 1 });
      await toggleCondition(actor, "stunned", { active: false });
      return;
    }
  }
  if (auto.reaction) return rollReaction(actor, auto.reaction);
  if (auto.multiple) return multipleAttacks(actor, action, special);
  // Reload with the weapon's time, one action at a time (spec 019).
  if (key === "reload") {
    const item = ammoWeapon(actor, weaponId === "unarmed" ? "" : weaponId);
    const info = reloadCheck(item);
    if (!info) return;
    await resetReloadProgress(actor, { except: item.id });
    if (!(await takeAction(actor, action, { as: info.type }))) return;
    return reloadWeapon(actor, item);
  }
  // Kill zones, opposed tests, the grapple and Delay (spec 017).
  if (auto.zone) return zoneAction(actor, action, weaponFor(actor, weaponId));
  const target = auto.opposed ? [...game.user.targets][0]?.actor ?? null : null;
  if (target) {
    if (await takeAction(actor, action)) await useManeuver(actor, auto.opposed, target);
    return;
  }
  if (auto.grapple && auto.grapple !== "enter") {
    if (!(await takeAction(actor, action))) return;
    if (auto.grapple === "control") await controlGrapple(actor);
    else await escapeGrapple(actor, auto.grapple);
    return;
  }
  // Auto-Stabilized (spec 022, p. 520): a Full Auto Burst is a half action.
  const stabilized = actor.system.traitFlags?.autoStabilized && key === "fullAutoBurst";
  if (!(await takeAction(actor, action, { as: as ?? (stabilized || auto.attack?.aim ? "half" : undefined) }))) return;
  // Phasing (spec 022): the action switches Incorporeal on and off.
  if (auto.toggles) await toggleCondition(actor, auto.toggles, { active: !actor.statuses.has(auto.toggles) });

  if (auto.effect) await toggleCondition(actor, auto.effect, { active: true });
  if (auto.adds) await toggleCondition(actor, auto.adds, { active: true });
  if (auto.removes) await toggleCondition(actor, auto.removes, { active: false });
  if (auto.attack && !auto.attack.aim) {
    // The Grapple is a Brawl attack, whatever weapon is in hand (p. 427).
    const message = await rollAttack(actor, auto.attack.unarmed ? "unarmed" : weaponFor(actor, weaponId), { action: auto.attack, special });
    if (message && auto.grapple === "enter" && message.getFlag("dtd40k", "attack")?.hits !== 0) {
      await message.update({ content: `${message.content}<div class="card-buttons"><button type="button" data-dtd-action="startGrapple"><i class="fa-solid fa-hands" inert></i> ${localize("DTD.Grapple.Start")}</button></div>` });
    }
  }
  if (auto.delay) {
    const combatant = combatantOf(actor);
    if (combatant?.isOwner) await combatant.setFlag("dtd40k", "delay", { round: game.combat.round });
  }
  if (auto.roll) {
    // Clear Jam (p. 435): Tech-Use or Ballistics, whichever is better; Tech-Use is advanced and needs training (spec 019).
    const techUse = actor.system.skills.techUse?.value ?? 0;
    const skill = key === "clearJam" ? (techUse > 0 && techUse >= (actor.system.skills.ballistics?.value ?? 0) ? "techUse" : "ballistics") : auto.roll.skill;
    const message = skill
      ? await actor.rollSkill(skill, { tn: auto.roll.tn ?? 15 })
      : await actor.rollCharacteristic(auto.roll.characteristic, { tn: auto.roll.tn ?? 15 });
    const outcome = message?.getFlag("dtd40k", "test")?.outcome;
    if (auto.removesOnSuccess && outcome?.success) await toggleCondition(actor, auto.removesOnSuccess, { active: false });
    // Clear Jam (p. 435): the weapon works again, with an empty clip (spec 019).
    if (key === "clearJam" && outcome?.success) {
      const item = ammoWeapon(actor, weaponId === "unarmed" ? "" : weaponId, { jammed: true });
      if (item?.system.ammo?.jammed) await clearJam(item);
    }
  }
  if (!auto.attack && !auto.roll) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><b>${action.name}</b></p><p>${action.summary}</p>${auto.tactical && actor.statuses.has("inCover") ? `<p>${localize("DTD.Maneuver.KeepsCover")}</p>` : ""}`
    });
  }
}

/**
 * Suppressing Fire and Overwatch (spec 017, FR-001, FR-011): full-auto weapon; Overwatch asks what it fires and on
 * what trigger; then the action is spent and the cone placed.
 * @param {Actor} actor
 * @param {object} action
 * @param {string} weaponId
 */
async function zoneAction(actor, action, weaponId) {
  const shot = await checkZoneWeapon(actor, weaponId);
  if (!shot) return;
  let overwatch = {};
  if (action.automation.zone === "overwatch") {
    overwatch = await foundry.applications.api.DialogV2.wait({
      window: { title: action.name }, rejectClose: false,
      content: `<div class="form-group"><label>${localize("DTD.Zone.AttackLabel")}</label><select name="attack"><option value="burst">${localize("DTD.Zone.Attack.burst")}</option><option value="suppressing">${localize("DTD.Zone.Attack.suppressing")}</option></select></div><div class="form-group"><label>${localize("DTD.Zone.Trigger")}</label><input type="text" name="trigger"></div>`,
      buttons: [{ action: "ok", label: "DTD.Zone.Place", default: true, callback: (event, button) => ({ attack: button.form.elements.attack.value, trigger: button.form.elements.trigger.value }) }]
    });
    if (!overwatch) return;
  }
  // Auto-Stabilized (spec 022): Suppressing Fire is a half action.
  if (!(await takeAction(actor, action, { as: actor.system.traitFlags?.autoStabilized ? "half" : undefined }))) return;
  await placeZone(actor, shot, action.automation.zone, overwatch);
}

/**
 * Multiple Attacks (p. 428): two weapons (one attack each, −3k0 less the feats) or a feat (Swift Attack 2, Lightning
 * Attack 3 melee; Double Tap 2 shots); each attack after the first costs a reaction.
 * @param {Actor} actor
 * @param {object} action
 * @param {object|null} [special]  a Special Attack: its Advantages go to the first attack only (p. 263)
 */
async function multipleAttacks(actor, action, special = null) {
  const has = (name) => actor.items.some((item) => item.type === "feat" && item.name === name);
  const weapons = actor.items.filter((item) => item.type === "weapon" && item.system.equipped);
  let attacks = [];
  let penalty = 0;
  if (weapons.length >= 2) {
    attacks = weapons.slice(0, 2).map((w) => w.id);
    penalty = multipleAttackPenalty({ twoWeapons: true, ambidextrous: has("Ambidextrous"), twoWeaponFighting: has("Two Weapon Fighting") });
  } else if (weapons.length === 1) {
    const melee = weapons[0].system.weaponType === "melee";
    const n = melee ? (has("Lightning Attack") ? 3 : has("Swift Attack") ? 2 : 1) : has("Double Tap") ? 2 : 1;
    attacks = Array(n).fill(weapons[0].id);
  }
  if (attacks.length < 2) {
    ui.notifications.warn(localize("DTD.Combat.NoMultiple"));
    return;
  }
  const combatant = combatantOf(actor);
  if (combatant) {
    const reactionAction = { key: "multipleAttacks:reaction", type: "reaction" };
    if (!(await takeAction(actor, action))) return;
    if (!(await takeAction(actor, reactionAction, { count: attacks.length - 1 }))) return;
  }
  const first = await rollAttack(actor, attacks[0], { penalty, special });
  const preset = first?.getFlag("dtd40k", "attack")?.preset;
  if (!preset) return;
  for (const id of attacks.slice(1)) await rollAttack(actor, id, { preset, penalty });
}

/**
 * A Dodge or Parry from the sheet, without an attack card: posts the roll and the Static Defense it gives.
 * @param {Actor} actor
 * @param {"dodge"|"parry"} kind
 */
async function rollReaction(actor, kind) {
  const action = COMBAT_ACTIONS.find((a) => a.key === kind);
  if (!(await takeAction(actor, action))) return null;
  return defenseRoll(actor, kind);
}

/**
 * Roll a Dodge (Dexterity + Acrobatics) or a Parry (skill k skill + Level if proficient).
 * @param {Actor} actor
 * @param {"dodge"|"parry"} kind
 * @returns {Promise<ChatMessage|null>}
 */
async function defenseRoll(actor, kind) {
  if (kind === "dodge") {
    if (combatFlags(actor.statuses).noDodge) {
      ui.notifications.warn(localize("DTD.Combat.NoDodge"));
      return null;
    }
    return actor.rollSkill("acrobatics", {
      characteristic: "dex", fastForward: true, tn: null,
      modifiers: dodgeModifiers({ prone: actor.statuses.has("prone") }), label: localize("DTD.Combat.Dodge")
    });
  }
  const weapon = actor.items.find((item) => item.type === "weapon" && item.system.equipped && item.system.weaponType === "melee"
    && !item.system.qualities.some((q) => q.key === "unwieldy"));
  const brawl = !weapon || weapon.system.qualities.some((q) => q.key === "brawling");
  const skill = brawl ? "brawl" : "weaponry";
  const choices = actor.items.filter((item) => item.type === "feat" && item.name.startsWith("Weapon Proficiency")).map((item) => item.system.selection?.subcategory);
  const proficient = weapon ? isProficient(weapon.system, choices) : false;
  const bonus = weapon?.system.qualities.some((q) => q.key === "defensive") ? [1, 1] : weapon?.system.qualities.some((q) => q.key === "balanced") ? [2, 0] : weapon?.system.qualities.some((q) => q.key === "unbalanced") ? [-1, 0] : [0, 0];
  const pool = parryPool({ skill: actor.system.skills[skill].value, level: actor.system.level, proficient });
  const testResult = runTest({ base: { rolled: pool.rolled + bonus[0], kept: pool.kept + bonus[1] }, tn: null, rng, ...actor.withRollModifiers({}, skill) });
  return postTest({ actor, label: `${localize("DTD.Combat.Parry")}${weapon ? ` — ${weapon.name}` : ""}`, testResult });
}

/**
 * Dodge or Parry against an attack card (FR-008): half the total is added to the target's Static Defense; the
 * card says whether the attack still hits.
 * @param {ChatMessage} message
 * @param {"dodge"|"parry"} kind
 */
export async function rollDefense(message, kind) {
  const attack = message.getFlag("dtd40k", "attack");
  const target = attack?.targetUuid ? await foundry.utils.fromUuid(attack.targetUuid) : null;
  if (!target?.isOwner) {
    ui.notifications.warn(localize("DTD.Combat.NotYourTarget"));
    return;
  }
  const action = COMBAT_ACTIONS.find((a) => a.key === kind);
  if (!(await takeAction(target, action))) return;
  const roll = await defenseRoll(target, kind);
  const total = roll?.getFlag("dtd40k", "test")?.total;
  if (total === undefined) return;
  const sd = defendedSd(attack.tn ?? target.system.derived.staticDefense, total);
  const hits = stillHits({ attackTotal: attack.total, sd, requiredRaises: attack.requiredRaises });
  const content = await foundry.applications.handlebars.renderTemplate(DEFENSE_TEMPLATE, {
    name: target.name, kind: localize(`DTD.Combat.${kind === "dodge" ? "Dodge" : "Parry"}`), total, bonus: Math.floor(total / 2), sd, hits
  });
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content });
  if (game.user.isGM || message.isOwner) await message.setFlag("dtd40k", "defense", { kind, total, sd, hits });
}

/**
 * Spend a Hero Point so the initiative die counts as 10 (p. 420).
 * @param {Actor} actor
 */
export async function heroInitiative(actor) {
  const combatant = combatantOf(actor) ?? game.combat?.combatants.find((c) => c.actor === actor);
  if (!combatant || !Number.isFinite(combatant.initiative) || actor.system.heroPoints.value < 1) {
    ui.notifications.warn(localize("DTD.Combat.NoHeroInitiative"));
    return;
  }
  const c = actor.system.characteristics;
  await actor.update({ "system.heroPoints.value": actor.system.heroPoints.value - 1 });
  await combatant.update({ initiative: 10 + c.dex.value + c.cmp.value + (actor.system.modifiers.initiative ?? 0) });
}

/**
 * Start of a combatant turn (FR-009, FR-011), run by the active GM (DtdCombat#_onStartTurn): the effects of its
 * last actions and expired conditions end; Surprised and Stunned characters are announced.
 * @param {Combat} combat
 * @param {Combatant} combatant
 */
export async function startOfTurn(combat, combatant) {
  const actor = combatant?.actor;
  if (!actor) return;
  const expired = actor.effects.filter((effect) => {
    const flags = effect.flags?.dtd40k ?? {};
    return flags.untilTurnOf === combatant.id || (flags.expiresRound && combat.round >= flags.expiresRound);
  }).map((effect) => effect.id);
  if (expired.length) await actor.deleteEmbeddedDocuments("ActiveEffect", expired);
  // Kill zones: the burst of his Suppressing Fire; his Overwatch and an unused Delay end (spec 017).
  await zonesAtTurnStart(combat, combatant);
  if (combatant.getFlag("dtd40k", "delay")) await combatant.unsetFlag("dtd40k", "delay");
  // A grapple ends when either side can no longer act.
  const partner = actor.getFlag("dtd40k", "grapple")?.partner;
  if (partner && (combatFlags(actor.statuses).cannotAct || combatFlags((await foundry.utils.fromUuid(partner))?.statuses ?? new Set()).cannotAct)) {
    await endGrapple(actor);
  }
  // Effects this combatant put on others "until your next turn" (Special Attacks, spec 010) end too.
  for (const other of new Set(combat.combatants.map((c) => c.actor).filter((a) => a && a !== actor))) {
    const ids = other.effects.filter((effect) => effect.flags?.dtd40k?.untilTurnOf === combatant.id).map((effect) => effect.id);
    if (ids.length) await other.deleteEmbeddedDocuments("ActiveEffect", ids);
  }
  if (actor.statuses.has("surprised") && combat.round === 1) {
    await ChatMessage.create({ content: `<p>${game.i18n.format("DTD.Combat.SurprisedSkip", { name: actor.name })}</p>` });
  } else if (combatFlags(actor.statuses).cannotAct) {
    await ChatMessage.create({ content: `<p>${game.i18n.format("DTD.Combat.CannotAct", { name: actor.name })}</p>` });
  }
}

/**
 * Start of a round (FR-011): Surprised ends after round 1.
 * @param {Combat} combat
 */
export async function startOfRound(combat) {
  if (combat.round < 2) return;
  for (const c of combat.combatants) if (c.actor?.statuses.has("surprised")) await toggleCondition(c.actor, "surprised", { active: false });
}

/**
 * End-of-turn effects (pp. 442–443): On Fire −1 HP and +1 Fatigue; Blood Loss 1d10, a 1 kills.
 * @param {Actor} actor
 */
export async function endOfTurn(actor) {
  if (!actor) return;
  if (actor.type !== "character" && actor.type !== "npc") return;
  const notes = [];
  if (actor.statuses.has("onFire")) {
    await actor.update({ "system.hp.value": Math.max(0, actor.system.hp.value - 1) });
    await addFatigue(actor, 1);
    notes.push(localize("DTD.Combat.BurnTick"));
  }
  if (actor.statuses.has("bloodLoss")) {
    const roll = await new Roll("1d10").evaluate();
    notes.push(game.i18n.format("DTD.Combat.BloodLossRoll", { roll: roll.total }));
    if (roll.total === 1) await toggleCondition(actor, "dead", { active: true });
  }
  // Pinning (pp. 443–444): the escape test at the end of each of his turns (spec 017).
  if (actor.statuses.has("pinned")) await postPinningEscape(actor);
  if (notes.length) await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${notes.join("</p><p>")}</p>` });
}
