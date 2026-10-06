/**
 * Character builder (spec 023): the steps of the wizard, the validation of each one from the draft and compendium
 * data, the XP balance, the preview of the final ratings and the plan applied when the character is finished.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 12–19 (creation steps, XP table p. 16), p. 23 (specialties), p. 179 (Assets and Hindrances),
 * pp. 280–283 (Backgrounds); specs/023-character-builder/contracts/rules-api.md.
 */
import { BACKGROUND_XP, CHARACTERISTICS, CREATION, SKILLS, STARTING_SLOTS, STARTING_XP } from "../config.mjs";
import { backgroundCost, inheritanceFits, inheritanceUsed } from "./backgrounds.mjs";
import { checkClassEntry } from "./class.mjs";
import { needsSelection, validateExaltationSelection } from "./exaltation.mjs";
import { validateRaceChoice } from "./race.mjs";
import { advanceCost, canAdvance } from "./xp.mjs";

/** Steps of the wizard, in the order of the chapter (FR-002). */
export const BUILDER_STEPS = ["concept", "race", "exaltation", "characteristics", "skills", "specialties", "class", "backgrounds", "alignment", "feats", "exaltedAsset", "xp", "equipment", "review"];

const DEFS = { characteristic: CHARACTERISTICS, skill: SKILLS };
const result = (reasons, extra = {}) => ({ ok: reasons.length === 0, reasons, ...extra });

/**
 * Concept: the character needs a name.
 * @param {{name: string}} input
 */
export function validateConcept({ name }) {
  return result(String(name ?? "").trim() ? [] : ["nameRequired"]);
}

/**
 * Race and its choice (bonus characteristic, Human skills).
 * @param {{race: object|null, choice?: object}} input  race: the race's system data
 */
export function validateRace({ race, choice }) {
  if (!race) return result(["raceRequired"]);
  return result(validateRaceChoice(race, { characteristic: "", skills: [], ...choice }).valid ? [] : ["raceChoice"]);
}

/**
 * Exaltation and its selection (Statuesque, Blood Quickening).
 * @param {{exaltation: object|null, selection?: object, race?: object|null, raceChoice?: object}} input
 */
export function validateExaltation({ exaltation, selection = {}, race = null, raceChoice }) {
  if (!exaltation) return result(["exaltationRequired"]);
  const raceData = race ? { ...race, choice: raceChoice } : null;
  if (!needsSelection(exaltation, raceData) && !(exaltation.staticPowers ?? []).some((p) => p.automation === "statuesque")) return result([]);
  return result(validateExaltationSelection(exaltation, { statuesque: "", element: "", ...selection }, raceData).valid ? [] : ["exaltationChoice"]);
}

/**
 * Starting scores (FR-005, p. 13): the groups in priority order take the budgets (6/4/2 characteristics, 8/6/4
 * skills); no rating above the step's cap (base + dots: 4 characteristics, 3 skills). Unspent dots only warn.
 * @param {{kind: "characteristic"|"skill", priorities: string[], dots: Record<string, number>}} input
 */
export function validateRatings({ kind, priorities, dots }) {
  const { base, budgets, groups, stepMax } = CREATION[kind];
  if (priorities?.length !== groups.length || new Set(priorities).size !== groups.length) return result(["priorities"], { groups: [], warnings: [] });
  const spent = Object.fromEntries(groups.map((g) => [g, 0]));
  const reasons = new Set();
  for (const [key, value] of Object.entries(dots ?? {})) {
    const def = DEFS[kind][key];
    if (!def || !value) continue;
    spent[def.group] += value;
    if (base + value > stepMax) reasons.add("cap");
  }
  const out = priorities.map((key, index) => ({ key, spent: spent[key], budget: budgets[index] }));
  if (out.some((g) => g.spent > g.budget)) reasons.add("budget");
  const warnings = out.some((g) => g.spent < g.budget) ? ["unspent"] : [];
  return result([...reasons], { groups: out, warnings });
}

/**
 * Specialties (FR-006, p. 23): one for each characteristic or skill whose final value is 4 or more.
 * @param {{finals: {characteristic: object, skill: object}, specialties: Record<string, string>}} input
 *   specialties keyed "characteristic.<key>" / "skill.<key>"
 */
export function validateSpecialties({ finals, specialties }) {
  const reasons = new Set();
  for (const [path, text] of Object.entries(specialties ?? {})) {
    if (!String(text ?? "").trim()) continue;
    const [kind, key] = path.split(".");
    if ((finals[kind]?.[key] ?? 0) < 4) reasons.add("specialtyLow");
  }
  // A rating raised to 4 later (an XP purchase) without its specialty only warns.
  const missing = ["characteristic", "skill"].some((kind) => Object.entries(finals[kind] ?? {})
    .some(([key, value]) => value >= 4 && !String(specialties?.[`${kind}.${key}`] ?? "").trim()));
  return result([...reasons], { warnings: missing ? ["missing"] : [] });
}

/**
 * Classes a new character may start (FR-007): Level 1 and prerequisites met (spec 016 rules).
 * @param {{classes: {uuid?: string, name: string, system: object}[], skills: Record<string, number>, feats?: object[]}} input
 * @returns {{uuid: string, name: string, allowed: boolean, reasons: string[]}[]}
 */
export function availableClasses({ classes, skills, feats = [] }) {
  const ratings = Object.fromEntries(Object.entries(skills ?? {}).map(([key, value]) => [key, { value }]));
  return classes.map((cls) => {
    const { errors } = checkClassEntry({ cls, level: 0, classes: [], skills: ratings, feats, creation: true });
    return { uuid: cls.uuid ?? "", name: cls.name, allowed: errors.length === 0, reasons: errors.map((e) => e.type) };
  });
}

/**
 * Backgrounds (FR-008, pp. 15–16): 7 free dots, none above 3 for free; then 50 XP per dot 1–3 and 100 per dot 4–5;
 * at most 5 dots of Artifacts. Each Backing (spec 027) is a Background of its own; one without a name only warns.
 * @param {{backgrounds: Record<string, number>, wealth: number, artifacts?: {value: number}[],
 *   backings?: {name: string, value: number}[]}} input
 * @returns {{ok: boolean, reasons: string[], warnings: string[], xp: number, free: number}}
 */
export function validateBackgrounds({ backgrounds, wealth = 0, artifacts = [], backings = [] }) {
  const ratings = [wealth, ...Object.values(backgrounds ?? {}), ...artifacts.map((a) => a.value), ...backings.map((b) => b.value)].filter((v) => v > 0);
  const warnings = backings.some((b) => !b.name?.trim()) ? ["unnamedBacking"] : [];
  const reasons = new Set();
  let dotsUsed = 0;
  let xp = 0;
  for (const value of ratings) {
    if (value > 5) reasons.add("atMax");
    for (let to = 1; to <= Math.min(value, 5); to++) {
      const cost = backgroundCost({ to, dotsUsed });
      if (to <= BACKGROUND_XP.freeMax && cost === 0) dotsUsed += 1;
      xp += cost;
    }
  }
  if (artifacts.reduce((sum, a) => sum + (a.value ?? 0), 0) > BACKGROUND_XP.artifactCreationMax) reasons.add("artifactCap");
  return result([...reasons], { warnings, xp, free: Math.min(dotsUsed, BACKGROUND_XP.freeDots) });
}

/**
 * Inheritance items (spec 027, p. 282): counted by rarity and checked with the sheet's rule (inheritanceFits); no
 * artifacts. `used` and `max` are rank-1 slots (one Uncommon each; 2^(rating − 1) of them).
 * @param {{level: number, items: {system: {rarity: string}, artifact?: boolean}[]}} input
 * @returns {{ok: boolean, reasons: string[], picks: Record<string, number>, used: number, max: number}}
 */
export function inheritanceItems({ level, items }) {
  const reasons = [];
  const picks = {};
  for (const item of items) picks[item.system.rarity] = (picks[item.system.rarity] ?? 0) + 1;
  if (items.some((i) => i.artifact)) reasons.push("artifact");
  if (!inheritanceFits(level, picks)) reasons.push("inheritanceOver");
  return result(reasons, { picks, used: inheritanceUsed(picks) || 0, max: level > 0 ? 2 ** (level - 1) : 0 });
}

/**
 * Assets, Hindrances and the Exalted Asset (FR-009, p. 179): at most two Hindrances (+100 XP each); Assets 100 XP;
 * the Exalted Asset 100 XP and only of the character's exaltation (or race, for Paragon racial assets).
 * @param {{hindrances: object[], assets: object[], exaltedAsset?: object|null, exaltation: string, race?: string}} input
 */
export function validateFeats({ hindrances, assets, exaltedAsset = null, exaltation, race = "" }) {
  const reasons = [];
  if (hindrances.length > 2) reasons.push("hindranceLimit");
  if (exaltedAsset) {
    const req = exaltedAsset.system.prerequisites ?? {};
    if ((req.exaltation && req.exaltation !== exaltation) || (req.race && req.race !== race)) reasons.push("wrongExaltation");
  }
  const xpGranted = hindrances.reduce((sum, h) => sum + (h.system.xpGranted || 100), 0);
  const xpSpent = assets.length * 100 + (exaltedAsset ? 100 : 0);
  return result(reasons, { xpGranted, xpSpent });
}

/**
 * Price the XP purchases in order (FR-010, p. 16) against the class lists, Level 1: each one from the value the
 * previous ones left. Racial feats of the race are always allowed (spec 006). Released by the GM, the refused ones
 * are bought anyway and cost their XP (the step stays marked as released).
 * @param {{purchases: object[], values: {characteristic: object, skill: object}, cls: object|null, race: object|null,
 *   owned: object[], powerStat?: number, schools?: object, released?: boolean}} input
 */
export function pricePurchases({ purchases, values, cls, race, owned, powerStat = 1, schools = {}, released = false }) {
  const current = { characteristic: { ...values.characteristic }, skill: { ...values.skill }, school: { ...schools }, martial: { ...schools } };
  const classes = cls ? [{ ...cls, system: { ...cls.system, status: "current" } }] : [];
  let ps = powerStat;
  let spent = 0;
  const entries = purchases.map((p) => {
    let from = 0;
    let cost;
    let check;
    if (p.kind === "powerStat") {
      from = ps;
      cost = advanceCost("powerStat", from);
      check = from + 1 > 1 ? { allowed: false, reason: "atCap" } : canAdvance({ kind: "powerStat", classes, race, owned });
    } else if (p.kind === "feat") {
      cost = advanceCost("feat", 0);
      check = canAdvance({ kind: "feat", feat: p.feat, classes, race, owned });
    } else {
      const base = p.kind === "characteristic" ? CREATION.characteristic.base : 0;
      from = current[p.kind]?.[p.key] ?? base;
      cost = advanceCost(p.kind, from);
      check = canAdvance({ kind: p.kind, key: p.key, classes, race, owned, level: 1, from });
    }
    const allowed = check.allowed;
    if (allowed || released) {
      spent += cost * (check.multiplier ?? 1);
      if (p.kind === "powerStat") ps += 1;
      else if (p.kind !== "feat") current[p.kind][p.key] = from + 1;
    }
    return { ...p, from, cost: cost * (check.multiplier ?? 1), allowed, reason: check.reason ?? "" };
  });
  return result(entries.some((e) => !e.allowed) ? ["purchaseRefused"] : [], { entries, spent });
}

/**
 * XP balance (p. 16): 600 plus the Hindrances, minus Assets, Exalted Asset, Backgrounds beyond the free dots and
 * purchases.
 * @param {{starting?: number, granted: number, traits: number, backgrounds: number, purchases: number}} input
 */
export function xpBalance({ starting = STARTING_XP, granted, traits, backgrounds, purchases }) {
  const spent = traits + backgrounds + purchases;
  return { starting, granted, spent, available: starting + granted - spent };
}

/**
 * Starting equipment (FR-011, p. 16): 1 Rare, 1 Uncommon, 2 Common, 2 Very Common, each of its exact rarity and no
 * artifacts (hearthstones, materials, wonders). Empty slots only warn.
 * @param {{picks: {slot: string, item: {system: {rarity: string}, artifact?: boolean}}[]}} input
 */
export function equipmentSlots({ picks }) {
  const reasons = new Set();
  const used = Object.fromEntries(Object.keys(STARTING_SLOTS).map((k) => [k, 0]));
  for (const { slot, item } of picks) {
    if (!(slot in STARTING_SLOTS)) continue;
    used[slot] += 1;
    if (item.system.rarity !== slot) reasons.add("wrongRarity");
    if (item.artifact) reasons.add("artifact");
  }
  for (const [slot, max] of Object.entries(STARTING_SLOTS)) if (used[slot] > max) reasons.add("tooMany");
  const empty = Object.entries(STARTING_SLOTS).reduce((sum, [slot, max]) => sum + Math.max(0, max - used[slot]), 0);
  return result([...reasons], { used, empty });
}

/**
 * Final ratings of the draft (FR-012): base + creation dots + XP purchases + the racial bonuses + Statuesque.
 * @param {{dots: {characteristic: object, skill: object}, race?: object|null, raceChoice?: object,
 *   exaltation?: object|null, selection?: object, purchases?: object[]}} input
 * @returns {{characteristic: Record<string, number>, skill: Record<string, number>}}
 */
export function previewCharacter({ dots, race = null, raceChoice = {}, exaltation = null, selection = {}, purchases = [] }) {
  const out = {};
  for (const kind of ["characteristic", "skill"]) {
    out[kind] = Object.fromEntries(Object.keys(DEFS[kind]).map((key) => [key, CREATION[kind].base + (dots[kind]?.[key] ?? 0)]));
  }
  for (const p of purchases) if (p.kind in out && p.key in out[p.kind]) out[p.kind][p.key] += 1;
  if (race) {
    if (raceChoice.characteristic in out.characteristic) out.characteristic[raceChoice.characteristic] += 1;
    for (const key of [...(race.skillBonus?.skills ?? []), ...(raceChoice.skills ?? [])]) if (key in out.skill) out.skill[key] += 1;
  }
  if ((exaltation?.staticPowers ?? []).some((p) => p.automation === "statuesque") && selection.statuesque in out.characteristic) {
    out.characteristic[selection.statuesque] += 1;
  }
  return out;
}

/**
 * The plan applied when the character is finished (research R1), in order; steps without choices are skipped.
 * @param {{draft: object}} input
 * @returns {{op: string}[]}
 */
export function buildPlan({ draft }) {
  const plan = [];
  const add = (op, when = true) => when && plan.push({ op });
  add("race", Boolean(draft.race?.uuid));
  add("exaltation", Boolean(draft.exaltation?.uuid));
  add("ratings");
  add("specialties");
  add("class", Boolean(draft.class?.uuid));
  add("deity", Boolean(draft.deity?.uuid));
  add("backgrounds");
  add("hindrances", Boolean(draft.hindrances?.length));
  add("assets", Boolean(draft.assets?.length));
  add("exaltedAsset", Boolean(draft.exaltedAsset?.uuid));
  add("purchases", Boolean(draft.purchases?.length));
  add("equipment", Boolean(draft.equipment?.length || draft.inheritance?.length));
  return plan;
}
