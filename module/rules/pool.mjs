/**
 * Dice pool construction for Roll & Keep tests.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 10–11 and 416–418 (same rules as the 1.6); docs/analise-dtd.md §2.
 */

/** @typedef {{ rolled: number, kept: number, flat?: number }} Pool */

/**
 * @typedef {object} NormalizedPool
 * @property {number} rolled
 * @property {number} kept
 * @property {number} flat
 * @property {{from: string, to: string, bonus: number} | null} conversion
 */

/** Maximum dice rolled or kept after conversion. */
const MAX_DICE = 10;

/**
 * Format a pool as "XkY", "XkY+Z" or "XkY-Z".
 * @param {Pool} pool
 * @returns {string}
 */
export function formatPool({ rolled, kept, flat = 0 }) {
  const bonus = flat > 0 ? `+${flat}` : flat < 0 ? `${flat}` : "";
  return `${rolled}k${kept}${bonus}`;
}

/** Stunt level awarded by the Story Master: 0 to 3, each worth +1k1 (DtD 7.7a p. 418). */
const MAX_STUNT_DICE = 3;

/**
 * Integer value of a modifier field; blank or non-numeric input counts as 0.
 * @param {unknown} value
 * @returns {number}
 */
function toInt(value) {
  const n = Number(value);
  return value === "" || value === null || !Number.isFinite(n) ? 0 : Math.trunc(n);
}

/**
 * Apply roll-dialog modifiers to a base pool (before normalization).
 * @param {Pool} base
 * @param {{rolled?: number, kept?: number, flat?: number, freeRaises?: number, stuntDice?: number}} [modifiers]
 * @returns {{rolled: number, kept: number, flat: number}}
 */
export function applyModifiers(base, { rolled = 0, kept = 0, flat = 0, freeRaises = 0, stuntDice = 0 } = {}) {
  const stunts = Math.min(Math.max(toInt(stuntDice), 0), MAX_STUNT_DICE);
  return {
    rolled: base.rolled + toInt(rolled) + stunts,
    kept: base.kept + toInt(kept) + stunts,
    flat: (base.flat ?? 0) + toInt(flat) + 5 * toInt(freeRaises)
  };
}

/**
 * Normalize a pool: at least 1k1, kept ≤ rolled, then the "more than ten dice" rule —
 * every 2 rolled dice above 10 become +1 kept (an odd leftover is dropped); once 10k10
 * is reached, each extra rolled or kept die becomes +5.
 * Examples (7.7a p. 416): 12k6 → 10k7; 15k10 → 10k10+25; 11k11 → 10k10+10.
 * @param {Pool} pool
 * @returns {NormalizedPool}
 */
export function normalizePool({ rolled, kept, flat = 0 }) {
  let r = Math.max(1, Math.trunc(rolled));
  let k = Math.min(Math.max(1, Math.trunc(kept)), r);
  let bonus = 0;
  const from = `${r}k${k}`;
  const converts = r > MAX_DICE || k > MAX_DICE;

  if (r > MAX_DICE) {
    let extra = r - MAX_DICE;
    r = MAX_DICE;
    while (extra >= 2 && k < MAX_DICE) {
      k += 1;
      extra -= 2;
    }
    if (k >= MAX_DICE) bonus += 5 * extra;
  }
  if (k > MAX_DICE) {
    bonus += 5 * (k - MAX_DICE);
    k = MAX_DICE;
  }

  return {
    rolled: r,
    kept: k,
    flat: flat + bonus,
    conversion: converts ? { from, to: `${r}k${k}`, bonus } : null
  };
}

/**
 * Apply the characteristic-0 rule: an effective characteristic ≤ 0 counts as one
 * rolled and one kept die, and 10s are worth 0 (FR-016).
 * @param {number} value
 * @returns {{dice: number, zeroCharacteristic: boolean}}
 */
function effectiveCharacteristic(value) {
  return value <= 0 ? { dice: 1, zeroCharacteristic: true } : { dice: value, zeroCharacteristic: false };
}

/**
 * Base pool for a skill test: (skill + characteristic) k characteristic.
 * Untrained basic skills roll the characteristic − 1; untrained advanced skills are blocked.
 * @param {{skill: number, characteristic: number, advanced: boolean}} input
 * @returns {{rolled: number, kept: number, untrained: boolean, zeroCharacteristic: boolean} | {blocked: "advancedUntrained"}}
 */
export function buildSkillPool({ skill, characteristic, advanced }) {
  if (skill <= 0) {
    if (advanced) return { blocked: "advancedUntrained" };
    const char = effectiveCharacteristic(characteristic - 1);
    return { rolled: char.dice, kept: char.dice, untrained: true, zeroCharacteristic: char.zeroCharacteristic };
  }
  const char = effectiveCharacteristic(characteristic);
  return { rolled: skill + char.dice, kept: char.dice, untrained: false, zeroCharacteristic: char.zeroCharacteristic };
}

/**
 * Base pool for a characteristic test: characteristic k characteristic.
 * @param {{characteristic: number}} input
 * @returns {{rolled: number, kept: number, zeroCharacteristic: boolean}}
 */
export function buildCharacteristicPool({ characteristic }) {
  const char = effectiveCharacteristic(characteristic);
  return { rolled: char.dice, kept: char.dice, zeroCharacteristic: char.zeroCharacteristic };
}
