/**
 * Combat maneuvers (spec 017): opposed tests, the 45° kill zone of Suppressing Fire and Overwatch, Pinning and the
 * Grapple, and what Pinned and grappling characters may still do.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 426–430, 443–444; specs/017-combat-actions/contracts/rules-api.md.
 */

/**
 * Opposed test (research R1): the highest total wins, the defender on a tie; one raise per 5 points of difference.
 * @param {number} a  total of the one who acts
 * @param {number} b  total of the one who resists
 * @returns {{winner: "a"|"b", raises: number}}
 */
export function opposedResult(a, b) {
  return a > b ? { winner: "a", raises: Math.floor((a - b) / 5) } : { winner: "b", raises: Math.floor((b - a) / 5) };
}

/**
 * Whether a point lies in a cone (research R2), measured as the Foundry cone template: within the distance and at most
 * half the angle away from the direction (degrees, 0 = east, clockwise on the canvas).
 * @param {{origin: {x: number, y: number}, direction: number, angle: number, distance: number, point: {x: number, y: number}}} cone
 * @returns {boolean}
 */
export function inCone({ origin, direction, angle, distance, point }) {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const length = Math.hypot(dx, dy);
  if (length > distance) return false;
  if (length === 0) return true;
  const bearing = (Math.atan2(dy, dx) * 180) / Math.PI;
  const offset = ((((bearing - direction) % 360) + 540) % 360) - 180;
  return Math.abs(offset) <= angle / 2;
}

/**
 * Targets of the burst of Suppressing Fire (p. 430): uncovered, with a Static Defense below the total, at most as many
 * as the full-auto rate of fire, drawn at random when more qualify.
 * @param {{total: number, targets: {id: string, sd: number, covered: boolean}[], rof: number, rng?: () => number}} input
 * @returns {string[]}
 */
export function suppressionHits({ total, targets, rof, rng = Math.random }) {
  const pool = targets.filter((t) => !t.covered && t.sd < total).map((t) => t.id);
  if (pool.length <= rof) return pool;
  const hits = [];
  while (hits.length < rof) hits.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return hits;
}

/**
 * TN of a Pinning Test (pp. 443–444): 20; escaping at the end of the turn is 10 once no longer under fire.
 * @param {{escape?: boolean, underFire?: boolean}} input
 */
export const pinningTn = ({ escape = false, underFire = true } = {}) => (escape && !underFire ? 10 : 20);

/** Feats that make a character immune to Pinning (Fearless p. 185, Headstrong p. 187). */
export const pinningImmune = (featNames) => featNames.some((name) => name === "Fearless" || name === "Headstrong");

/**
 * Push Opponent of the Grapple (p. 427): 2 m plus 2 m per raise, no further than the controller's Speed.
 * @param {{raises: number, speed: number}} input
 */
export const pushDistance = ({ raises, speed }) => Math.min(2 + 2 * raises, speed);

/** Slip Free (p. 427): Dexterity TN 20, 25 against Bear Hug (p. 181). */
export const slipFreeTn = ({ bearHug }) => (bearHug ? 25 : 20);

/** Full Actions the grappled character may still take (p. 427). */
const GRAPPLED_ACTIONS = ["breakFree", "slipFree", "takeControl"];
/** The controller spends his turns on the grapple. */
const GRAPPLING_ACTIONS = ["grappleControl"];

/**
 * What a Pinned or grappling character may do (FR-005, FR-009): free actions and reactions always; the grappled only
 * the escape actions; the controller only the grapple; Pinned no Full Actions.
 * @param {{statuses: Set<string>|string[], action: {key: string, type: string}, as?: string}} input
 * @returns {{allowed: boolean, reason: ""|"grappled"|"grappling"|"pinnedFull"}}
 */
export function restriction({ statuses, action, as }) {
  const has = (id) => (statuses instanceof Set ? statuses.has(id) : statuses.includes(id));
  const ok = { allowed: true, reason: "" };
  if (action.type === "free" || action.type === "reaction") return ok;
  if (has("grappled") && !GRAPPLED_ACTIONS.includes(action.key)) return { allowed: false, reason: "grappled" };
  if (has("grappling") && !GRAPPLING_ACTIONS.includes(action.key)) return { allowed: false, reason: "grappling" };
  const full = action.type === "full" || as === "full";
  if (has("pinned") && full) return { allowed: false, reason: "pinnedFull" };
  return ok;
}
