/**
 * Test outcome: success, raises and checks.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 1.6 pp. 8, 236 — each 5 over the TN is a raise, each 5 under is a check.
 */

/**
 * @param {number} total
 * @param {number|string|null|undefined} tn
 * @returns {{success: boolean, raises: number, checks: number} | null}  null when there is no TN
 */
export function evaluateOutcome(total, tn) {
  if (tn === null || tn === undefined || tn === "") return null;
  const target = Number(tn);
  if (!Number.isFinite(target)) return null;
  const success = total >= target;
  return {
    success,
    raises: success ? Math.floor((total - target) / 5) : 0,
    checks: success ? 0 : Math.floor((target - total) / 5)
  };
}
