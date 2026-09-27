/**
 * Sword Schools and Gun Kata: Martial Adept and Gunslinger Level, the universal Advantages and Restrictions, what a
 * character may put in a Special Attack or Trick Shot, the style point budget and XP, the checks before using one and
 * the modifiers it gives (spec 010, research R2–R5).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 260–262 (Sword Schools), pp. 272–273 (Gun Kata); specs/010-sword-schools/contracts/rules-api.md.
 */
import { MARTIAL_SCHOOLS, MARTIAL_XP } from "../config.mjs";

const entry = (slug, name, cost, perPoint, effect, automation) => ({ slug, name, cost, perPoint, effect, automation });

/** Universal Advantages, shared by Special Attacks and Trick Shots (p. 262, p. 273). */
export const UNIVERSAL_ADVANTAGES = [
  entry("firstDamage", "First Damage Improvement", 1, true, "Each purchase adds one rolled die to damage.", { damage: { rolled: 1 } }),
  entry("secondDamage", "Second Damage Mastery", 3, true, "Each purchase adds one kept die to damage.", { damage: { kept: 1 } }),
  entry("firstAccuracy", "First Accuracy Improvement", 1, true, "Each purchase adds one rolled die to the attack roll.", { attack: { rolled: 1 } }),
  entry("secondAccuracy", "Second Accuracy Mastery", 2, true, "Each purchase adds one kept die to the attack roll.", { attack: { kept: 1 } }),
  entry("penetration", "Penetration Mastery", 1, true, "Each style point spent raises the attack's Penetration by 2.", { pen: 2 })
];

/** Universal Restrictions (p. 262, p. 273). */
export const UNIVERSAL_RESTRICTIONS = [
  entry("difficultStrike", "Difficult Strike", -1, false, "Cannot be used if it was used in the previous round.", { cooldown: 1 }),
  entry("lastResort", "Last Resort", -2, false, "Usable only once per scene.", { perScene: true }),
  entry("restrainedForce", "Restrained Force", -1, true, "Each purchase removes one rolled die from damage.", { damage: { rolled: -1 } }),
  entry("unbrokenSkin", "Unbroken Skin", -2, true, "Each purchase removes one kept die from damage.", { damage: { kept: -1 } }),
  entry("inaccurate", "Inaccurate", -1, true, "Each purchase removes one rolled die from the attack roll.", { attack: { rolled: -1 } }),
  entry("overextended", "Overextended", -2, true, "Each purchase removes one kept die from the attack roll.", { attack: { kept: -1 } }),
  entry("nonPenetrating", "Non-Penetrating", -1, false, "The attack has Penetration 0.", { penZero: true })
];

/**
 * Martial Adept Level (highest Sword School, p. 260) and Gunslinger Level (highest Gun Kata, p. 272).
 * @param {Record<string, number>} ranks  school key → rank
 * @returns {{adeptLevel: number, gunslingerLevel: number}}
 */
export function adeptLevels(ranks) {
  let adeptLevel = 0;
  let gunslingerLevel = 0;
  for (const [key, value] of Object.entries(ranks)) {
    const kind = MARTIAL_SCHOOLS[key]?.kind;
    if (kind === "sword") adeptLevel = Math.max(adeptLevel, value);
    else if (kind === "gunKata") gunslingerLevel = Math.max(gunslingerLevel, value);
  }
  return { adeptLevel, gunslingerLevel };
}

/**
 * An option of the builder from a reference: "universal:<slug>" or "<school>:<entry id>".
 * @param {string} ref
 * @param {Record<string, {system: object}>} schools  school key → document (compendium data)
 * @returns {object|null}  { ref, name, cost, perPoint, variableCost, type, rank, school, effect, automation }
 */
export function resolveRef(ref, schools) {
  const [scope, id] = ref.split(":");
  if (scope === "universal") {
    const u = [...UNIVERSAL_ADVANTAGES, ...UNIVERSAL_RESTRICTIONS].find((e) => e.slug === id);
    return u ? {
      ref, name: u.name, cost: u.cost, perPoint: u.perPoint, variableCost: [], type: u.cost > 0 ? "advantage" : "restriction",
      rank: 0, school: "", effect: u.effect, automation: u.automation
    } : null;
  }
  const e = schools[scope]?.system.entries.find((entry) => entry.id === id);
  return e ? {
    ref, name: e.name, cost: e.cost, perPoint: e.perPoint, variableCost: e.variableCost ?? [], type: e.type, rank: e.rank,
    school: scope, effect: e.effect, automation: e.automation ?? {}
  } : null;
}

/**
 * What a character may put in a Special Attack (Sword Schools) or a Trick Shot (Gun Kata), p. 261 and p. 273:
 * Standard Attack and the actions of rank 1, the Advantages and Restrictions of the ranks known, the universal ones.
 * @param {{schools: Record<string, {system: object}>, ranks: Record<string, number>, kind: "special"|"trick"}} input
 * @returns {{actions: object[], advantages: object[], restrictions: object[]}}
 */
export function options({ schools, ranks, kind }) {
  const schoolKind = kind === "trick" ? "gunKata" : "sword";
  const actions = [{ key: "standardAttack", ref: "", name: "Standard Attack", prepares: false }];
  const advantages = UNIVERSAL_ADVANTAGES.map((u) => resolveRef(`universal:${u.slug}`, schools));
  const restrictions = UNIVERSAL_RESTRICTIONS.map((u) => resolveRef(`universal:${u.slug}`, schools));
  for (const [key, def] of Object.entries(MARTIAL_SCHOOLS)) {
    const rank = ranks[key] ?? 0;
    if (def.kind !== schoolKind || !rank || !schools[key]) continue;
    for (const entry of schools[key].system.entries) {
      if (entry.rank > rank) continue;
      const option = resolveRef(`${key}:${entry.id}`, schools);
      if (entry.type === "action") {
        actions.push({ key: entry.automation.unlocksAction, ref: option.ref, name: entry.name, prepares: Boolean(entry.automation.prepares) });
      } else if (entry.type === "advantage") advantages.push(option);
      else if (entry.type !== "mastery" && (entry.cost ?? 0) < 0) restrictions.push(option);
    }
  }
  return { actions, advantages, restrictions };
}

/**
 * Style points of an option: × purchases when repeatable ("*"); a variable cost by the choice (Revitalizing Strike
 * 1 or 3; Exit Wound Kata X). Restrictions count as positive points.
 * @param {{cost: number|null, perPoint: boolean, variableCost?: number[]}} option
 * @param {number} [count]
 * @param {number} [choice]
 */
export function points(option, count = 1, choice = 0) {
  const variable = option.variableCost ?? [];
  if (variable.length) {
    if (variable.includes(0)) return Math.max(0, choice);
    return variable.includes(choice) ? choice : variable[0];
  }
  return Math.abs(option.cost ?? 0) * (option.perPoint ? Math.max(1, count) : 1);
}

/**
 * Style point budget (p. 261, p. 273): Advantages up to the level; each point beyond needs a point of
 * Restrictions; never more than twice the level.
 * @param {{advantages: number, restrictions: number, level: number}} input
 * @returns {{ok: boolean, reason: ""|"noLevel"|"empty"|"overCap"|"needRestrictions", missing: number}}
 */
export function budget({ advantages, restrictions, level }) {
  if (level <= 0) return { ok: false, reason: "noLevel", missing: 0 };
  if (advantages <= 0) return { ok: false, reason: "empty", missing: 0 };
  if (advantages > 2 * level) return { ok: false, reason: "overCap", missing: advantages - 2 * level };
  const excess = Math.max(0, advantages - level);
  if (excess > restrictions) return { ok: false, reason: "needRestrictions", missing: excess - restrictions };
  return { ok: true, reason: "", missing: 0 };
}

/**
 * XP of an attack (p. 261): 50 per style point of Advantages, ignoring Restrictions; an edit pays only the points
 * added.
 * @param {{points: number, paid: number}} input
 */
export function attackCost({ points: total, paid }) {
  return MARTIAL_XP.perStylePoint * Math.max(0, total - paid);
}

/**
 * Points of an attack definition, with the references that no longer resolve (a school rank lost, a pack change).
 * @param {{advantages: {ref: string, count: number, choice?: number}[], restrictions: {ref: string, count: number}[]}} attack
 * @param {Record<string, {system: object}>} schools
 */
export function attackTotals(attack, schools) {
  const missing = [];
  const sum = (list) => list.reduce((total, chosen) => {
    const option = resolveRef(chosen.ref, schools);
    if (!option) {
      missing.push(chosen.ref);
      return total;
    }
    return total + points(option, chosen.count, chosen.choice ?? 0);
  }, 0);
  return { advantages: sum(attack.advantages), restrictions: sum(attack.restrictions), missing };
}

/**
 * Checks before using an attack (research R5): weapon group, weapon type, no weapon, Difficult Strike, Last Resort,
 * the target state and the character HP; Special Attacks need a melee weapon (p. 260). Requirements the system
 * cannot see are reminders.
 * @param {{state: {lastRound: number, lastCombat: string, usedScene: boolean}}} attack
 * @param {{entries: {option: object}[], weapon: {group: string, weaponType: string, unarmed: boolean}, kind: string,
 *   inCombat: boolean, round: number, combatId: string, targetStatuses: Iterable<string>, hp: {value: number, max: number}}} ctx
 * @returns {{blocked: {name: string, reason: string}[], reminders: string[]}}
 */
export function usageCheck(attack, ctx) {
  const blocked = [];
  const reminders = [];
  const statuses = new Set(ctx.targetStatuses ?? []);
  const { weapon } = ctx;
  const state = attack.state ?? {};
  if (ctx.kind === "special" && !(weapon.unarmed || weapon.weaponType === "melee")) blocked.push({ name: "", reason: "notMelee" });
  for (const { option } of ctx.entries) {
    const a = option.automation ?? {};
    const req = a.requires ?? {};
    const fail = (reason) => blocked.push({ name: option.name, reason });
    if (req.weaponGroup) {
      const matches = req.weaponGroup === "Unarmed" ? weapon.unarmed || weapon.group === "Unarmed" : weapon.group === req.weaponGroup;
      if (!matches) fail("weapon");
    }
    if (req.weaponType && weapon.weaponType !== req.weaponType) fail("weapon");
    if (req.noWeapon && !weapon.unarmed) fail("weapon");
    if (req.targetStatus && !req.targetStatus.some((id) => statuses.has(id))) fail("target");
    if (req.hpHalf && ctx.hp.max - ctx.hp.value < ctx.hp.max / 2) fail("hp");
    if (req.reminder) reminders.push(option.name);
    if (a.cooldown && ctx.inCombat && state.lastCombat === ctx.combatId && state.lastRound >= ctx.round - a.cooldown) fail("cooldown");
    if (a.perScene && state.usedScene) fail("perScene");
  }
  return { blocked, reminders };
}

/**
 * What an attack adds to the roll, the damage and the target (research R5), from its Advantages and Restrictions.
 * @param {{option: object, count: number, choice?: number}[]} entries
 */
export function attackModifiers(entries) {
  const m = {
    attack: { rolled: 0, kept: 0 }, damage: { rolled: 0, kept: 0 }, pen: 0, penZero: false, noStrength: false, explodeOn: 10,
    damagePerRaise: { rolled: 0 }, rolledCharacteristic: "", qualities: [], onHit: [], onMiss: [], self: [], resolve: {}, test: "",
    texts: []
  };
  for (const { option, count = 1, choice = 0 } of entries) {
    const a = option.automation ?? {};
    const n = option.perPoint ? Math.max(1, count) : 1;
    if (a.attack?.rolled) m.attack.rolled += a.attack.rolled * n;
    if (a.attack?.kept) m.attack.kept += a.attack.kept * n;
    if (a.attack?.rolledCharacteristic) m.rolledCharacteristic = a.attack.rolledCharacteristic;
    if (a.damage?.rolled) m.damage.rolled += a.damage.rolled * n;
    if (a.damage?.kept) m.damage.kept += a.damage.kept * n;
    if (a.pen) m.pen += a.pen * n;
    if (a.penZero) m.penZero = true;
    if (a.noStrength) m.noStrength = true;
    if (a.explodeOn) m.explodeOn = Math.min(m.explodeOn, a.explodeOn);
    if (a.damagePerRaise?.rolled) m.damagePerRaise.rolled += a.damagePerRaise.rolled;
    if (a.quality) m.qualities.push(a.quality.valuePerCount ? { key: a.quality.key, value: a.quality.valuePerCount * n } : { key: a.quality.key });
    for (const hit of a.onHit ?? []) {
      if (hit.fatigue) m.onHit.push({ fatigue: hit.fatigue * n });
      else if (hit.hpLoss === "choice") m.onHit.push({ hpLoss: choice });
      else m.onHit.push({ ...hit });
    }
    for (const miss of a.onMiss ?? []) m.onMiss.push({ ...miss });
    for (const self of a.self ?? []) m.self.push({ ...self });
    if (a.resolve) Object.assign(m.resolve, a.resolve);
    if (a.test) m.test = a.test.skill;
    if (a.text) m.texts.push({ name: option.name, effect: option.effect });
  }
  return m;
}
