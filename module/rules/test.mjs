/**
 * Orchestration of a complete Roll & Keep test.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 */
import { rollAndKeep } from "./dice.mjs";
import { applyModifiers, normalizePool } from "./pool.mjs";
import { evaluateOutcome } from "./results.mjs";

/**
 * @typedef {object} TestResult
 * @property {import("./pool.mjs").NormalizedPool} pool
 * @property {import("./dice.mjs").DieResult[]} dice
 * @property {number} keptSum
 * @property {number} total
 * @property {number|null} tn
 * @property {{success: boolean, raises: number, checks: number} | null} outcome
 * @property {{zeroCharacteristic: boolean, specialty: boolean, untrained: boolean}} flags
 */

/**
 * Run a test: modifiers → normalization → roll → outcome.
 * @param {object} input
 * @param {{rolled: number, kept: number, flat?: number, untrained?: boolean, zeroCharacteristic?: boolean}} input.base
 * @param {{rolled?: number, kept?: number, flat?: number, freeRaises?: number, stuntDice?: number}} [input.modifiers]
 * @param {number|string|null} [input.tn]
 * @param {boolean} [input.specialty=false]  reroll 1s once
 * @param {() => number} input.rng
 * @returns {TestResult}
 */
export function runTest({ base, modifiers = {}, tn = null, specialty = false, rng }) {
  const pool = normalizePool(applyModifiers(base, modifiers));
  const zeroCharacteristic = Boolean(base.zeroCharacteristic);
  const { dice, keptSum, total } = rollAndKeep(pool, { rng, rerollOnes: specialty, zeroCharacteristic });
  const target = tn === "" || tn === null || tn === undefined ? null : Number(tn);
  return {
    pool,
    dice,
    keptSum,
    total,
    tn: target,
    outcome: evaluateOutcome(total, target),
    flags: { zeroCharacteristic, specialty: Boolean(specialty), untrained: Boolean(base.untrained) }
  };
}
