/**
 * XP rules: costs of advances, what the current class (or Free Study) lets a character buy, the
 * XP totals and how to undo a purchase.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 15–16 (costs), p. 106 (leveling and Free Study), p. 179 (racial feats);
 * specs/006-classes-xp/contracts/rules-api.md.
 */
import { FREE_STUDY_MULTIPLIER, MAGIC_XP, MARTIAL_SCHOOLS, MARTIAL_XP, XP_COSTS } from "../config.mjs";
import { classProgress, matchesListFeat } from "./class.mjs";

/**
 * Cost of one advance.
 * @param {"characteristic"|"skill"|"feat"|"asset"|"powerStat"|"school"|"combo"|"martial"|"specialAttack"} kind
 * @param {number} from  current value (skills: 0 = new skill; schools: current rank; combos: sum of spell levels;
 *   Special Attacks: style points added)
 * @returns {number}
 */
export function advanceCost(kind, from) {
  // Magic Schools: new 200, then 100 × current rank; Spell Combos 50 × levels (spec 009, p. 16, p. 229).
  // Sword Schools and Gun Kata cost as Magic Schools (p. 16); Special Attacks 50 per style point (p. 261).
  if (kind === "school" || kind === "martial") return from === 0 ? MAGIC_XP.newSchool : MAGIC_XP.perRank * from;
  if (kind === "specialAttack") return MARTIAL_XP.perStylePoint * from;
  if (kind === "combo") return MAGIC_XP.comboPerLevel * from;
  if (kind === "skill") return from === 0 ? XP_COSTS.newSkill : XP_COSTS.skill;
  return XP_COSTS[kind] ?? 0;
}

const ok = (multiplier = 1) => ({ allowed: true, multiplier, reason: "" });
const no = (reason) => ({ allowed: false, multiplier: 1, reason });

/** Whether a class list contains a characteristic or skill. */
const listed = (cls, kind, key) => (kind === "characteristic"
  ? cls.system.anyCharacteristic || cls.system.characteristics.includes(key)
  : cls.system.skills.includes(key));

/**
 * Whether an advance can be bought, and at which multiplier (research R5).
 * - During a class: only its characteristics, skills and feats.
 * - Free Study (every class completed): the lists of completed classes at normal cost; characteristics
 *   and skills off them at double cost; only the optional feats of completed classes.
 * - Racial feats of the character's race and the Power Stat are always allowed.
 * @param {{kind: string, key?: string, feat?: {name: string, system: object}, classes: object[],
 *   race: {name: string}|null, owned: object[], level?: number, from?: number, blocked?: string[]}} params
 *   blocked: characteristics reduced by a Degeneration (spec 011)
 * @returns {{allowed: boolean, multiplier: number, reason: ""|"noClass"|"offList"|"notOnList"|"ownedOrBlocked"|"atCap"|"degenerated"}}
 */
export function canAdvance({ kind, key, feat, classes, race, owned, level, from, blocked = [] }) {
  if (kind === "powerStat") return ok();
  // A characteristic reduced by a Degeneration cannot be raised with XP (spec 011, p. 285).
  if (kind === "characteristic" && blocked.includes(key)) return no("degenerated");
  // School ranks never exceed the character Level (p. 16).
  if ((kind === "school" || kind === "martial") && Number.isFinite(level) && (from ?? 0) + 1 > level) return no("atCap");
  if (kind === "specialAttack") return ok();
  if (kind === "feat" && feat?.system.category === "racialFeat" && feat.system.prerequisites.race === race?.name) return ok();
  if (!classes.length) return no("noClass");

  const current = classes.find((cls) => cls.system.status === "current");
  const completed = classes.filter((cls) => cls.system.status === "completed");

  if (kind === "characteristic" || kind === "skill") {
    if (current) return listed(current, kind, key) ? ok() : no("offList");
    return completed.some((cls) => listed(cls, kind, key)) ? ok() : ok(FREE_STUDY_MULTIPLIER);
  }

  // Magic Schools of the class lists (spec 009): the current class, or the completed ones in Free Study.
  if (kind === "school") {
    const lists = current ? [current] : completed;
    const onList = lists.some((cls) => (cls.system.magicSchools ?? []).some((name) => name.toLowerCase() === key));
    return onList ? ok() : no(current ? "offList" : "notOnList");
  }
  if (kind === "combo") return ok();

  // Sword Schools and Gun Kata of the class lists (spec 010), matched by name.
  if (kind === "martial") {
    const lists = current ? [current] : completed;
    const name = MARTIAL_SCHOOLS[key]?.name.toLowerCase();
    const listKey = MARTIAL_SCHOOLS[key]?.kind === "gunKata" ? "gunKata" : "swordSchools";
    const onList = lists.some((cls) => (cls.system[listKey] ?? []).some((entry) => entry.toLowerCase() === name));
    return onList ? ok() : no(current ? "offList" : "notOnList");
  }

  if (kind === "feat") {
    const lists = current ? [current] : completed;
    for (const cls of lists) {
      const progress = classProgress(cls.system, owned);
      const entry = progress.entries.find((e) => matchesListFeat(e, feat) && (current || !e.mandatory));
      if (!entry) continue;
      if (entry.blocked) return no("ownedOrBlocked");
      // An "(Any)" entry can be bought again with another sub-category; duplicates are checked by the feat rules.
      const open = !entry.subcategory || /^any$/i.test(entry.subcategory.trim());
      if (entry.owned && !(open && feat.system.selection?.subcategory)) return no("ownedOrBlocked");
      return ok();
    }
    return no("notOnList");
  }
  return no("notOnList");
}

/**
 * XP totals: starting XP + awards + hindrance XP; spent = purchases (FR-012).
 * @param {{starting: number, log: {type: string, cost: number}[], hindranceXp: number}} params
 */
export function xpTotals({ starting, log, hindranceXp }) {
  let awards = 0;
  let spent = 0;
  for (const entry of log) {
    if (entry.type === "award") awards += entry.cost;
    else spent += entry.cost;
  }
  const total = starting + awards + hindranceXp;
  return { total, spent, available: total - spent, hindranceXp };
}

/** Path of the stored value an advance changed. */
const PATHS = {
  characteristic: (key) => `system.characteristics.${key}.value`,
  skill: (key) => `system.skills.${key}.value`,
  powerStat: () => "powerStat",
  school: (key) => `system.magic.schools.${key}.value`,
  martial: (key) => `system.martial.schools.${key}.value`,
  // Backgrounds (spec 011): Wealth is the spec 007 value; Artifact/Backing instances are restored by the service.
  background: (key) => (key === "wealth" ? "system.wealth.value" : key.includes(":") ? null : `system.backgrounds.${key}.value`)
};

/**
 * How to undo a purchase (FR-016): restore the value only if it is still the purchased one,
 * delete the bought item, and refund the cost.
 * @param {{kind: string, key: string, from: number, to: number, cost: number, itemId?: string}} entry
 * @param {number|null} current  current stored value
 * @returns {{restore: {path: string, value: number}|null, deleteItem: string|null, refund: number}}
 */
export function undoPlan(entry, current) {
  if (entry.kind === "feat" || entry.kind === "asset") return { restore: null, deleteItem: entry.itemId || null, refund: entry.cost };
  const path = PATHS[entry.kind]?.(entry.key);
  const restore = path && current === entry.to ? { path, value: entry.from } : null;
  return { restore, deleteItem: null, refund: entry.cost };
}
