/**
 * Hazards and encounter XP (spec 018): falling, suffocation, forced march, the sources that make a character immune
 * and the Encounter Difficulty table.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 434, 443–445, 514–515; specs/018-hazards-xp/contracts/rules-api.md.
 */
import {
  BREATH_ITEMS, BREATHLESS_EXALTATIONS, BREATHLESS_TRAITS, ENCOUNTER_XP, FATIGUE_IMMUNE_EXALTATIONS, FALL, SESSION_XP
} from "../config.mjs";

const STEPS = ["short", "long", "fatal"];

/**
 * Category of a fall after Catfall (p. 181): one step lower; a short fall does no harm.
 * @param {{category: "short"|"long"|"fatal", catfall: boolean}} input
 * @returns {"short"|"long"|"fatal"|null}
 */
export function fallCategory({ category, catfall }) {
  if (!catfall) return category;
  return STEPS[STEPS.indexOf(category) - 1] ?? null;
}

/**
 * Wounds of a fall (p. 434): short 1, long 1d10, fatal 1d5 plus 1d5 Critical Damage.
 * @param {{category: string, d10: number, d5a: number, d5b: number}} input
 * @returns {{wounds: number, extraCritical: number}}
 */
export function fallWounds({ category, d10, d5a, d5b }) {
  if (category === "fatal") return { wounds: d5a, extraCritical: d5b };
  return { wounds: category === "long" ? d10 : FALL.short, extraCritical: 0 };
}

/**
 * Wounds an Acrobatics Test at TN 15 takes off an intentional fall: 1, plus 1 per raise; never a fatal one.
 * @param {{category: string, intentional: boolean, success: boolean, raises: number}} input
 */
export function fallReduction({ category, intentional, success, raises }) {
  if (!intentional || category === "fatal" || !success) return 0;
  return 1 + raises;
}

/**
 * How long a character holds the breath (p. 444): Constitution minutes when saving air, twice that in rounds when busy.
 * @param {{con: number, mode: "conserve"|"strenuous"}} input
 */
export const breathLimit = ({ con, mode }) => (mode === "strenuous" ? 2 * con : con);

/**
 * One interval of suffocation (1-based): a Constitution Test while the breath lasts; the next one knocks out; after that
 * 1 HP per interval.
 * @param {{step: number, limit: number}} input
 * @returns {{test: boolean, unconscious: boolean, hpLoss: 0|1}}
 */
export function suffocationStep({ step, limit }) {
  if (step <= limit) return { test: true, unconscious: false, hpLoss: 0 };
  if (step === limit + 1) return { test: false, unconscious: true, hpLoss: 0 };
  return { test: false, unconscious: false, hpLoss: 1 };
}

/** TN of the forced march in the given hour (p. 445): 10, and 5 more for each hour after the first. */
export const marchTn = (hour) => 10 + 5 * (hour - 1);

/** Distance of a forced march (p. 445): twice the Speed in km per hour. */
export const marchDistance = ({ speed, hours }) => 2 * speed * hours;

/**
 * Who is spared (research R6): no breathing (exaltations, NPC traits, breathing gear; Amphibious only under water)
 * and no Fatigue (Promethean).
 * @param {{exaltation: string, traits: string[], equipped: string[], underwater?: boolean}} input
 * @returns {{breath: boolean, fatigue: boolean}}
 */
export function hazardImmunity({ exaltation, traits, equipped, underwater = false }) {
  const breath = BREATHLESS_EXALTATIONS.includes(exaltation)
    || traits.some((key) => BREATHLESS_TRAITS.includes(key))
    || equipped.some((name) => BREATH_ITEMS.includes(name))
    || (underwater && traits.includes("amphibious"));
  return { breath, fatigue: FATIGUE_IMMUNE_EXALTATIONS.includes(exaltation) };
}

/**
 * XP award (pp. 514–515): the Encounter Difficulty table, or the session award.
 * @param {"encounter"|"session"} kind
 * @param {string} [difficulty]
 */
export const encounterXp = (kind, difficulty) => (kind === "session" ? SESSION_XP : ENCOUNTER_XP[difficulty] ?? 0);
