/**
 * Armor, artifact and cybernetic rules (spec 007, research R3, R11, R12).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 332–333 (armor), pp. 336–340 (cybernetics), pp. 348–351 (artifacts).
 */
import { MATERIALS, RARITIES } from "../config.mjs";

/** Locations the sheet shows; hit locations map onto them (leftArm → arms, …). */
export const ARMOR_LOCATIONS = ["head", "body", "gizzards", "arms", "legs"];

/** Locations covered by a suit or by one piece (the body piece also covers the Gizzards, p. 332). */
const COVERAGE = {
  "": ARMOR_LOCATIONS,
  head: ["head"],
  body: ["body", "gizzards"],
  arms: ["arms"],
  legs: ["legs"]
};

/** Armor types whose penalty disappears with the Armor Proficiency feat (p. 332). */
const LIGHT_TYPES = ["light", "medium"];

/**
 * AP and Max Dex of one armor after craftsmanship and material. A material makes the item Best, and its
 * bonuses replace the craftsmanship ones (p. 348).
 * @param {{ap: number, maxDex: number|null, craftsmanship?: string, material?: string}} armor
 * @returns {{ap: number, maxDex: number|null}}
 */
export function armorValues(armor) {
  const material = armor.material ? MATERIALS[armor.material]?.armor ?? {} : null;
  let ap = armor.ap;
  let maxDex = armor.maxDex ?? null;
  if (material) {
    ap += material.ap ?? 0;
    if (maxDex !== null) maxDex += material.maxDex ?? 0;
  } else if (armor.craftsmanship === "best") {
    ap += 1;
    if (maxDex !== null) maxDex += 1;
  } else if (armor.craftsmanship === "poor" && maxDex !== null) {
    maxDex = Math.max(0, maxDex - 1);
  }
  return { ap, maxDex };
}

/**
 * Armor state of a character from the armors it wears (research R3).
 * Armor never stacks: each location uses the highest AP covering it (p. 332). The Static Defense penalty
 * comes from the worn armor with the highest AP: its AP without the Armor Proficiency of its type; with it,
 * none for Light and Medium and half for the others; Power armor costs 2 more (p. 332). Squat Armor
 * Proficiency (p. 202): none with the feat, half without.
 * @param {object} input
 * @param {{name: string, armorType: string, ap: number, maxDex: number|null, piece: string, suitOnly: boolean,
 *   craftsmanship?: string, material?: string}[]} input.armors  worn armors
 * @param {string[]} [input.proficiencies]  armor types with Armor Proficiency
 * @param {boolean} [input.squat]           has Squat Armor Proficiency
 * @param {{apAll?: number, gizzards?: number, locations?: Record<string, number>}} [input.bonuses]
 *   `apAll`/`gizzards` stack (Hearthstone Bracers, Bionic Heart); `locations` count as armor (bionic limbs)
 * @returns {{locations: Record<string, number>, sdPenalty: number, maxDex: number|null,
 *   sources: {penalty: string, maxDex: string}}}
 */
export function armorProfile({ armors, proficiencies = [], squat = false, bonuses = {} }) {
  const locations = Object.fromEntries(ARMOR_LOCATIONS.map((loc) => [loc, bonuses.locations?.[loc] ?? 0]));
  const sources = { penalty: "", maxDex: "" };
  let heaviest = null;
  let maxDex = null;

  for (const armor of armors) {
    // A piece of power armor does nothing on its own (p. 332).
    if (armor.piece && armor.suitOnly) continue;
    const values = armorValues(armor);
    for (const loc of COVERAGE[armor.piece ?? ""] ?? []) locations[loc] = Math.max(locations[loc], values.ap);
    if (!heaviest || values.ap > heaviest.ap) heaviest = { ...armor, ap: values.ap };
    if (values.maxDex !== null && (maxDex === null || values.maxDex < maxDex)) {
      maxDex = values.maxDex;
      sources.maxDex = armor.name;
    }
  }

  for (const loc of ARMOR_LOCATIONS) locations[loc] += bonuses.apAll ?? 0;
  locations.gizzards += bonuses.gizzards ?? 0;

  let sdPenalty = 0;
  if (heaviest) {
    const proficient = proficiencies.includes(heaviest.armorType);
    if (squat) sdPenalty = proficient ? 0 : Math.floor(heaviest.ap / 2);
    else if (!proficient) sdPenalty = heaviest.ap;
    else sdPenalty = LIGHT_TYPES.includes(heaviest.armorType) ? 0 : Math.floor(heaviest.ap / 2);
    if (heaviest.armorType === "power") sdPenalty += 2;
    if (sdPenalty) sources.penalty = heaviest.name;
  }

  return { locations, sdPenalty, maxDex, sources };
}

/**
 * Artifact rating from the base item rarity (p. 348): Very Common 1 … Very Rare 5; special ammunition and
 * primitive armor one step lower. Rarer items are not covered by the book: capped at 5.
 * @param {string} rarity  key of RARITIES
 * @param {{primitive?: boolean}} [options]
 * @returns {{rating: number, capped: boolean}}
 */
export function artifactRating(rarity, { primitive = false } = {}) {
  const keys = Object.keys(RARITIES);
  const raw = keys.indexOf(rarity) - keys.indexOf("veryCommon") + 1 - (primitive ? 1 : 0);
  if (raw > 5) return { rating: 5, capped: true };
  return { rating: Math.max(1, raw), capped: false };
}

/**
 * At most Constitution mechadendrites (p. 340).
 * @param {{installed: number, con: number}} input
 * @returns {{ok: boolean, max: number}}
 */
export function mechadendriteCheck({ installed, con }) {
  return { ok: installed <= con, max: con };
}
