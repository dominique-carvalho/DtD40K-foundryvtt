/**
 * Acquisition: Wealth Test TN, Wealth Strain and starting equipment (spec 007, research R9).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 314–317 (availability, Wealth Strain, Liquid Wealth, craftsmanship), p. 16 (starting
 * equipment), p. 332 (a single armor piece is one rarity step cheaper).
 */
import { CRAFTSMANSHIP, RARITIES, STARTING_SLOTS, WEALTH_STRAIN } from "../config.mjs";

const KEYS = Object.keys(RARITIES);

/** Craftsmanship as rarity steps: each 5 points of TN is one step. */
const CRAFT_STEPS = Object.fromEntries(Object.entries(CRAFTSMANSHIP).map(([key, tn]) => [key, tn / 5]));

/**
 * Move along the rarity ladder, clamped to its ends.
 * @param {string} key
 * @param {number} delta
 * @returns {string}
 */
export function rarityStep(key, delta) {
  const index = Math.min(KEYS.length - 1, Math.max(0, KEYS.indexOf(key) + delta));
  return KEYS[index];
}

/**
 * TN of the Wealth Test (pp. 315–317): rarity (one step lower for an armor piece), craftsmanship
 * (Poor −5, Good +5, Best +10) and +5 for every earlier try at the same item.
 * @param {{rarity: string, piece?: boolean, craftsmanship?: string, attempts?: number}} input
 * @returns {{tn: number, rarity: string, time: string}}
 */
export function acquisitionTn({ rarity, piece = false, craftsmanship = "common", attempts = 0 }) {
  const key = piece ? rarityStep(rarity, -1) : rarity;
  const tn = Math.max(0, RARITIES[key].tn + (CRAFTSMANSHIP[craftsmanship] ?? 0) + 5 * Math.max(0, attempts));
  return { tn, rarity: key, time: RARITIES[key].time };
}

/**
 * Wealth Strain (p. 316): when the TN is more than Wealth × 5, roll 1d10 + 1 for every 5 above it; each raise
 * lowers the penalty by one level. Penalties: none, −1, −3, −5 Wealth until the end of the next session.
 * @param {{tn: number, wealth: number, raises?: number, d10: number}} input
 * @returns {{strained: boolean, roll: number, penalty: number}}
 */
export function strainRoll({ tn, wealth, raises = 0, d10 }) {
  const limit = wealth * 5;
  if (tn <= limit) return { strained: false, roll: 0, penalty: 0 };
  const roll = d10 + Math.floor((tn - limit) / 5);
  // Bands from mildest to worst; the level is the last band the roll reaches.
  const bands = [...WEALTH_STRAIN].sort((a, b) => a.min - b.min);
  const level = bands.filter((band) => roll >= band.min).length - 1;
  return { strained: true, roll, penalty: bands[Math.max(0, level - Math.max(0, raises))].penalty };
}

/**
 * Starting equipment pick an item counts as (p. 16), by its rarity adjusted by craftsmanship; null when it
 * fits none of the picks.
 * @param {string} rarity
 * @param {string} [craftsmanship]
 * @returns {string|null}
 */
export function startingSlotFor(rarity, craftsmanship = "common") {
  const key = rarityStep(rarity, CRAFT_STEPS[craftsmanship] ?? 0);
  return key in STARTING_SLOTS ? key : null;
}

/**
 * Starting picks used and available.
 * @param {{system: {startingSlot: string}}[]} items
 * @returns {Record<string, {used: number, max: number}>}
 */
export function startingSlots(items) {
  const slots = Object.fromEntries(Object.entries(STARTING_SLOTS).map(([key, max]) => [key, { used: 0, max }]));
  for (const item of items) {
    const key = item.system?.startingSlot;
    if (key && slots[key]) slots[key].used += 1;
  }
  return slots;
}

/**
 * Wealth after the Strain penalty, never below 0.
 * @param {{value: number, strain: number}} wealth
 */
export function effectiveWealth({ value, strain }) {
  return Math.max(0, value - strain);
}
