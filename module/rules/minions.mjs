/**
 * Minion Squads: derived values, attack pool, damage, casualties and the bonus of minions teamed with a hero
 * (spec 012, research R5).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 543–544; specs/012-npcs-minions/contracts/rules-api.md.
 */
import { MINION } from "../config.mjs";

/**
 * Static Defense 5 × Threat Rating, Speed = Threat Rating, ranged range 10 × Threat Rating.
 * @param {{threatRating: number}} squad
 */
export function squadDerived({ threatRating }) {
  return { staticDefense: MINION.sdPerThreat * threatRating, speed: threatRating, range: MINION.rangePerThreat * threatRating };
}

/**
 * Attack pool: one die per attacking minion (no more than the squad has), keeping the Threat Rating, never more
 * than rolled.
 * @param {{count: number, attacking: number, threatRating: number}} input
 * @returns {{rolled: number, kept: number}}
 */
export function squadPool({ count, attacking, threatRating }) {
  const rolled = Math.max(0, Math.min(count, attacking));
  return { rolled, kept: Math.min(threatRating, rolled) };
}

/**
 * Damage of a hit: 5 per Damage Rating plus 5 per raise, no damage roll.
 * @param {{rating: number, raises: number}} input
 */
export function minionDamage({ rating, raises }) {
  return MINION.damagePerRating * (rating + Math.max(0, raises));
}

/**
 * Minions removed by a hit: one plus one per raise; a Blast weapon removes its Blast rating.
 * @param {{raises: number, blast: number}} input
 */
export function casualties({ raises, blast }) {
  return blast > 0 ? blast : 1 + Math.max(0, raises);
}

/**
 * Bonus of minions teamed with a hero on every skill roll: the highest Threat Rating plus one per minion beyond the
 * first, counting at most Fellowship minions (the strongest first).
 * @param {{threatRating: number, count: number}[]} squads
 * @param {number} fellowship
 */
export function allyBonus(squads, fellowship) {
  const minions = squads.flatMap((s) => Array(Math.max(0, s.count)).fill(s.threatRating)).sort((a, b) => b - a)
    .slice(0, Math.max(0, fellowship));
  if (!minions.length) return 0;
  return minions[0] + (minions.length - 1);
}
