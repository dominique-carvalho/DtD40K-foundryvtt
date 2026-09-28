/**
 * Attack and damage pools of a weapon (spec 007, research R5).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 318–321 (profiles, craftsmanship, qualities), pp. 425–435 (Aim, Full Auto, Brace,
 * attack test, damage, jams), p. 432 (unarmed combat).
 */
import { HIT_LOCATIONS, MATERIALS } from "../config.mjs";

/**
 * @typedef {object} WeaponProfile
 * @property {string} weaponType      melee|thrown|pistol|basic|heavy
 * @property {boolean} [thrown]       melee weapon that may be thrown
 * @property {string[]} proficiencies
 * @property {{rolled: number, kept: number, type: string}} damage
 * @property {number} pen
 * @property {{single: boolean, auto: number}} [rof]
 * @property {{key: string, value: number|null}[]} qualities
 * @property {string} [craftsmanship]
 * @property {string} [material]
 */

/** The default unarmed attack: Brawl, 0k1 Impact plus Strength (p. 432). */
export const UNARMED = Object.freeze({
  name: "Unarmed",
  weaponType: "melee",
  thrown: false,
  proficiencies: ["Basic", "Melee 2"],
  damage: { rolled: 0, kept: 1, type: "I" },
  pen: 0,
  rof: { single: true, auto: 0 },
  qualities: [{ key: "brawling", value: null }],
  craftsmanship: "common",
  material: ""
});

/**
 * Is this attack made in melee? A melee weapon thrown is a ranged attack.
 * @param {WeaponProfile} weapon
 * @param {{thrown?: boolean}} [options]
 */
export function isMeleeAttack(weapon, { thrown = false } = {}) {
  return weapon.weaponType === "melee" && !thrown;
}

/**
 * Qualities after craftsmanship and material (p. 319): ranged Poor gains Unreliable (and loses Reliable),
 * Good gains Reliable, Best also gains Proven (2) or +1 Proven; melee Best gains Proven. A material makes the
 * weapon Best, but its bonuses replace the craftsmanship ones (p. 348); Orichalcum ranged is Reliable.
 * @param {WeaponProfile} weapon
 * @returns {Record<string, number|true>}  quality key → value (true when it has none)
 */
export function effectiveQualities(weapon) {
  const map = Object.fromEntries(weapon.qualities.map((q) => [q.key, q.value ?? true]));
  const melee = weapon.weaponType === "melee";
  if (weapon.material) {
    if (!melee && MATERIALS[weapon.material]?.ranged?.reliable) {
      map.reliable = true;
      delete map.unreliable;
    }
    return map;
  }
  const quality = weapon.craftsmanship ?? "common";
  if (!melee) {
    if (quality === "poor") {
      delete map.reliable;
      map.unreliable = true;
    } else if (quality === "good" || quality === "best") {
      map.reliable = true;
      delete map.unreliable;
    }
  }
  if (quality === "best") map.proven = typeof map.proven === "number" ? map.proven + 1 : 2;
  return map;
}

/**
 * Skill of the attack (p. 431): Brawl for unarmed and Brawling weapons, Weaponry in melee, Ballistics at range.
 * @param {WeaponProfile} weapon
 * @param {{thrown?: boolean}} [options]
 * @returns {"weaponry"|"ballistics"|"brawl"}
 */
export function attackSkill(weapon, options = {}) {
  if (weapon.qualities.some((q) => q.key === "brawling")) return "brawl";
  return isMeleeAttack(weapon, options) ? "weaponry" : "ballistics";
}

/**
 * Proficient when a Weapon Proficiency choice matches one of the weapon's groups (p. 197). A melee weapon
 * thrown uses Throwing.
 * @param {WeaponProfile} weapon
 * @param {string[]} choices  Weapon Proficiency sub-categories of the character
 * @param {{thrown?: boolean}} [options]
 */
export function isProficient(weapon, choices, { thrown = false } = {}) {
  const accepted = thrown && weapon.weaponType === "melee" ? ["Throwing"] : weapon.proficiencies;
  return accepted.some((choice) => choices.includes(choice));
}

const add = (pool, [rolled, kept], note) => {
  pool.rolled += rolled;
  pool.kept += kept;
  if (note) pool.notes.push(note);
};

/**
 * Attack pool (p. 431): skill k skill, no characteristic; +Level k0 when proficient.
 * @param {object} input
 * @param {WeaponProfile} input.weapon
 * @param {number} input.skill       value of the attack skill
 * @param {number} input.level
 * @param {boolean} input.proficient
 * @param {boolean} [input.focus]    Weapon Focus for this weapon (+2k0, p. 197)
 * @param {{range?: string, aim?: number, mode?: "single"|"auto", braced?: boolean, oneHanded?: boolean,
 *   thrown?: boolean}} [input.options]
 * @param {string[]} [input.mods]  mods of a custom weapon (spec 015): Red-Dot Sight +1k0 on single shots, Motion
 *   Predict +1k0 on full auto
 * @returns {{rolled: number, kept: number, requiredRaises: number, autoAllowed: boolean, notes: string[]}}
 */
export function attackPool({ weapon, skill, level, proficient, focus = false, options = {}, mods = [] }) {
  const { range = "normal", aim = 0, mode = "single", braced = false, oneHanded = false, thrown = false } = options;
  const qualities = effectiveQualities(weapon);
  const melee = isMeleeAttack(weapon, { thrown });
  const material = weapon.material ? MATERIALS[weapon.material] : null;
  const pool = { rolled: skill, kept: skill, requiredRaises: 0, autoAllowed: (weapon.rof?.auto ?? 0) > 0 && !melee, notes: [] };

  if (proficient) add(pool, [level, 0], "proficient");
  if (focus) add(pool, [2, 0], "focus");

  if (!melee) {
    // Range bands (p. 435): point blank ≤ 2 m, short < half range; long and extreme need raises.
    if (range === "pointBlank") add(pool, [2, 1], "pointBlank");
    else if (range === "short") add(pool, [1, 0], "short");
    else if (range === "long") pool.requiredRaises += 1;
    else if (range === "extreme") pool.requiredRaises += 3;

    const ignoreHandling = Boolean(material?.ranged?.ignoreHandling);
    // Heavy weapons must be braced (p. 318): −3k1 and no full auto otherwise.
    if (weapon.weaponType === "heavy" && !braced && !ignoreHandling) {
      add(pool, [-3, -1], "unbraced");
      pool.autoAllowed = false;
    }
    // Basic weapons fired one-handed: −2k0 unless Compact (p. 318).
    if (weapon.weaponType === "basic" && oneHanded && !qualities.compact && !ignoreHandling) add(pool, [-2, 0], "oneHanded");
    if (mode === "auto" && pool.autoAllowed) add(pool, [2, 1], "fullAuto");
    if (mode === "single" && qualities.twinLinked) add(pool, [1, 0], "twinLinked");
    if (material?.ranged?.attack) add(pool, material.ranged.attack, "material");
  } else if (material?.melee?.attack) {
    add(pool, material.melee.attack, "material");
  }

  // Aim (p. 425): half action +1k0, full action +2k1; Accurate +1k0 more; Inaccurate gains nothing.
  if (aim > 0 && !qualities.inaccurate) {
    add(pool, aim >= 2 ? [2, 1] : [1, 0], aim >= 2 ? "aimFull" : "aimHalf");
    if (qualities.accurate) add(pool, [1, 0], "accurate");
  }
  if (qualities.defensive) add(pool, [-2, 0], "defensive");
  if (!melee && mods.includes("redDotSight") && mode !== "auto") add(pool, [1, 0], "redDotSight");
  if (!melee && mods.includes("motionPredict") && mode === "auto" && pool.autoAllowed) add(pool, [1, 0], "motionPredict");

  return pool;
}

/**
 * Damage pool (p. 431): the weapon's XkY; melee and thrown weapons add Strength as rolled dice (not
 * explosives); craftsmanship, material, qualities, full auto hits and Weapon Specialization.
 * @param {object} input
 * @param {WeaponProfile} input.weapon
 * @param {number} input.str
 * @param {{thrown?: boolean, mode?: string, aim?: number, range?: string}} [input.options]
 * @param {number} [input.extraHits]      full auto hits beyond the first
 * @param {boolean} [input.specialization] Weapon Specialization for this weapon (+2k0, p. 197)
 * @param {number} [input.raises]         raises of the attack
 * @returns {{rolled: number, kept: number, flat: number, explodeOn: number, rerollBelow: number, pen: number,
 *   type: string, notes: string[]}}
 */
export function damagePool({ weapon, str, options = {}, extraHits = 0, specialization = false, raises = 0, mods = [] }) {
  const { thrown = false, mode = "single", aim = 0, range = "normal" } = options;
  const qualities = effectiveQualities(weapon);
  const melee = isMeleeAttack(weapon, { thrown });
  const material = weapon.material ? MATERIALS[weapon.material] : null;
  const pool = {
    rolled: weapon.damage.rolled,
    kept: weapon.damage.kept,
    // Flat bonus of vehicle weapons, e.g. AC/2 4k2+10 (spec 013, p. 377).
    flat: weapon.damage.bonus ?? 0,
    explodeOn: qualities.volatile ? 9 : 10,
    rerollBelow: typeof qualities.proven === "number" ? qualities.proven : 0,
    pen: weapon.pen,
    type: weapon.damage.type,
    notes: []
  };

  const muscle = weapon.weaponType === "melee" || weapon.weaponType === "thrown" || thrown;
  if (muscle && weapon.damage.type !== "X" && !qualities.blast) add(pool, [str, 0], "strength");

  if (melee && !material) {
    if (weapon.craftsmanship === "poor") add(pool, [-1, 0], "poor");
    else if (weapon.craftsmanship === "good" || weapon.craftsmanship === "best") add(pool, [1, 0], "craftsmanship");
  }
  const byKind = material ? material[melee ? "melee" : "ranged"] : null;
  if (byKind?.damage) add(pool, byKind.damage, "material");
  if (byKind?.pen) pool.pen += byKind.pen;

  // Full auto (p. 427): +1k0 per extra hit; Storm +2k0.
  if (mode === "auto" && extraHits > 0) add(pool, [extraHits * (qualities.storm ? 2 : 1), 0], "fullAuto");
  if (specialization) add(pool, [2, 0], "specialization");
  if (mode === "single" && qualities.twinLinked && raises >= 2) add(pool, [2, 0], "twinLinked");
  if (mode === "single" && aim > 0 && qualities.accurate && raises >= 2) add(pool, [Math.floor(raises / 2), Math.floor(raises / 2)], "accurate");
  if (range === "pointBlank" && qualities.scatter && raises >= 2) add(pool, [Math.floor(raises / 2), 0], "scatter");
  if (qualities.razorSharp && raises >= 2) {
    pool.pen *= 2;
    pool.notes.push("razorSharp");
  }
  // Custom weapon mods (spec 015): Breacher +1k0 at short range or closer; Nonlethal dice never explode.
  if (mods.includes("breacher") && (range === "short" || range === "pointBlank")) add(pool, [1, 0], "breacher");
  if (mods.includes("nonlethal")) {
    pool.explodeOn = 11;
    pool.notes.push("nonlethal");
  }
  return pool;
}

/**
 * Hits of a full auto burst (p. 427): one plus one per raise, up to the ROF.
 * @param {number} raises
 * @param {number} auto
 */
export function fullAutoHits(raises, auto) {
  return Math.max(1, Math.min(1 + Math.max(0, raises), auto));
}

/**
 * Jam check (p. 435): the weapon jams when more kept dice show 1 than the character's Level; Unreliable counts
 * 2s too; Reliable never jams.
 * @param {{keptFaces: number[], level: number, reliable?: boolean, unreliable?: boolean}} input
 *   keptFaces: first face of each kept die
 */
export function isJammed({ keptFaces, level, reliable = false, unreliable = false }) {
  if (reliable) return false;
  const limit = unreliable ? 2 : 1;
  return keptFaces.filter((face) => face <= limit).length > level;
}

/**
 * Hit location of a d10 (p. 431).
 * @param {number} d10
 * @returns {string}
 */
export function hitLocation(d10) {
  return HIT_LOCATIONS[d10];
}
