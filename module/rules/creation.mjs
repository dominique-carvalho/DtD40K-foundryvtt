/**
 * Guided character creation (spec 016): the creation dots of characteristics and skills, the priorities deduced
 * from them, the caps of the step, the highest rating of each character, specialties, the creation XP and the
 * checklist.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 12–19, 22–24, 68, 76, 84, 179, 213; specs/016-guided-creation/contracts/rules-api.md.
 */
import { CHARACTERISTICS, CREATION, MAX_RATING, RATING_EXCEPTIONS, RATING_MAX, SKILLS } from "../config.mjs";

const DEFS = { characteristic: CHARACTERISTICS, skill: SKILLS };

/**
 * Dots of one rating bought with XP: what its purchases in the XP log added (spec 006).
 * @param {{type: string, kind: string, key: string, from: number, to: number}[]} log
 * @param {"characteristic"|"skill"} kind
 * @param {string} key
 * @returns {number}
 */
export function xpDots(log, kind, key) {
  let dots = 0;
  for (const entry of log) if (entry.type === "purchase" && entry.kind === kind && entry.key === key) dots += entry.to - entry.from;
  return dots;
}

/**
 * Creation dots spent (research R1): stored value − base − dots bought with XP. Race, exaltation and asset bonuses are
 * effects and never reach the stored value.
 * @param {"characteristic"|"skill"} kind
 * @param {Record<string, number>} source  stored values by key
 * @param {object[]} log  XP log
 * @returns {{byKey: Record<string, number>, byGroup: Record<string, number>}}
 */
export function creationSpend(kind, source, log) {
  const { base, groups } = CREATION[kind];
  const byKey = {};
  const byGroup = Object.fromEntries(groups.map((group) => [group, 0]));
  for (const [key, def] of Object.entries(DEFS[kind])) {
    const dots = Math.max(0, (source[key] ?? base) - base - xpDots(log, kind, key));
    byKey[key] = dots;
    byGroup[def.group] += dots;
  }
  return { byKey, byGroup };
}

/**
 * Priorities deduced from the spending (research R3): the group that spends most takes the highest budget. That order
 * fits whenever any order does.
 * @param {"characteristic"|"skill"} kind
 * @param {Record<string, number>} byGroup
 * @returns {{groups: {key: string, spent: number, budget: number}[], fits: boolean, unspent: number}}
 */
export function assignPriorities(kind, byGroup) {
  const { budgets, groups: order } = CREATION[kind];
  const groups = order.map((key) => ({ key, spent: byGroup[key] ?? 0 }))
    .sort((a, b) => b.spent - a.spent)
    .map((group, index) => ({ ...group, budget: budgets[index] }));
  return {
    groups,
    fits: groups.every((group) => group.spent <= group.budget),
    unspent: groups.reduce((sum, group) => sum + Math.max(0, group.budget - group.spent), 0)
  };
}

/**
 * Whether a rating may be set to `to` with creation dots (FR-004): lowering is always allowed; raising must keep the
 * rating within the cap of the step (4 characteristics, 3 skills, XP dots aside) and the spending within the budgets.
 * @param {{kind: "characteristic"|"skill", key: string, to: number, source: Record<string, number>, log: object[]}} input
 * @returns {{allowed: boolean, reason: ""|"stepMax"|"budget"}}
 */
export function checkDots({ kind, key, to, source, log }) {
  if (to <= (source[key] ?? CREATION[kind].base)) return { allowed: true, reason: "" };
  if (to - xpDots(log, kind, key) > CREATION[kind].stepMax) return { allowed: false, reason: "stepMax" };
  const { byGroup } = creationSpend(kind, { ...source, [key]: to }, log);
  if (!assignPriorities(kind, byGroup).fits) return { allowed: false, reason: "budget" };
  return { allowed: true, reason: "" };
}

/**
 * Highest rating of a character (p. 22, research R4/R5): 5, or 6 for as many ratings as the exceptions allow.
 * @param {{exaltation: {name: string, powerStat: number}|null, feats: string[]}} input
 * @returns {{characteristic: {max: number, limit: number}, skill: {max: number, limit: number}}}
 */
export function ratingCaps({ exaltation, feats }) {
  const limit = { characteristic: 0, skill: 0 };
  for (const exception of RATING_EXCEPTIONS) {
    const applies = exception.source === "exaltation"
      ? exaltation?.name === exception.name && exaltation.powerStat >= exception.rank
      : feats.includes(exception.name);
    if (!applies) continue;
    limit.characteristic += exception.characteristic;
    limit.skill += exception.skill;
  }
  const cap = (n) => ({ max: n > 0 ? MAX_RATING : RATING_MAX, limit: n });
  return { characteristic: cap(limit.characteristic), skill: cap(limit.skill) };
}

/**
 * Whether a rating may reach `to` (FR-005).
 * @param {{to: number, cap: {max: number, limit: number}, atSix: number}} input
 *   atSix: other ratings of the same kind already at 6
 * @returns {{allowed: boolean, reason: ""|"atMax"|"sixLimit"}}
 */
export function canReach({ to, cap, atSix }) {
  if (to > cap.max) return { allowed: false, reason: "atMax" };
  if (to >= MAX_RATING && atSix >= cap.limit) return { allowed: false, reason: "sixLimit" };
  return { allowed: true, reason: "" };
}

const LORES = ["academicLore", "commonLore", "forbiddenLore"];

/**
 * Specialties of the stored lists against what the rules give (p. 23, research R6): one for each rating at 4 or
 * more, plus Expanded Knowledge (one in each Mental skill but Perception, p. 185), Education (Lore specialties equal
 * to the starting Intelligence, p. 206) and the Atlantean (three Syrneth specialties, p. 68). Specialties granted by
 * effects (Skill Focus) are not in the stored lists.
 * @param {{ratings: {characteristic: Record<string, number>, skill: Record<string, number>},
 *   specialties: {characteristic: Record<string, string[]>, skill: Record<string, string[]>},
 *   extras?: {expandedKnowledge?: boolean, education?: number, atlantean?: number}}} input
 * @returns {{missing: {kind: string, key: string}[], excess: {kind: string, key: string, count: number}[]}}
 */
export function specialtyCheck({ ratings, specialties, extras = {} }) {
  const missing = [];
  const surplus = [];
  for (const kind of ["characteristic", "skill"]) {
    for (const [key, def] of Object.entries(DEFS[kind])) {
      const count = specialties[kind]?.[key]?.length ?? 0;
      const earned = (ratings[kind]?.[key] ?? 0) >= 4 ? 1 : 0;
      const knowledge = kind === "skill" && extras.expandedKnowledge && def.group === "mental" && key !== "perception" ? 1 : 0;
      if (earned && !count) missing.push({ kind, key });
      const extra = count - earned - knowledge;
      if (extra > 0) surplus.push({ kind, key, count: extra });
    }
  }
  // Shared allowances: Education only on the Lores, then the Atlantean on any skill.
  let education = extras.education ?? 0;
  let atlantean = extras.atlantean ?? 0;
  for (const entry of surplus) {
    if (entry.kind !== "skill") continue;
    if (LORES.includes(entry.key)) {
      const used = Math.min(education, entry.count);
      education -= used;
      entry.count -= used;
    }
    const used = Math.min(atlantean, entry.count);
    atlantean -= used;
    entry.count -= used;
  }
  return { missing, excess: surplus.filter((entry) => entry.count > 0) };
}

/**
 * XP of the creation (p. 16, p. 179): 600 plus 100 per Hindrance; awards are unusual before play starts.
 * @param {{total: number, spent: number, available: number, hindranceXp: number}} totals  from xpTotals
 * @param {{type: string, cost: number}[]} log
 */
export function creationXp(totals, log) {
  const awards = log.filter((entry) => entry.type === "award").reduce((sum, entry) => sum + entry.cost, 0);
  return { total: totals.total, spent: totals.spent, available: totals.available, hindranceXp: totals.hindranceXp, awards };
}

/**
 * Languages known at creation (p. 24): the racial one, Trade, and one for each Intelligence dot above 2.
 * @param {number} int
 */
export const languagesHint = (int) => 2 + Math.max(0, int - 2);

/** Status of a Starting Scores step from its priorities. */
const scoreStatus = (result) => {
  const spent = result.groups.reduce((sum, group) => sum + group.spent, 0);
  if (!spent) return "pending";
  return result.fits && !result.unspent ? "done" : "warning";
};

/**
 * Creation checklist (research R9), in the order of the chapter.
 * @param {{race: boolean, exaltation: boolean, classes: {level: number, current: boolean}[],
 *   deity: boolean, devotion: number, characteristics: object, skills: object, backgroundDots: number,
 *   xp: {available: number, awards: number}, specialties: {missing: object[], excess: object[]},
 *   slots: Record<string, {used: number, max: number}>, int: number}} state
 * @returns {{key: string, status: "done"|"pending"|"warning", data: object}[]}
 */
export function creationChecklist(state) {
  const steps = [];
  const step = (key, status, data = {}) => steps.push({ key, status, data });
  step("race", state.race ? "done" : "pending");
  if (state.exaltation) step("exaltation", "done");
  const current = state.classes.filter((cls) => cls.current);
  const classOk = state.classes.length === 1 && current.length === 1 && current[0].level === 1;
  step("class", !state.classes.length ? "pending" : classOk ? "done" : "warning");
  step("alignment", !state.deity ? "pending" : state.devotion === 6 ? "done" : "warning", { devotion: state.devotion });
  step("characteristics", scoreStatus(state.characteristics), { unspent: state.characteristics.unspent });
  step("skills", scoreStatus(state.skills), { unspent: state.skills.unspent });
  step("backgrounds", state.backgroundDots >= 7 ? "done" : state.backgroundDots ? "warning" : "pending", { dots: state.backgroundDots });
  step("xp", state.xp.awards ? "warning" : "done", { available: state.xp.available });
  const { missing, excess } = state.specialties;
  step("specialties", missing.length || excess.length ? "warning" : "done", { missing: missing.length, excess: excess.length });
  const slots = Object.values(state.slots);
  const used = slots.reduce((sum, slot) => sum + slot.used, 0);
  const max = slots.reduce((sum, slot) => sum + slot.max, 0);
  step("equipment", !used ? "pending" : used >= max ? "done" : "warning", { used, max });
  step("languages", "done", { count: languagesHint(state.int) });
  return steps;
}
