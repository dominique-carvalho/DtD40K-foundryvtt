/**
 * What a character may still do this turn (spec 008, research R5).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a p. 421 and p. 424: one Full Action or two different Half Actions, each Free Action once per
 * round, one Reaction per round (more from some actions).
 */

/**
 * @typedef {object} TurnState
 * @property {number} round
 * @property {boolean} full        a Full Action was taken
 * @property {string[]} halves     Half Actions taken (keys)
 * @property {string[]} free       Free Actions taken (keys)
 * @property {number} reactions    Reactions used this round
 */

/** Empty state for a round. */
export const emptyTurn = (round = 0) => ({ round, full: false, halves: [], free: [], reactions: 0 });

/**
 * State for the given round: a new round starts empty.
 * @param {TurnState|undefined} state
 * @param {number} round
 * @returns {TurnState}
 */
export function resetForRound(state, round) {
  if (!state || state.round !== round) return emptyTurn(round);
  return { ...emptyTurn(round), ...state, halves: [...(state.halves ?? [])], free: [...(state.free ?? [])] };
}

/** "Varies" actions (Reload, Use a Skill, Focus Power) count as a Half Action unless told otherwise. */
const typeOf = (action, as) => (action.type === "varies" ? as ?? "half" : as ?? action.type);

/**
 * Can the action be taken?
 * @param {TurnState} state
 * @param {{key: string, type: string}} action
 * @param {{reactionsMax: number, as?: "half"|"full"}} options  `as`: the chosen length of a Half-or-Full action
 * @returns {{ok: boolean, reason: ""|"fullUsed"|"halfRepeated"|"noHalfLeft"|"freeRepeated"|"noReaction"}}
 */
export function canUse(state, action, { reactionsMax, as } = {}) {
  const type = typeOf(action, as);
  const no = (reason) => ({ ok: false, reason });
  if (type === "reaction") return state.reactions < reactionsMax ? { ok: true, reason: "" } : no("noReaction");
  if (type === "free") return state.free.includes(action.key) ? no("freeRepeated") : { ok: true, reason: "" };
  if (state.full) return no("fullUsed");
  if (type === "full") return state.halves.length ? no("noHalfLeft") : { ok: true, reason: "" };
  if (state.halves.includes(action.key)) return no("halfRepeated");
  if (state.halves.length >= 2) return no("noHalfLeft");
  return { ok: true, reason: "" };
}

/**
 * Whether a Half Action held by Delay pays for this action (spec 017, p. 426): only outside the character's own turn,
 * and only for a Half Action; it may repeat one already taken this turn.
 * @param {{delay: object|null|undefined, ownTurn: boolean, action: {key: string, type: string}, as?: "half"|"full"}} input
 * @returns {boolean}
 */
export function usesDelay({ delay, ownTurn, action, as }) {
  return Boolean(delay) && !ownTurn && typeOf(action, as) === "half";
}

/**
 * Record the action.
 * @param {TurnState} state
 * @param {{key: string, type: string}} action
 * @param {{as?: "half"|"full"}} [options]
 * @returns {TurnState}
 */
export function spend(state, action, { as } = {}) {
  const type = typeOf(action, as);
  const next = { ...state, halves: [...state.halves], free: [...state.free] };
  if (type === "reaction") next.reactions += 1;
  else if (type === "free") next.free.push(action.key);
  else if (type === "full") next.full = true;
  else next.halves.push(action.key);
  return next;
}
