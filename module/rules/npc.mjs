/**
 * Creature traits of NPCs: the automated parts (natural armor, Aura, Regeneration, Fear, immunities, Amorphous,
 * Mindless) read from the trait list of the stat block (spec 012, research R3).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 520–522; specs/012-npcs-minions/contracts/rules-api.md.
 */

export { TRAIT_TEXT } from "./trait-text.mjs";

/**
 * Rating of a trait: its number, 0 for a trait without one, null when the creature does not have it.
 * @param {{key: string, value: string}[]} traits
 * @param {string} key
 * @returns {number|null}
 */
export function traitValue(traits, key) {
  const trait = traits.find((t) => t.key === key);
  if (!trait) return null;
  const n = Number.parseInt(trait.value, 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Natural armor on every location: Armor Plating (X), Machine (X) and Daemonic (armor = Constitution, stacking).
 * @param {{key: string, value: string}[]} traits
 * @param {number} con
 */
export function traitArmor(traits, con) {
  return (traitValue(traits, "armorPlating") ?? 0) + (traitValue(traits, "machine") ?? 0)
    + (traitValue(traits, "daemonic") === null ? 0 : Math.max(0, con));
}

/** Aura (X) against magical damage. */
export const traitAura = (traits) => traitValue(traits, "aura") ?? 0;

/** Hit points regained at the start of each turn. */
export const regeneration = (traits) => traitValue(traits, "regeneration") ?? 0;

/** Fear rating (0 = none). */
export const fearRating = (traits) => traitValue(traits, "fear") ?? 0;

/**
 * Conditions the creature ignores: Undead and Stuff of Nightmares never bleed and are not stunned (p. 522).
 * @param {{key: string}[]} traits
 * @returns {string[]} status ids
 */
export function immunities(traits) {
  return traits.some((t) => t.key === "undead" || t.key === "stuffOfNightmares") ? ["stunned", "bloodLoss"] : [];
}

/** Every hit on an Amorphous creature goes to the body (p. 520). */
export const isAmorphous = (traits) => traits.some((t) => t.key === "amorphous");

/** Mindless creatures are immune to social attacks (p. 521). */
export const isMindless = (traits) => traits.some((t) => t.key === "mindless");
