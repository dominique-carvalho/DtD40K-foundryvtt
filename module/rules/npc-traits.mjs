/**
 * NPC traits on the map and in the turn (spec 022): speeds per movement action, darkness, distance with elevation,
 * incorporeal targets, Minion Squad actions, special abilities, alternate forms and falling flyers.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 428–433 (actions, concealment), pp. 520–522 (traits), pp. 543–544 (Minion Squads);
 * specs/022-npc-traits/contracts/rules-api.md.
 */
import { traitValue } from "./npc.mjs";

const has = (traits, key) => (traits ?? []).some((trait) => trait.key === key);

/**
 * Speeds per movement action (research R1/R2). Printed (fixed) speeds already include Quadruped and Crawler.
 * @param {{speed: number, fixed: boolean, traits: {key: string, value: string}[]}} input
 * @returns {{walk: number, fly: number, swim: number}}
 */
export function npcSpeeds({ speed, fixed, traits }) {
  let walk = speed;
  if (!fixed && has(traits, "quadruped")) walk *= 2;
  if (!fixed && has(traits, "crawler")) walk = Math.floor(walk / 2);
  const flyer = traitValue(traits, "flyer");
  const fly = flyer === null ? 0 : flyer > 0 ? flyer : walk * 2;
  const swim = has(traits, "amphibious") ? walk * 2 : 0;
  return { walk, fly, swim };
}

/**
 * Darkness as concealment (p. 433): +5 to the target's defense, unless the attacker has Dark Sight.
 * @param {{darkness: boolean, attackerDarkSight: boolean}} input
 * @returns {number}
 */
export function darknessModifier({ darkness, attackerDarkSight }) {
  return darkness && !attackerDarkSight ? 5 : 0;
}

/**
 * Distance between two tokens with their elevation difference (research R4).
 * @param {{planar: number, elevation: number}} input  metres
 * @returns {number}
 */
export function distance3d({ planar, elevation }) {
  return Math.round(Math.hypot(planar, elevation) * 100) / 100;
}

/**
 * Out-of-range warning: melee beyond reach; ranged beyond the weapon's range (long up to 4×, then beyond).
 * @param {{distance: number, melee: boolean, reach?: number, range?: number}} input
 * @returns {""|"reach"|"long"|"beyond"}
 */
export function outOfRange({ distance, melee, reach = 2, range = 0 }) {
  if (melee) return distance > reach ? "reach" : "";
  if (!range) return "";
  if (distance > range * 4) return "beyond";
  if (distance > range * 2) return "long";
  return "";
}

/**
 * An incorporeal target ignores mundane weapons: magic weapons and Power Fields get through; spells affect it
 * normally (research R6, assumption).
 * @param {{incorporeal: boolean, magic?: boolean, qualities?: string[], spell?: boolean}} input
 * @returns {boolean}  true when the damage is blocked
 */
export function incorporealBlocks({ incorporeal, magic = false, qualities = [], spell = false }) {
  if (!incorporeal || spell || magic) return false;
  return !qualities.includes("powerField");
}

/**
 * Minion Squad actions (research R9): Speed is the Threat Rating; move a half action (TR) or full (2×TR), run 6×TR,
 * attack as a half action.
 * @param {{action: "moveHalf"|"moveFull"|"run"|"attack", threatRating: number}} input
 * @returns {{type: "half"|"full", distance: number}}
 */
export function minionActionCost({ action, threatRating }) {
  if (action === "moveFull") return { type: "full", distance: threatRating * 2 };
  if (action === "run") return { type: "full", distance: threatRating * 6 };
  if (action === "moveHalf") return { type: "half", distance: threatRating };
  return { type: "half", distance: 0 };
}

/**
 * A squad attacks once per turn.
 * @param {{attacksThisTurn: number}} input
 */
export function minionCanAttack({ attacksThisTurn }) {
  return attacksThisTurn < 1;
}

/**
 * Effect of a special ability on one target (research R8): the failure effect on a failed save, nothing otherwise.
 * @param {{save: {success: boolean}, onFail: object}} input
 * @returns {object|null}
 */
export function abilityOutcome({ save, onFail }) {
  if (save?.success) return null;
  return { condition: onFail?.condition ?? "", rounds: onFail?.rounds ?? 0, fatigue: onFail?.fatigue ?? 0, damage: onFail?.damage ?? null };
}

/**
 * Overlay an alternate form on the base values (research R11): changed characteristics, size, derived overrides
 * (null keeps the base), the form's armor (replaces) and traits (added).
 * @param {{base: object, form: object|null}} input
 * @returns {object}
 */
export function applyForm({ base, form }) {
  if (!form) return base;
  const derived = { ...base.derived };
  for (const [key, value] of Object.entries(form.derived ?? {})) if (value !== null && value !== undefined) derived[key] = value;
  return {
    characteristics: { ...base.characteristics, ...(form.characteristics ?? {}) },
    size: form.size ?? base.size,
    derived,
    armor: form.armor?.length ? form.armor : base.armor,
    traits: [...base.traits, ...(form.traits ?? [])]
  };
}

/** Statuses that make a flyer fall (research R5). */
const FALL_STATUSES = ["stunned", "unconscious", "prone"];

/**
 * Whether a token in the air falls when it gets a status.
 * @param {{elevation: number, status: string}} input
 */
export function flyingFall({ elevation, status }) {
  return elevation > 0 && FALL_STATUSES.includes(status);
}
