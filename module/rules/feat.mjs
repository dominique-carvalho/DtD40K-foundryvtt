/**
 * Feat rules: full names of feat groups, who may take a feat, the Active Effect changes of the
 * automated feats and the plans that add and release granted feats.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 106, 174–210; specs/005-feats-assets-hindrances/contracts/rules-api.md.
 */
import { CHARACTERISTICS, HINDRANCE_LIMIT, SKILLS } from "../config.mjs";
import { buildAssetEffects } from "./asset.mjs";
import { ADD, OVERRIDE } from "./race.mjs";

/**
 * @typedef {object} FeatSelection
 * @property {string} subcategory
 * @property {string} characteristic
 * @property {string} characteristic2
 * @property {string} skill
 * @property {string} specialty
 */

/**
 * @typedef {object} FeatLike   a feat item or its source data
 * @property {string} name
 * @property {object} system
 * @property {{dtd40k?: {grantedBy?: string[]|string, purchased?: boolean}}} [flags]
 */

/**
 * Display name of a feat on a character: "Peer (Nobility)" for feat groups (p. 174).
 * @param {{name: string, system: {selection?: {subcategory?: string}}}} feat
 * @returns {string}
 */
export function fullName({ name, system }) {
  const subcategory = system?.selection?.subcategory?.trim();
  if (!subcategory || name.endsWith(`(${subcategory})`)) return name;
  return `${name} (${subcategory})`;
}

/** Automations whose effect needs a choice from the player. */
const NEEDS = {
  madeOfMettle: { characteristic: true },
  beneficialMutation: { characteristic: true, characteristic2: true },
  veteran: { characteristic: true, skill: true },
  skillFocus: { skill: true, specialty: true }
};

/**
 * What the player must choose when adding a feat. Skill Focus asks for the skill and the
 * specialty instead of a free sub-category.
 * @param {object} system
 * @returns {{subcategory: boolean, characteristic: boolean, characteristic2: boolean, skill: boolean, specialty: boolean}}
 */
export function needsFeatSelection(system) {
  const needs = { subcategory: false, characteristic: false, characteristic2: false, skill: false, specialty: false, ...NEEDS[system.automation] };
  if (system.featGroup?.enabled && system.automation !== "skillFocus") needs.subcategory = true;
  return needs;
}

/**
 * Characteristics tied at the lowest final value.
 * @param {Record<string, {value: number}>} characteristics
 * @returns {string[]}
 */
export function lowestCharacteristics(characteristics) {
  const keys = Object.keys(CHARACTERISTICS);
  const lowest = Math.min(...keys.map((key) => characteristics[key]?.value ?? 0));
  return keys.filter((key) => (characteristics[key]?.value ?? 0) === lowest);
}

/**
 * Characteristics a feat may raise: the lowest ones for Made of Mettle and Beneficial Mutation
 * (evaluated when the feat is added), any for Veteran o' the Wheel.
 * @param {object} system
 * @param {Record<string, {value: number}>} characteristics
 * @returns {string[]}
 */
export function characteristicOptions(system, characteristics) {
  if (["madeOfMettle", "beneficialMutation"].includes(system.automation)) return lowestCharacteristics(characteristics);
  return Object.keys(CHARACTERISTICS);
}

/**
 * Validate the choices made when adding a feat.
 * @param {object} system
 * @param {FeatSelection} selection
 * @param {{characteristics: Record<string, {value: number}>}} ctx
 * @returns {{valid: true} | {valid: false, error: "noSubcategory"|"characteristic"|"characteristic2"|"skill"|"specialty"}}
 */
export function validateFeatSelection(system, selection, { characteristics }) {
  const needs = needsFeatSelection(system);
  if (needs.subcategory && !selection.subcategory?.trim()) return { valid: false, error: "noSubcategory" };
  if (needs.characteristic && !characteristicOptions(system, characteristics).includes(selection.characteristic)) {
    return { valid: false, error: "characteristic" };
  }
  if (needs.characteristic2 && (!(selection.characteristic2 in CHARACTERISTICS) || selection.characteristic2 === selection.characteristic)) {
    return { valid: false, error: "characteristic2" };
  }
  if (needs.skill && !(selection.skill in SKILLS)) return { valid: false, error: "skill" };
  if (needs.specialty && !selection.specialty?.trim()) return { valid: false, error: "specialty" };
  return { valid: true };
}

/**
 * Skill Focus is taken once per skill specialty: its sub-category becomes "<Skill>: <specialty>",
 * so the full name tells the copies apart ("Skill Focus (Pilot: Starships)").
 * @param {object} system
 * @param {FeatSelection} selection
 * @param {string} skillLabel  localized name of the chosen skill
 * @returns {FeatSelection}
 */
export function withSkillFocusName(system, selection, skillLabel) {
  if (system.automation !== "skillFocus" || !selection.specialty?.trim()) return selection;
  return { ...selection, subcategory: `${skillLabel}: ${selection.specialty.trim()}` };
}

/** Hindrances the book asks for in exchange of an asset (Sturdy p. 207; Veteran o' the Wheel p. 207). */
const EXTRA_HINDRANCES = { sturdy: 2, veteran: 1 };

/**
 * Whether a character may take a feat (FR-008, research R3).
 * Errors refuse the feat (the GM may confirm anyway); warnings ask for confirmation; notices inform.
 * @param {{feat: FeatLike, selection: FeatSelection, owned: FeatLike[], race: {name: string, system?: {power?: {name: string}}}|null}} params
 * @returns {{errors: string[], warnings: {type: string, names: string[]}[], notices: {type: string, count?: number}[]}}
 */
export function validateFeatAdd({ feat, selection, owned, race }) {
  const system = feat.system;
  const errors = [];
  const warnings = [];
  const notices = [];
  const name = fullName({ name: feat.name, system: { selection } });
  const sameCategory = owned.filter((item) => item.system.category === system.category);

  if (sameCategory.some((item) => fullName(item) === name)) {
    errors.push(system.repeatable || system.featGroup?.enabled ? "duplicate" : "notRepeatable");
  }
  if (system.category === "racialFeat") {
    if (!race) errors.push("noRace");
    else if (system.prerequisites.race && system.prerequisites.race !== race.name) errors.push("wrongRace");
  }
  if (system.category === "hindrance" && sameCategory.length >= HINDRANCE_LIMIT) errors.push("hindranceLimit");

  const missing = (system.requires ?? [])
    .filter(({ type, name: required }) => (type === "racePower"
      ? race?.system?.power?.name !== required
      : !owned.some((item) => item.name === required || item.name.startsWith(`${required} (`))))
    .map((requirement) => requirement.name);
  if (missing.length) warnings.push({ type: "missingDependency", names: missing });

  if (["asset", "hindrance"].includes(system.category)) notices.push({ type: "creationOnly" });
  if (EXTRA_HINDRANCES[system.automation]) notices.push({ type: "extraHindrances", count: EXTRA_HINDRANCES[system.automation] });
  return { errors, warnings, notices };
}

const characteristic = (key, value) => ({ key: `system.characteristics.${key}.value`, mode: ADD, value: String(value) });

/** Changes of each automated feat (research R4). */
const FEAT_CHANGES = {
  soundConstitution: () => [{ key: "system.modifiers.hpMax", mode: ADD, value: "1" }],
  discipline: () => [{ key: "system.modifiers.resolveMax", mode: ADD, value: "1" }],
  paranoia: () => [{ key: "system.modifiers.initiative", mode: ADD, value: "2" }],
  farsighted: () => [
    { key: "system.modifiers.resolveMax", mode: ADD, value: "3" },
    { key: "system.modifiers.mentalDefense", mode: ADD, value: "5" }
  ],
  halflingAgility: () => [{ key: "system.modifiers.staticDefense", mode: ADD, value: "4" }],
  noOneTougher: () => [{ key: "system.modifiers.staticDefenseCharacteristic", mode: OVERRIDE, value: "con" }],
  madeOfMettle: (s) => [characteristic(s.characteristic, 1)],
  beneficialMutation: (s) => [characteristic(s.characteristic, 2), characteristic(s.characteristic2, -1)],
  // The racial Size is an OVERRIDE (priority 50); a later ADD keeps the Matron's +2.
  matron: () => [
    characteristic("str", 1),
    characteristic("dex", -1),
    characteristic("fel", -1),
    { key: "system.size", mode: ADD, value: "2", priority: 60 }
  ],
  sturdy: () => [{ key: "system.modifiers.resilience", mode: ADD, value: "1" }],
  sand: () => [{ key: "system.modifiers.fatigueMax", mode: ADD, value: "2" }],
  nineLives: () => [{ key: "system.heroPoints.max", mode: ADD, value: "1" }],
  veteran: (s) => [characteristic(s.characteristic, 1), { key: `system.skills.${s.skill}.value`, mode: ADD, value: "1" }],
  skillFocus: (s) => [{ key: `system.skills.${s.skill}.specialties`, mode: ADD, value: s.specialty.trim() }],
  noisyCricket: () => [{ key: "system.skills.acrobatics.specialties", mode: ADD, value: "Jumping" }]
};

/**
 * Active Effects of an automated feat, asset or Exalted Asset (FR-011); text-only feats have none.
 * @param {{automation: string}} system
 * @param {FeatSelection} selection
 * @returns {{feat: string, changes: {key: string, mode: number, value: string, priority?: number}[]}[]}
 */
export function buildFeatEffects(system, selection) {
  const build = FEAT_CHANGES[system.automation];
  if (build) return [{ feat: system.automation, changes: build(selection) }];
  return buildAssetEffects(system).map((effect) => ({ feat: effect.asset, changes: effect.changes }));
}

/**
 * Origins that granted a feat (the 004 Perfection flag is a plain string).
 * @param {FeatLike} item
 * @returns {string[]}
 */
export function grantedByOf(item) {
  const value = item.flags?.dtd40k?.grantedBy;
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

/**
 * Feats to create for an origin, and owned feats that just gain the origin (no duplicates).
 * @param {{name: string, subcategory: string, choose: boolean}[]} grants
 * @param {(FeatLike & {id: string})[]} owned
 * @param {string} originId
 * @returns {{create: object[], attach: string[]}}
 */
export function grantPlan(grants, owned, originId) {
  const create = [];
  const attach = [];
  for (const grant of grants) {
    const name = grant.subcategory ? `${grant.name} (${grant.subcategory})` : grant.name;
    const existing = !grant.choose && owned.find((item) => item.name === name);
    if (!existing) create.push(grant);
    else if (!grantedByOf(existing).includes(originId) && !attach.includes(existing.id)) attach.push(existing.id);
  }
  return { create, attach };
}

/**
 * What happens to granted feats when an origin leaves the character: the origin is removed from
 * each feat, and feats left with no origin and not purchased are deleted.
 * @param {(FeatLike & {id: string})[]} owned
 * @param {string} originId
 * @returns {{update: {id: string, grantedBy: string[]}[], remove: string[]}}
 */
export function releasePlan(owned, originId) {
  const update = [];
  const remove = [];
  for (const item of owned) {
    const origins = grantedByOf(item);
    if (!origins.includes(originId)) continue;
    const remaining = origins.filter((id) => id !== originId);
    if (!remaining.length && !item.flags?.dtd40k?.purchased) remove.push(item.id);
    else update.push({ id: item.id, grantedBy: remaining });
  }
  return { update, remove };
}

/**
 * Grants of an exaltation available at the current Power Stat.
 * @param {{grants: {rank?: number}[]}} exaltation
 * @param {number} ps
 * @returns {object[]}
 */
export function activeGrants({ grants }, ps) {
  return (grants ?? []).filter((grant) => (grant.rank ?? 1) <= ps);
}
