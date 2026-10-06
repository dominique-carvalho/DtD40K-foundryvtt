/**
 * Backgrounds: dots spent at creation, their XP, what may be raised and the Inheritance picks (spec 011, research
 * R2/R3).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 15–16 (creation), pp. 280–283 (Backgrounds); specs/011-backgrounds-alignment/contracts/rules-api.md.
 */
import { BACKGROUND_XP, INHERITANCE_SLOTS } from "../config.mjs";

export { BACKGROUND_TEXT } from "./background-text.mjs";

/** Backgrounds stored as a single rating (Wealth lives in system.wealth, spec 007). */
export const SINGLE_BACKGROUNDS = ["allies", "contacts", "fame", "followers", "holdings", "inheritance", "mentor", "status"];

/**
 * Dots counted against the 7 free creation dots: every dot up to 3 of each Background and each instance.
 * @param {{backgrounds: object, wealth: number}} input
 * @returns {number}
 */
export function creationDots({ backgrounds, wealth }) {
  const low = (value) => Math.min(value ?? 0, BACKGROUND_XP.freeMax);
  let dots = low(wealth);
  for (const key of SINGLE_BACKGROUNDS) dots += low(backgrounds[key]?.value);
  for (const instance of [...(backgrounds.artifacts ?? []), ...(backgrounds.backings ?? [])]) dots += low(instance.value);
  return dots;
}

/**
 * XP of raising a Background to `to` (pp. 15–16): free up to 3 while the 7 dots last; then 50 per dot 1–3 and
 * 100 per dot 4–5.
 * @param {{to: number, dotsUsed: number}} input
 */
export function backgroundCost({ to, dotsUsed }) {
  if (to > BACKGROUND_XP.freeMax) return BACKGROUND_XP.high;
  return dotsUsed < BACKGROUND_XP.freeDots ? 0 : BACKGROUND_XP.low;
}

/**
 * Whether a Background may be raised: only during creation (the GM may adjust at any time), up to 5, and at most
 * 5 dots of Artifacts at creation (p. 281).
 * @param {{creation: boolean, isGM: boolean, to: number, artifactTotal: number}} input
 * @returns {{allowed: boolean, reason: ""|"notCreation"|"atMax"|"artifactCap"}}
 */
export function canRaise({ creation, isGM, to, artifactTotal }) {
  if (to > 5) return { allowed: false, reason: "atMax" };
  if (!creation && !isGM) return { allowed: false, reason: "notCreation" };
  if (creation && artifactTotal > BACKGROUND_XP.artifactCreationMax) return { allowed: false, reason: "artifactCap" };
  return { allowed: true, reason: "" };
}

/**
 * Whether Inheritance picks fit the rating (p. 282). A rank-1 choice fills one slot (1 Uncommon, 2 Common, 4 Very
 * Common or 8 Ubiquitous, never mixed); each rank doubles the slots. Rarer items fill power-of-two blocks, so the
 * picks fit when the blocks, with each rank-1 kind rounded up to whole slots, add up to at most 2^(rating − 1).
 * @param {number} level  Inheritance rating
 * @param {Record<string, number>} picks  count by rarity
 * @returns {boolean}
 */
export function inheritanceFits(level, picks) {
  const used = inheritanceUsed(picks);
  if (Number.isNaN(used)) return false;
  if (!used) return true;
  return level > 0 && used <= 2 ** (level - 1);
}

/**
 * Rank-1 slots the Inheritance picks fill (each rank-1 kind rounded up to whole slots); NaN for an unknown rarity.
 * @param {Record<string, number>} picks  count by rarity
 * @returns {number}
 */
export function inheritanceUsed(picks) {
  let used = 0;
  for (const [key, count] of Object.entries(picks)) {
    if (!count) continue;
    const size = INHERITANCE_SLOTS[key];
    if (size === undefined) return NaN;
    used += size < 1 ? Math.ceil(count * size) : count * size;
  }
  return used;
}
