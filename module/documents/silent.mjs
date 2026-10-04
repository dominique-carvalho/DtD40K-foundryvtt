/**
 * Silent mode of the services (spec 023, research R2): while the character builder applies its plan, the
 * confirmations of costs and warnings, and the GM overrides of refusals, answer yes by themselves — the builder has
 * already validated every step (or the GM released it). Outside the builder nothing changes.
 */

let depth = 0;

/** Whether the services run without asking. */
export const isSilent = () => depth > 0;

/**
 * Run `fn` in silent mode.
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function silently(fn) {
  depth += 1;
  try {
    return await fn();
  } finally {
    depth -= 1;
  }
}
