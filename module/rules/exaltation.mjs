/**
 * Exaltation rules: Power Stat caps, resource maximums, spending, the Tell and the
 * Active Effect changes of the automated static powers.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 65–100; specs/004-exaltation-compendium/contracts/rules-api.md.
 */
import { CHARACTERISTICS } from "../config.mjs";
import { ADD, characteristicOptions } from "./race.mjs";

/**
 * @typedef {object} ExaltationSystem   subset of ExaltationData used by the rules
 * @property {{name: string, cap: "level"|"levelAndDevotion", value: number}} powerStat
 * @property {{name: string, formula: string, fixedMax: number, debtName: string, healing: string, spent: number}} resource
 * @property {{spent: number, marker: string}} round
 * @property {{spent: number}} scene
 * @property {{enabled: boolean, spent: number}} pressure
 * @property {{name: string, automation: string}[]} staticPowers
 * @property {{rank: number, name: string}[]} powers
 * @property {{key: string, name: string, characteristic: string, hpMax: number}[]} elements
 */

/**
 * @typedef {object} ExaltationStats   character values the formulas read
 * @property {Record<string, {value: number}>} characteristics
 * @property {number} level
 * @property {number} devotion
 * @property {number} resolveMax
 */

/** @typedef {{statuesque: string, element: string}} ExaltationSelection */

/**
 * @typedef {object} ExaltedEffectData
 * @property {string} exalted   "destiny" | "statuesque" | "element" | "element.hp"
 * @property {{key: string, mode: number, value: string}[]} changes
 * @property {{type: string, key?: string, name?: string, value?: number}} label  for the adapter's i18n name
 */

/**
 * Highest effective Power Stat: the Level (p. 65), and for the Chosen also half the
 * Devotion rounded up (Conviction, p. 71). Never below 1.
 * @param {{cap: string, level: number, devotion: number}} params
 * @returns {number}
 */
export function powerStatMax({ cap, level, devotion }) {
  const max = cap === "levelAndDevotion" ? Math.min(level, Math.ceil(devotion / 2)) : level;
  return Math.max(1, max);
}

/**
 * Purchased Power Stat limited to 1..max; the purchased value itself is kept (spec assumption).
 * @param {number} purchased
 * @param {number} max
 * @returns {number}
 */
export function effectivePowerStat(purchased, max) {
  return Math.min(Math.max(1, purchased), max);
}

/** Resource maximum formulas (research R3). */
const FORMULAS = {
  motes: ({ c, ps }) => c("cha") + c("int") + 2 * ps,
  favor: ({ devotion, ps }) => devotion + ps,
  essence: ({ c, ps }) => c("wil") + c("cha") + 2 * ps,
  breath: ({ level }) => 2 * level,
  actionPoints: ({ level, ps }) => level + ps,
  pyros: ({ ps }) => 3 * ps,
  vitae: ({ ps }) => 5 * ps,
  rage: ({ c, level }) => c("cmp") + c("wil") + level,
  plasm: ({ resolveMax, ps }) => ps + resolveMax,
  fixed: ({ fixedMax }) => fixedMax
};

/**
 * Maximum of the exaltation's resource, with the asset modifiers (Extra Action, Blood of Io).
 * @param {{formula: string, fixedMax: number}} resource
 * @param {ExaltationStats} stats
 * @param {number} ps  effective Power Stat
 * @param {{resourceBonus?: number, resourcePerPowerStat?: number}} [mods]
 * @returns {number}
 */
export function resourceMax({ formula, fixedMax }, stats, ps, mods = {}) {
  const c = (key) => stats.characteristics[key]?.value ?? 0;
  const base = (FORMULAS[formula] ?? FORMULAS.fixed)({
    c,
    ps,
    level: stats.level,
    devotion: stats.devotion,
    resolveMax: stats.resolveMax,
    fixedMax: fixedMax ?? 0
  });
  const bonus = (Number(mods.resourceBonus) || 0) + (Number(mods.resourcePerPowerStat) || 0) * ps;
  return Math.max(0, base + bonus);
}

/**
 * Current resource: the item stores points spent, not points left (research R2).
 * @param {number} max
 * @param {number} spent
 * @returns {number}
 */
export function resourceValue(max, spent) {
  return Math.max(0, max - spent);
}

/**
 * Powers by rank, unlocked up to the effective Power Stat (FR-014).
 * @param {{rank: number, name: string}[]} powers
 * @param {number} ps
 * @returns {{rank: number, name: string, unlocked: boolean}[]}
 */
export function unlockedPowers(powers, ps) {
  return powers.map((power) => ({ ...power, unlocked: power.rank <= ps }));
}

/**
 * Whether the exaltation has an automated static power.
 * @param {ExaltationSystem} exaltation
 * @param {string} automation
 */
const hasPower = (exaltation, automation) => exaltation.staticPowers.some((power) => power.automation === automation);

/**
 * Characteristics Statuesque may raise: the race's bonus options other than the one already
 * chosen for the race (p. 83). Without a race, any characteristic.
 * @param {{characteristicBonus: {options: string[], any: boolean}, choice: {characteristic: string}}|null} race
 * @returns {string[]}
 */
export function statuesqueOptions(race) {
  if (!race) return Object.keys(CHARACTERISTICS);
  return characteristicOptions(race).filter((key) => key !== race.choice?.characteristic);
}

/**
 * Whether applying the exaltation needs a choice from the player (FR-010).
 * @param {ExaltationSystem} exaltation
 * @param {object|null} race
 * @returns {boolean}
 */
export function needsSelection(exaltation, race) {
  if (hasPower(exaltation, "statuesque") && statuesqueOptions(race).length > 1) return true;
  return hasPower(exaltation, "bloodQuickening") && exaltation.elements.length > 1;
}

/**
 * Selection used when nothing has to be asked (single option) or as the dialog's initial state.
 * @param {ExaltationSystem} exaltation
 * @param {object|null} race
 * @returns {ExaltationSelection}
 */
export function defaultSelection(exaltation, race) {
  const options = hasPower(exaltation, "statuesque") ? statuesqueOptions(race) : [];
  const elements = hasPower(exaltation, "bloodQuickening") ? exaltation.elements : [];
  return {
    statuesque: options.length === 1 ? options[0] : "",
    element: elements.length === 1 ? elements[0].key : ""
  };
}

/**
 * Validate the choices made when applying the exaltation.
 * @param {ExaltationSystem} exaltation
 * @param {ExaltationSelection} selection
 * @param {object|null} race
 * @returns {{valid: true} | {valid: false, error: "statuesque"|"element"}}
 */
export function validateExaltationSelection(exaltation, selection, race) {
  if (hasPower(exaltation, "statuesque") && !statuesqueOptions(race).includes(selection.statuesque)) {
    return { valid: false, error: "statuesque" };
  }
  if (hasPower(exaltation, "bloodQuickening") && !exaltation.elements.some((element) => element.key === selection.element)) {
    return { valid: false, error: "element" };
  }
  return { valid: true };
}

/**
 * Active Effects of the automated static powers, one per modifier so the GM can disable
 * each one (FR-025, FR-027, research R5).
 * @param {ExaltationSystem} exaltation
 * @param {ExaltationSelection} selection
 * @param {object|null} race
 * @returns {ExaltedEffectData[]}
 */
export function buildExaltationEffects(exaltation, selection, race) {
  const check = validateExaltationSelection(exaltation, selection, race);
  if (!check.valid) throw new Error(`Invalid exaltation choice: ${check.error}`);

  const effects = [];
  if (hasPower(exaltation, "destiny")) {
    effects.push({
      exalted: "destiny",
      changes: [{ key: "system.heroPoints.max", mode: ADD, value: "2" }],
      label: { type: "destiny" }
    });
  }
  if (hasPower(exaltation, "statuesque")) {
    effects.push({
      exalted: "statuesque",
      changes: [{ key: `system.characteristics.${selection.statuesque}.value`, mode: ADD, value: "1" }],
      label: { type: "statuesque", key: selection.statuesque }
    });
  }
  if (hasPower(exaltation, "bloodQuickening")) {
    const element = exaltation.elements.find((entry) => entry.key === selection.element);
    effects.push({
      exalted: "element",
      changes: [{ key: `system.characteristics.${element.characteristic}.value`, mode: ADD, value: "1" }],
      label: { type: "element", key: element.characteristic, name: element.name }
    });
    if (element.hpMax > 0) {
      effects.push({
        exalted: "element.hp",
        changes: [{ key: "system.modifiers.hpMax", mode: ADD, value: String(element.hpMax) }],
        label: { type: "elementHp", name: element.name, value: element.hpMax }
      });
    }
  }
  return effects;
}

/**
 * Points spent this round: the stored count only holds while the combat round that recorded
 * it is still the current one, so nothing has to be written when the round advances (research R4).
 * @param {number} stored
 * @param {string} marker         "<combatId>:<round>" of the last spend, or "none"
 * @param {string} currentMarker  same format for the current combat, or "none"
 * @returns {number}
 */
export function roundSpent(stored, marker, currentMarker) {
  return marker === currentMarker ? stored : 0;
}

/**
 * Tell intensity from the points spent in the scene (p. 65):
 * 0 none, 1 faint, 2 obvious (2–3), 3 aura (4–5), 4 epic (6+).
 * @param {number} sceneSpent
 * @returns {0|1|2|3|4}
 */
export function tellLevel(sceneSpent) {
  if (sceneSpent >= 6) return 4;
  if (sceneSpent >= 4) return 3;
  if (sceneSpent >= 2) return 2;
  return sceneSpent >= 1 ? 1 : 0;
}

/**
 * Whether one more point can be spent: the pool must not be empty and at most Power Stat
 * points may be spent per round (p. 65).
 * @param {{value: number, roundSpent: number, ps: number}} params
 * @returns {"ok"|"empty"|"overLimit"}
 */
export function spendCheck({ value, roundSpent: spentThisRound, ps }) {
  if (value <= 0) return "empty";
  return spentThisRound >= ps ? "overLimit" : "ok";
}

/**
 * Points spent after a recovery button (research R4).
 * @param {number} spent
 * @param {{type: string, amount: string}} action
 * @param {number} ps
 * @param {number} max
 * @returns {number}
 */
export function applyResourceAction(spent, action, ps, max) {
  const amount = action.amount === "powerStat" ? ps : Number(action.amount) || 0;
  switch (action.type) {
    case "restoreAll": return 0;
    case "unravel": return Math.max(0, spent - 1);
    case "regain": return Math.max(0, spent - amount);
    case "lose": return Math.min(max, spent + amount);
    default: return spent;
  }
}

/**
 * Pressure Points of the Paragon: 5 × Excellence per scene (Be a Man, p. 84).
 * @param {number} ps
 * @param {boolean} enabled
 * @returns {number|null}
 */
export function pressureMax(ps, enabled) {
  return enabled ? 5 * ps : null;
}

/**
 * Everything the sheet shows about the character's exaltation (research R2), computed after
 * the character's own derived values.
 * @param {ExaltationSystem} exaltation
 * @param {ExaltationStats} stats
 * @param {{resourceBonus?: number, resourcePerPowerStat?: number}} [mods]
 * @param {{currentMarker?: string}} [options]
 */
export function computeExaltation(exaltation, stats, mods = {}, { currentMarker = "none" } = {}) {
  const max = powerStatMax({ cap: exaltation.powerStat.cap, level: stats.level, devotion: stats.devotion });
  const ps = effectivePowerStat(exaltation.powerStat.value, max);
  const resourceMaximum = resourceMax(exaltation.resource, stats, ps, mods);
  const spent = exaltation.resource.spent;
  const spentThisRound = roundSpent(exaltation.round.spent, exaltation.round.marker, currentMarker);
  const pressure = pressureMax(ps, exaltation.pressure.enabled);

  return {
    powerStat: { name: exaltation.powerStat.name, value: ps, purchased: exaltation.powerStat.value, max },
    resource: {
      name: exaltation.resource.name,
      max: resourceMaximum,
      value: resourceValue(resourceMaximum, spent),
      spent,
      debt: spent,
      debtName: exaltation.resource.debtName,
      roundSpent: spentThisRound,
      roundLimit: ps,
      roundFull: spentThisRound >= ps
    },
    tell: { spent: exaltation.scene.spent, level: tellLevel(exaltation.scene.spent) },
    pressure: pressure === null
      ? null
      : { max: pressure, value: Math.max(0, pressure - exaltation.pressure.spent), spent: exaltation.pressure.spent },
    powers: unlockedPowers(exaltation.powers, ps),
    healing: exaltation.resource.healing
  };
}
