/**
 * Critical effects (spec 008, research R2).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a p. 437 (Critical Damage), pp. 438–441 (tables by damage type and location), p. 443 (fire).
 */
import { CRITICAL_LOCATIONS, DAMAGE_TABLE_TYPES } from "../config.mjs";

/**
 * Table of a critical: damage type and location; fire without a location uses Energy/Body (p. 443).
 * @param {string} type      damage letter E, X, I, R (or "fire")
 * @param {string} [location] hit location
 * @returns {{type: string, location: string}}
 */
export function criticalTableKey(type, location) {
  if (type === "fire") return { type: "energy", location: CRITICAL_LOCATIONS[location] ?? "body" };
  return { type: DAMAGE_TABLE_TYPES[type] ?? "impact", location: CRITICAL_LOCATIONS[location] ?? "body" };
}

/**
 * What a critical result does, from its `flags.dtd40k.effect`.
 * @param {{statuses?: string[], rounds?: string|number, fatigue?: string|number, test?: {characteristic: string,
 *   tn: number, onFail: string}, dead?: boolean, halfAction?: boolean, insanity?: string|number}} [effect]
 * @returns {{statuses: string[], rounds: string|number|null, fatigue: string|number|null, tests: object[],
 *   dead: boolean, halfAction: boolean, insanity: string|number|null}}
 */
export function criticalPlan(effect = {}) {
  return {
    statuses: [...(effect.statuses ?? [])],
    rounds: effect.rounds ?? null,
    fatigue: effect.fatigue ?? null,
    tests: effect.test ? [effect.test] : [],
    dead: Boolean(effect.dead),
    halfAction: Boolean(effect.halfAction),
    insanity: effect.insanity ?? null
  };
}
