import { MARTIAL_SCHOOLS } from "../config.mjs";
import { promptBuilder } from "../apps/martial-builder.mjs";
import { COMBAT_ACTIONS } from "../rules/combat-actions.mjs";
import { attackCost, attackModifiers, attackTotals, budget, resolveRef, usageCheck } from "../rules/martial.mjs";
import { addFatigue, toggleCondition } from "./condition-service.mjs";
import { requestGm } from "./damage-service.mjs";
import { combatantOf, takeAction, useAction } from "./turn-service.mjs";
import { recordEntry } from "./xp-service.mjs";

/**
 * Sword Schools and Gun Kata on the character: school data, passive Masteries, Special Attacks and Trick Shots
 * (spec 010, US2–US4; research R2–R6). Contract: specs/010-sword-schools/contracts/foundry-api.md ("martial-service").
 */

const PACK = "dtd40k.martial-schools";
const localize = (key) => game.i18n.localize(key);
let cache = null;

/**
 * Yes/no confirmation dialog.
 * @param {string} title
 * @param {string} content
 */
async function confirm(title, content) {
  return Boolean(await foundry.applications.api.DialogV2.confirm({ window: { title }, content, rejectClose: false }));
}

/**
 * The 15 schools of the compendium, by key (cached for the session; the sheet context is async).
 * @returns {Promise<Record<string, {name: string, img: string, system: object}>>}
 */
export async function schoolData() {
  if (cache) return cache;
  const pack = game.packs.get(PACK);
  if (!pack) return {};
  const docs = await pack.getDocuments();
  cache = Object.fromEntries(docs.map((doc) => [doc.system.key, { name: doc.name, img: doc.img, system: doc.system.toObject() }]));
  return cache;
}

/** Forget the cached schools (the pack changed). */
export function clearSchoolCache() {
  cache = null;
}

/** School ranks of a character. */
export const ranksOf = (actor) => Object.fromEntries(Object.entries(actor.system.martial.schools).map(([key, s]) => [key, s.value]));

/** Level that limits an attack: Martial Adept (Special Attack) or Gunslinger (Trick Shot). */
export const levelFor = (actor, kind) => (kind === "trick" ? actor.system.martial.levels.gunslingerLevel : actor.system.martial.levels.adeptLevel);

/**
 * Keep the passive Masteries in step with the ranks (FR-006): an Active Effect per automated passive the character
 * has reached, marked `flags.dtd40k.martialPassive`; the GM may disable it; lost ranks remove it.
 * @param {Actor} actor
 */
export async function syncPassives(actor) {
  if (actor.type !== "character") return;
  const schools = await schoolData();
  const wanted = new Map();
  for (const [key, school] of Object.entries(schools)) {
    const rank = actor.system.martial.schools[key]?.value ?? 0;
    for (const entry of school.system.entries) {
      if (entry.type !== "mastery" || entry.rank > rank || !entry.automation?.changes?.length) continue;
      wanted.set(`${key}:${entry.id}`, {
        name: entry.name, img: school.img, description: entry.effect,
        changes: entry.automation.changes.map((c) => ({ key: c.key, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(c.value) })),
        flags: { dtd40k: { martialPassive: `${key}:${entry.id}` } }
      });
    }
  }
  const current = actor.effects.filter((effect) => effect.getFlag("dtd40k", "martialPassive"));
  const stale = current.filter((effect) => !wanted.has(effect.getFlag("dtd40k", "martialPassive"))).map((effect) => effect.id);
  if (stale.length) await actor.deleteEmbeddedDocuments("ActiveEffect", stale);
  const have = new Set(current.map((effect) => effect.getFlag("dtd40k", "martialPassive")));
  const missing = [...wanted].filter(([flag]) => !have.has(flag)).map(([, data]) => data);
  if (missing.length) await actor.createEmbeddedDocuments("ActiveEffect", missing);
}

/**
 * Open the builder for a new attack or an existing one and save it (FR-007 to FR-009).
 * @param {Actor} actor
 * @param {{kind?: "special"|"trick", id?: string}} options
 */
export async function buildAttack(actor, { kind = "special", id = "" } = {}) {
  if (!actor.isOwner) return null;
  const existing = id ? actor.system.martial.attacks.find((a) => a.id === id) : null;
  const schools = await schoolData();
  const definition = await promptBuilder({ actor, schools, ranks: ranksOf(actor), kind: existing?.kind ?? kind, attack: existing });
  if (!definition) return null;
  return saveAttack(actor, definition, { id });
}

/**
 * Save an attack definition: the budget of the book, 50 XP per style point added, the XP log (FR-008, FR-009).
 * Edits keep the previous definition, so undoing the purchase restores it.
 * @param {Actor} actor
 * @param {{name: string, kind: string, action: string, advantages: object[], restrictions: object[]}} definition
 * @param {{id?: string}} [options]
 * @returns {Promise<boolean>}
 */
export async function saveAttack(actor, definition, { id = "" } = {}) {
  const schools = await schoolData();
  const totals = attackTotals(definition, schools);
  const level = levelFor(actor, definition.kind);
  const check = budget({ advantages: totals.advantages, restrictions: totals.restrictions, level });
  if (!check.ok) {
    ui.notifications.warn(game.i18n.format(`DTD.Martial.Budget.${check.reason}`, { level, missing: check.missing }));
    return false;
  }
  const attacks = foundry.utils.deepClone(actor._source.system.martial.attacks);
  const index = id ? attacks.findIndex((a) => a.id === id) : -1;
  const previous = index >= 0 ? attacks[index] : null;
  const paid = previous?.paid ?? 0;
  const cost = attackCost({ points: totals.advantages, paid });
  const available = actor.system.xp.totals.available;
  if (cost > available) {
    ui.notifications.warn(game.i18n.format("DTD.XP.Error.notEnough", { cost, available }));
    return false;
  }
  const label = definition.name;
  if (!(await confirm(localize("DTD.Martial.Save"), `<p>${game.i18n.format("DTD.XP.BuyConfirm", { label, cost, available })}</p>`))) return false;
  const attackId = previous?.id ?? foundry.utils.randomID();
  const snapshot = previous ? {
    name: previous.name, kind: previous.kind, action: previous.action, advantages: previous.advantages,
    restrictions: previous.restrictions, paid: previous.paid
  } : null;
  const record = {
    id: attackId, name: definition.name, kind: definition.kind, action: definition.action,
    advantages: definition.advantages, restrictions: definition.restrictions,
    paid: Math.max(paid, totals.advantages),
    history: previous ? [...previous.history, snapshot] : [],
    state: previous?.state ?? { lastRound: 0, lastCombat: "", usedScene: false, readyUntil: 0 }
  };
  if (index >= 0) attacks[index] = record;
  else attacks.push(record);
  await actor.update({ "system.martial.attacks": attacks });
  await recordEntry(actor, { kind: "specialAttack", key: attackId, label, from: paid, to: record.paid, cost });
  return true;
}

/**
 * Undo of an attack purchase (spec 010): the previous definition comes back, or the attack leaves with its first
 * purchase. Called by the XP log.
 * @param {Actor} actor
 * @param {string} id
 */
export async function restoreAttack(actor, id) {
  const attacks = foundry.utils.deepClone(actor._source.system.martial.attacks);
  const index = attacks.findIndex((a) => a.id === id);
  if (index < 0) return;
  const attack = attacks[index];
  if (!attack.history.length) attacks.splice(index, 1);
  else attacks[index] = { ...attack.history.at(-1), id, history: attack.history.slice(0, -1), state: attack.state };
  await actor.update({ "system.martial.attacks": attacks });
}

/**
 * Delete an attack after confirmation; the XP stays spent (undo it in the XP log to get it back).
 * @param {Actor} actor
 * @param {string} id
 */
export async function deleteAttack(actor, id) {
  const attack = actor.system.martial.attacks.find((a) => a.id === id);
  if (!attack || !actor.isOwner) return;
  if (!(await confirm(localize("DTD.Martial.Delete"), `<p>${game.i18n.format("DTD.Martial.DeleteConfirm", { name: attack.name })}</p>`))) return;
  await actor.update({ "system.martial.attacks": actor._source.system.martial.attacks.filter((a) => a.id !== id) });
}

/** The chosen Advantages and Restrictions of an attack, resolved against the schools. */
function entriesOf(attack, schools) {
  return [...attack.advantages, ...attack.restrictions]
    .map((chosen) => ({ option: resolveRef(chosen.ref, schools), count: chosen.count, choice: chosen.choice ?? 0 }))
    .filter((e) => e.option);
}

/** Weapon profile for the usage checks. */
function weaponProfile(item) {
  if (!item) return { group: "Unarmed", weaponType: "melee", unarmed: true, qualities: [] };
  return { group: item.system.group, weaponType: item.system.weaponType, unarmed: item.system.group === "Unarmed", qualities: item.system.qualities };
}

/**
 * Update the use state of an attack (last round, scene, prepared).
 * @param {Actor} actor
 * @param {string} id
 * @param {object} changes
 */
async function setState(actor, id, changes) {
  const attacks = foundry.utils.deepClone(actor._source.system.martial.attacks);
  const attack = attacks.find((a) => a.id === id);
  if (!attack) return;
  Object.assign(attack.state, changes);
  await actor.update({ "system.martial.attacks": attacks });
}

/**
 * Use a Special Attack or Trick Shot (FR-010 to FR-013): usage checks (GM override), the base action through the
 * turn of spec 008, the skill Restriction, the attack with the modifiers and the effects on the attacker.
 * Preparing actions (Aim, Feint, Ready, Aid Another, Suppressing Fire) spend the action and ready the attack; the
 * prepared attack is then a Standard Attack with the Advantages.
 * @param {Actor} actor
 * @param {string} id
 * @param {{weaponId?: string, prepared?: boolean}} [options]
 * @returns {Promise<boolean>}
 */
export async function useAttack(actor, id, { weaponId = "unarmed", prepared = false } = {}) {
  const attack = actor.system.martial.attacks.find((a) => a.id === id);
  if (!attack || !actor.isOwner) return false;
  const schools = await schoolData();
  const entries = entriesOf(attack, schools);
  const item = weaponId && weaponId !== "unarmed" ? actor.items.get(weaponId) : null;
  const weapon = weaponProfile(item);
  const target = [...game.user.targets][0]?.actor ?? null;
  const combat = game.combat?.started ? game.combat : null;
  const inCombat = Boolean(combat && combatantOf(actor));

  const check = usageCheck(attack, {
    entries, weapon, kind: attack.kind, inCombat, round: combat?.round ?? 0, combatId: combat?.id ?? "",
    targetStatuses: target?.statuses ?? [], hp: { value: actor.system.hp.value, max: actor.system.hp.max }
  });
  if (check.blocked.length) {
    const reasons = check.blocked.map((b) => game.i18n.format(`DTD.Martial.Blocked.${b.reason}`, { name: b.name })).join(" ");
    const message = game.i18n.format("DTD.Martial.CannotUse", { name: attack.name, reasons });
    ui.notifications.warn(message);
    if (!game.user.isGM || !(await confirm(attack.name, `<p>${message}</p><p>${localize("DTD.Combat.GMOverride")}</p>`))) return false;
  }
  for (const name of check.reminders) ui.notifications.info(game.i18n.format("DTD.Martial.Reminder", { name }));

  const base = COMBAT_ACTIONS.find((a) => a.key === (prepared ? "standardAttack" : attack.action)) ?? COMBAT_ACTIONS.find((a) => a.key === "standardAttack");
  const prepares = !prepared && ["aidAnother", "feint", "aim", "ready", "suppressingFire"].includes(base.key);
  if (prepares) {
    await useAction(actor, base.key, { weaponId });
    await setState(actor, id, { readyUntil: inCombat ? combat.round + 1 : 1 });
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${game.i18n.format("DTD.Martial.Prepared", { name: attack.name, action: base.name })}</p>` });
    return true;
  }

  const modifiers = attackModifiers(entries);
  // Skill Restriction (p. 262): a Test against the target's Static Defense; failing it, the attack fails.
  if (modifiers.test) {
    const tn = target?.system?.derived?.staticDefense ?? 15;
    const roll = await actor.rollSkill(modifiers.test, { fastForward: true, tn, label: game.i18n.format("DTD.Martial.SkillTest", { name: attack.name }) });
    const outcome = roll?.getFlag("dtd40k", "test")?.outcome;
    if (outcome && !outcome.success) {
      await takeAction(actor, base);
      await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${game.i18n.format("DTD.Martial.SkillFailed", { name: attack.name })}</p>` });
      await afterUse(actor, attack, modifiers, { inCombat, combat, prepared });
      return true;
    }
  }
  const special = {
    attackId: id, name: attack.name, kind: attack.kind, modifiers,
    rolledBonus: modifiers.rolledCharacteristic ? actor.system.characteristics[modifiers.rolledCharacteristic]?.value ?? 0 : 0
  };
  await useAction(actor, base.key, { weaponId, special });
  await afterUse(actor, attack, modifiers, { inCombat, combat, prepared });
  return true;
}

/**
 * After an attack: effects on the attacker (Opening the Path, Stone Skin, Weight of the Mountain) and the use state.
 * @param {Actor} actor
 * @param {object} attack
 * @param {object} modifiers
 * @param {{inCombat: boolean, combat: Combat|null, prepared: boolean}} context
 */
async function afterUse(actor, attack, modifiers, { inCombat, combat, prepared }) {
  const combatantId = combatantOf(actor)?.id ?? "";
  for (const self of modifiers.self) {
    if (self.fatigue) await addFatigue(actor, self.fatigue);
    if (self.changes?.length) {
      await actor.createEmbeddedDocuments("ActiveEffect", [{
        name: attack.name, img: "icons/svg/sword.svg",
        changes: self.changes.map((c) => ({ key: c.key, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(c.value) })),
        flags: { dtd40k: self.untilNextTurn && combatantId ? { untilTurnOf: combatantId } : {} }
      }]);
    }
  }
  const perScene = attack.restrictions.some((r) => r.ref === "universal:lastResort");
  await setState(actor, attack.id, {
    ...(inCombat ? { lastRound: combat.round, lastCombat: combat.id } : {}),
    ...(perScene ? { usedScene: true } : {}),
    ...(prepared ? { readyUntil: 0 } : {})
  });
}

/**
 * Effects of a hit on the target (FR-012), from the button of the attack card: conditions (Dazed per raise, Prone,
 * Blood Loss), Fatigue, HP loss and penalties until the attacker's next turn. Players ask the GM for targets they
 * do not own.
 * @param {ChatMessage} message
 */
export async function applyAttackEffects(message) {
  const attack = message.getFlag("dtd40k", "attack");
  const special = attack?.special;
  if (!special?.modifiers.onHit.length) return;
  const target = attack.targetUuid ? await foundry.utils.fromUuid(attack.targetUuid) : null;
  if (!target) {
    ui.notifications.warn(localize("DTD.Combat.NoTarget"));
    return;
  }
  if (!target.isOwner) {
    if (!game.user.isGM) requestGm("martialEffects", { messageId: message.id });
    return;
  }
  const attacker = await foundry.utils.fromUuid(attack.actorUuid);
  const untilTurnOf = attacker ? combatantOf(attacker)?.id ?? "" : "";
  const notes = [];
  for (const hit of special.modifiers.onHit) {
    if (hit.condition) {
      const rounds = hit.rounds === "perRaise" ? attack.raises : hit.rounds ?? null;
      if (hit.rounds === "perRaise" && !rounds) continue;
      await toggleCondition(target, hit.condition, { active: true, rounds });
      notes.push(game.i18n.localize(CONFIG.statusEffects.find((s) => s.id === hit.condition)?.name ?? hit.condition) + (rounds ? ` (${rounds})` : ""));
    }
    if (hit.fatigue) {
      await addFatigue(target, hit.fatigue);
      notes.push(game.i18n.format("DTD.Martial.FatigueNote", { n: hit.fatigue }));
    }
    if (hit.hpLoss) {
      await target.update({ "system.hp.value": Math.max(0, target.system.hp.value - hit.hpLoss) });
      notes.push(game.i18n.format("DTD.Martial.HpNote", { n: hit.hpLoss }));
    }
    if (hit.changes?.length) {
      await target.createEmbeddedDocuments("ActiveEffect", [{
        name: special.name, img: "icons/svg/sword.svg",
        changes: hit.changes.map((c) => ({ key: c.key, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(c.value) })),
        flags: { dtd40k: hit.untilNextTurn && untilTurnOf ? { untilTurnOf } : {} }
      }]);
      notes.push(special.name);
    }
  }
  await message.setFlag("dtd40k", "attack", { ...attack, effectsApplied: true });
  if (notes.length) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: target }),
      content: `<p>${game.i18n.format("DTD.Martial.EffectsApplied", { name: target.name, effects: notes.join(", ") })}</p>`
    });
  }
}

/**
 * Last Resort is available again (a new scene; GM). Also run when a combat ends.
 * @param {Actor} actor
 */
export async function newScene(actor) {
  const attacks = foundry.utils.deepClone(actor._source.system.martial.attacks);
  if (!attacks.some((a) => a.state.usedScene)) return;
  for (const attack of attacks) attack.state.usedScene = false;
  await actor.update({ "system.martial.attacks": attacks });
}

/**
 * Label of a school for messages and the XP log.
 * @param {string} key
 */
export const schoolLabel = (key) => game.i18n.localize(MARTIAL_SCHOOLS[key]?.label ?? key);
