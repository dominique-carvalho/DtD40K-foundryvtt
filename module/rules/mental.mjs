/**
 * Fear and Insanity (spec 008, research R9).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 448–452.
 */
import { FEAR_TN } from "../config.mjs";

/**
 * Willpower TN of a Fear rating 1–5.
 * @param {number} rating
 */
export function fearTn(rating) {
  return FEAR_TN[Math.min(5, Math.max(1, Math.trunc(rating)))];
}

/**
 * Shock Table roll: 1d10 + 1 per Check of the failed Fear Test (p. 448).
 * @param {{d10: number, checks: number}} input
 */
export function shockRoll({ d10, checks }) {
  return d10 + Math.max(0, checks);
}

/**
 * Trauma Test TN (p. 451): Willpower TN 10 + 1 per 5 Insanity points.
 * @param {number} insanity
 */
export function traumaTn(insanity) {
  return 10 + Math.floor(Math.max(0, insanity) / 5);
}

/**
 * Thresholds crossed when Insanity goes up (pp. 450–451): a Trauma Test every 10 points, a new or worse
 * derangement every 20, removal from play at 100.
 * @param {number} before
 * @param {number} after
 * @returns {{traumaTests: number, derangements: number, removed: boolean}}
 */
export function insanityThresholds(before, after) {
  const count = (step) => Math.max(0, Math.floor(after / step) - Math.floor(before / step));
  return { traumaTests: count(10), derangements: count(20), removed: before < 100 && after >= 100 };
}
