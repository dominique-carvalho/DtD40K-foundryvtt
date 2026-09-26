/**
 * XP rules: costs of advances, what the current class (or Free Study) lets a character buy, the
 * XP totals and how to undo a purchase.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 15–16 (costs), p. 106 (leveling and Free Study), p. 179 (racial feats);
 * specs/006-classes-xp/contracts/rules-api.md.
 */
import { FREE_STUDY_MULTIPLIER, XP_COSTS } from "../config.mjs";
import { classProgress, matchesListFeat } from "./class.mjs";

/**
 * Cost of one advance.
 * @param {"characteristic"|"skill"|"feat"|"asset"|"powerStat"} kind
 * @param {number} from  current value (skills: 0 = new skill)
 * @returns {number}
 */
export function advanceCost(kind, from) {
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
 *   race: {name: string}|null, owned: object[]}} params
 * @returns {{allowed: boolean, multiplier: number, reason: ""|"noClass"|"offList"|"notOnList"|"ownedOrBlocked"}}
 */
export function canAdvance({ kind, key, feat, classes, race, owned }) {
  if (kind === "powerStat") return ok();
  if (kind === "feat" && feat?.system.category === "racialFeat" && feat.system.prerequisites.race === race?.name) return ok();
  if (!classes.length) return no("noClass");

  const current = classes.find((cls) => cls.system.status === "current");
  const completed = classes.filter((cls) => cls.system.status === "completed");

  if (kind === "characteristic" || kind === "skill") {
    if (current) return listed(current, kind, key) ? ok() : no("offList");
    return completed.some((cls) => listed(cls, kind, key)) ? ok() : ok(FREE_STUDY_MULTIPLIER);
  }

  if (kind === "feat") {
    const lists = current ? [current] : completed;
    for (const cls of lists) {
      const progress = classProgress(cls.system, owned);
      const entry = progress.entries.find((e) => matchesListFeat(e, feat) && (current || !e.mandatory));
      if (!entry) continue;
      return entry.owned && !cls.system.feats.find((e) => e === entry)?.subcategory?.match(/any/i)
        ? no("ownedOrBlocked")
        : entry.blocked ? no("ownedOrBlocked") : ok();
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
  powerStat: () => "powerStat"
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
