/**
 * Social combat (spec 008, research R9).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 446–447.
 */
import { RESOLVE_DRAIN_LIMIT } from "../config.mjs";

/** Skills of a social attack (p. 446). */
export const SOCIAL_SKILLS = ["charm", "command", "deceive", "intimidation", "performer", "persuasion"];

/**
 * Can a defeated target still spend Resolve this scene? After 4 it is Jaded (p. 446).
 * @param {{drained: number, resolve: number, limit?: number}} input
 * @returns {{canSpend: boolean, jaded: boolean}}
 */
export function socialOutcome({ drained, resolve, limit = RESOLVE_DRAIN_LIMIT }) {
  const jaded = drained >= limit;
  return { canSpend: !jaded && resolve > 0, jaded };
}

/**
 * Refute (p. 447): half the total is added to Mental Defense against that social attack.
 * @param {number} total
 */
export function refuteBonus(total) {
  return Math.floor(Math.max(0, total) / 2);
}

/**
 * Morning Resolve recovery (p. 447): Composure TN 10, 1 plus 1 per raise.
 * @param {{success: boolean, raises: number}} outcome
 */
export function resolveRecovery({ success, raises }) {
  return success ? 1 + Math.max(0, raises) : 0;
}
