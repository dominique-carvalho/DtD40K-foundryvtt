/**
 * Racial rules: bonus choices and the Active Effect changes they produce.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 30–63; specs/002-race-compendium/data-model.md.
 */
import { CHARACTERISTICS, MAX_RATING, SKILLS } from "../config.mjs";

/** Active Effect change modes, same values as CONST.ACTIVE_EFFECT_MODES in Foundry v13. */
export const ADD = 2;
export const OVERRIDE = 5;

/**
 * @typedef {object} RaceSystem
 * @property {{options: string[], any: boolean}} characteristicBonus
 * @property {{skills: string[], choose: number}} skillBonus
 * @property {number} size
 * @property {{automation: string}} power
 */

/** @typedef {{characteristic: string, skills: string[]}} RaceChoice */

/**
 * @typedef {object} RacialEffectData
 * @property {string} racial   "size" | "characteristic" | "skill.<key>" | "power"
 * @property {{key: string, mode: number, value: string}[]} changes
 * @property {{type: string, key?: string}} label  used by the adapter to build the i18n name
 */

/**
 * Characteristics the player may pick for the +1 bonus.
 * @param {RaceSystem} race
 * @returns {string[]}
 */
export function characteristicOptions(race) {
  return race.characteristicBonus.any ? Object.keys(CHARACTERISTICS) : [...race.characteristicBonus.options];
}

/**
 * Whether applying the race needs a choice from the player.
 * @param {RaceSystem} race
 * @returns {boolean}
 */
export function needsChoice(race) {
  return characteristicOptions(race).length > 1 || race.skillBonus.choose > 0;
}

/**
 * Choice used when nothing has to be asked (or as the dialog's initial state).
 * @param {RaceSystem} race
 * @returns {RaceChoice}
 */
export function defaultChoice(race) {
  return { characteristic: characteristicOptions(race)[0] ?? "", skills: [] };
}

/**
 * Validate a racial choice (spec 002, FR-009).
 * @param {RaceSystem} race
 * @param {RaceChoice} choice
 * @returns {{valid: true} | {valid: false, error: "characteristic"|"skillCount"|"skillDuplicate"|"skillUnknown"}}
 */
export function validateRaceChoice(race, choice) {
  if (!characteristicOptions(race).includes(choice.characteristic)) return { valid: false, error: "characteristic" };
  const skills = choice.skills ?? [];
  if (skills.length !== race.skillBonus.choose) return { valid: false, error: "skillCount" };
  if (skills.some((key) => !(key in SKILLS))) return { valid: false, error: "skillUnknown" };
  const all = [...race.skillBonus.skills, ...skills];
  if (new Set(all).size !== all.length) return { valid: false, error: "skillDuplicate" };
  return { valid: true };
}

/**
 * Change applied by the racial power, if it is automated (FR-016, research R4).
 * @param {string} automation
 * @returns {{key: string, mode: number, value: string} | null}
 */
function powerChange(automation) {
  switch (automation) {
    case "heroicHeritage": return { key: "system.heroPoints.max", mode: ADD, value: "1" };
    case "shifty": return { key: "system.modifiers.staticDefenseFormula", mode: OVERRIDE, value: "shifty" };
    case "squatToughness": return { key: "system.modifiers.resilience", mode: ADD, value: "1" };
    default: return null;
  }
}

/**
 * Racial Active Effects, one per modifier so the GM can disable each one (FR-010).
 * @param {RaceSystem} race
 * @param {RaceChoice} choice
 * @returns {RacialEffectData[]}
 */
export function buildRaceEffects(race, choice) {
  const check = validateRaceChoice(race, choice);
  if (!check.valid) throw new Error(`Invalid racial choice: ${check.error}`);

  const effects = [
    {
      racial: "size",
      changes: [{ key: "system.size", mode: OVERRIDE, value: String(race.size) }],
      label: { type: "size" }
    },
    {
      racial: "characteristic",
      changes: [{ key: `system.characteristics.${choice.characteristic}.value`, mode: ADD, value: "1" }],
      label: { type: "characteristic", key: choice.characteristic }
    },
    ...[...race.skillBonus.skills, ...choice.skills].map((key) => ({
      racial: `skill.${key}`,
      changes: [{ key: `system.skills.${key}.value`, mode: ADD, value: "1" }],
      label: { type: "skill", key }
    }))
  ];

  const change = powerChange(race.power.automation);
  if (change) effects.push({ racial: "power", changes: [change], label: { type: "power" } });
  return effects;
}

/**
 * Cap a rating at the system maximum (FR-015).
 * @param {number} value
 * @param {number} [max=MAX_RATING]
 * @returns {{value: number, capped: boolean}}
 */
export function capValue(value, max = MAX_RATING) {
  return value > max ? { value: max, capped: true } : { value, capped: false };
}

/**
 * Uses per scene of a limited racial power: 1/2/3 at Level 1/3/5
 * (in the 7.7a only the Eldarin's Warp Step, p. 39).
 * @param {number} level
 * @returns {1|2|3}
 */
export function usesPerScene(level) {
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  return 1;
}

/**
 * Uses left this scene (research R5: the item stores uses spent, not uses left).
 * @param {number} level
 * @param {number} spent
 * @returns {number}
 */
export function remainingUses(level, spent) {
  return Math.max(0, usesPerScene(level) - spent);
}
