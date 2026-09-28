/**
 * Class rules: which list feats a character has, class progress and completion, whether a class
 * can be started, the character Level and the completion bonus effects.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 104–172 (leveling procedure p. 106); specs/006-classes-xp/contracts/rules-api.md.
 */
import { SKILLS } from "../config.mjs";
import { ADD } from "./race.mjs";

/**
 * @typedef {{name: string, subcategory: string, mandatory: boolean, orGroup: string}} ListFeat
 * @typedef {{name: string, system?: {selection?: {subcategory?: string}}}} OwnedFeat
 */

const lower = (text) => text.trim().toLowerCase();

/**
 * Split an owned feat name like "Peer (Nobility)" into base name and sub-category.
 * @param {OwnedFeat} feat
 * @returns {{base: string, sub: string}}
 */
function parts(feat) {
  const match = feat.name.match(/^(.*?)\s*\((.*)\)\s*$/);
  const sub = feat.system?.selection?.subcategory || (match ? match[2] : "");
  return { base: match ? match[1] : feat.name, sub };
}

/**
 * Whether an owned feat fulfils a feat of a class list: same base name (ignoring case) and, when the
 * list fixes a sub-category (other than "Any"), the same one.
 * @param {ListFeat} entry
 * @param {OwnedFeat} feat
 * @returns {boolean}
 */
export function matchesListFeat(entry, feat) {
  const { base, sub } = parts(feat);
  if (lower(base) !== lower(entry.name)) return false;
  const wanted = entry.subcategory?.trim();
  if (!wanted || lower(wanted) === "any") return true;
  return lower(sub) === lower(wanted);
}

/**
 * Progress of a class: which list feats are owned, the mandatory count (a mandatory A-or-B group
 * counts once) and whether the class is complete (p. 106). Alternatives of a fulfilled group are blocked.
 * @param {{feats: ListFeat[]}} cls
 * @param {OwnedFeat[]} ownedFeats
 */
export function classProgress(cls, ownedFeats) {
  const entries = cls.feats.map((entry) => ({ ...entry, owned: ownedFeats.some((feat) => matchesListFeat(entry, feat)), blocked: false }));
  const groups = new Map();
  for (const entry of entries) if (entry.orGroup) groups.set(entry.orGroup, [...(groups.get(entry.orGroup) ?? []), entry]);
  for (const members of groups.values()) {
    if (members.some((entry) => entry.owned)) for (const entry of members) entry.blocked = !entry.owned;
  }

  let required = 0;
  let done = 0;
  for (const entry of entries.filter((e) => e.mandatory && !e.orGroup)) {
    required++;
    if (entry.owned) done++;
  }
  for (const members of groups.values()) {
    if (!members.some((entry) => entry.mandatory)) continue;
    required++;
    if (members.some((entry) => entry.owned)) done++;
  }
  return { entries, required, done, complete: done === required };
}

/**
 * Whether a character may start a class (FR-004). Errors refuse it (the GM may confirm anyway);
 * warnings ask for confirmation.
 * @param {{cls: {name: string, system: object}, level: number, classes: {name: string, system: object}[],
 *   skills: Record<string, {value: number}>, feats: OwnedFeat[], creation?: boolean}} params
 *   creation: during character creation only a Level 1 class may start (spec 016, p. 15)
 */
export function checkClassEntry({ cls, level, classes, skills, feats, creation = false }) {
  const system = cls.system;
  const errors = [];
  const warnings = [];
  if (creation && system.level > 1) errors.push({ type: "creationLevel", level: system.level });
  else if (system.level > level + 1) errors.push({ type: "levelTooHigh", level: system.level, max: level + 1 });
  const current = classes.find((item) => item.system.status === "current");
  if (current) errors.push({ type: "currentIncomplete", name: current.name });
  if (classes.some((item) => lower(item.name) === lower(cls.name))) errors.push({ type: "alreadyTaken" });

  const missingSkills = system.prerequisites.skills.filter((req) => !req.keys.some((key) => (skills[key]?.value ?? 0) >= req.value));
  if (missingSkills.length) errors.push({ type: "missingSkills", missing: missingSkills });
  const missingFeats = system.prerequisites.feats.filter((wanted) => {
    const match = wanted.match(/^(.*?)\s*\((.*)\)\s*$/);
    const entry = { name: match ? match[1] : wanted, subcategory: match ? match[2] : "" };
    return !feats.some((feat) => matchesListFeat(entry, feat));
  });
  if (missingFeats.length) errors.push({ type: "missingFeats", missing: missingFeats });

  if (system.prerequisites.schools.length) {
    warnings.push({ type: "schools", schools: system.prerequisites.schools.map((s) => `${s.name} ${s.value}`) });
  }
  if (system.prerequisites.text?.trim()) warnings.push({ type: "text", text: system.prerequisites.text.trim() });
  return { errors, warnings };
}

/**
 * Character Level: the highest Level among the classes taken (p. 106); the stored value without classes.
 * @param {{system: {level: number}}[]} classes
 * @param {number} stored
 * @returns {number}
 */
export function characterLevel(classes, stored) {
  if (!classes.length) return stored;
  return Math.max(...classes.map((item) => item.system.level));
}

/** Modifier targeted by each numeric completion bonus (spec 005 modifiers). */
const MODIFIER = {
  hpMax: "system.modifiers.hpMax",
  initiative: "system.modifiers.initiative",
  resolveMax: "system.modifiers.resolveMax",
  staticDefense: "system.modifiers.staticDefense"
};

/**
 * Active Effects of a completion bonus (FR-009); text-only bonuses have none.
 * @param {{automation: string, value: number, selection: {skill: string, specialty: string}}} completion
 * @returns {{bonus: string, changes: {key: string, mode: number, value: string}[]}[]}
 */
export function buildCompletionEffects(completion) {
  const { automation, value, selection } = completion;
  if (MODIFIER[automation]) return [{ bonus: automation, changes: [{ key: MODIFIER[automation], mode: ADD, value: String(value) }] }];
  if (automation === "specialty" && selection.skill && selection.specialty?.trim()) {
    return [{ bonus: automation, changes: [{ key: `system.skills.${selection.skill}.specialties`, mode: ADD, value: selection.specialty.trim() }] }];
  }
  if (automation === "skillDot" && selection.skill) {
    return [{ bonus: automation, changes: [{ key: `system.skills.${selection.skill}.value`, mode: ADD, value: "1" }] }];
  }
  return [];
}

/**
 * Skills the player may pick for a completion bonus: any or Social skills for a specialty; skills
 * whose final value is below the character Level for the Bard track's +1.
 * @param {{automation: string, skillGroup?: string}} completion
 * @param {Record<string, {value: number}>} skills
 * @param {number} level
 * @returns {string[]}
 */
export function completionSkillOptions(completion, skills, level) {
  const keys = Object.keys(SKILLS);
  if (completion.automation === "specialty") {
    return completion.skillGroup === "social" ? keys.filter((key) => SKILLS[key].group === "social") : keys;
  }
  if (completion.automation === "skillDot") return keys.filter((key) => (skills[key]?.value ?? 0) < level);
  return [];
}
