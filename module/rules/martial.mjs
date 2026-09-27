/**
 * Sword Schools and Gun Kata: Martial Adept and Gunslinger Level, the universal Advantages and Restrictions, what a
 * character may put in a Special Attack or Trick Shot, the style point budget and XP, the checks before using one and
 * the modifiers it gives (spec 010, research R2–R5).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 260–262 (Sword Schools), pp. 272–273 (Gun Kata); specs/010-sword-schools/contracts/rules-api.md.
 */
import { MARTIAL_SCHOOLS, MARTIAL_XP } from "../config.mjs";

const entry = (slug, name, cost, perPoint, effect, automation) => ({ slug, name, cost, perPoint, effect, automation });

/** Universal Advantages, shared by Special Attacks and Trick Shots (p. 262, p. 273). */
export const UNIVERSAL_ADVANTAGES = [
  entry("firstDamage", "First Damage Improvement", 1, true, "Each purchase adds one rolled die to damage.", { damage: { rolled: 1 } }),
  entry("secondDamage", "Second Damage Mastery", 3, true, "Each purchase adds one kept die to damage.", { damage: { kept: 1 } }),
  entry("firstAccuracy", "First Accuracy Improvement", 1, true, "Each purchase adds one rolled die to the attack roll.", { attack: { rolled: 1 } }),
  entry("secondAccuracy", "Second Accuracy Mastery", 2, true, "Each purchase adds one kept die to the attack roll.", { attack: { kept: 1 } }),
  entry("penetration", "Penetration Mastery", 1, true, "Each style point spent raises the attack's Penetration by 2.", { pen: 2 })
];

/** Universal Restrictions (p. 262, p. 273). */
export const UNIVERSAL_RESTRICTIONS = [
  entry("difficultStrike", "Difficult Strike", -1, false, "Cannot be used if it was used in the previous round.", { cooldown: 1 }),
  entry("lastResort", "Last Resort", -2, false, "Usable only once per scene.", { perScene: true }),
  entry("restrainedForce", "Restrained Force", -1, true, "Each purchase removes one rolled die from damage.", { damage: { rolled: -1 } }),
  entry("unbrokenSkin", "Unbroken Skin", -2, true, "Each purchase removes one kept die from damage.", { damage: { kept: -1 } }),
  entry("inaccurate", "Inaccurate", -1, true, "Each purchase removes one rolled die from the attack roll.", { attack: { rolled: -1 } }),
  entry("overextended", "Overextended", -2, true, "Each purchase removes one kept die from the attack roll.", { attack: { kept: -1 } }),
  entry("nonPenetrating", "Non-Penetrating", -1, false, "The attack has Penetration 0.", { penZero: true })
];

/**
 * Martial Adept Level (highest Sword School, p. 260) and Gunslinger Level (highest Gun Kata, p. 272).
 * @param {Record<string, number>} ranks  school key → rank
 * @returns {{adeptLevel: number, gunslingerLevel: number}}
 */
export function adeptLevels(ranks) {
  let adeptLevel = 0;
  let gunslingerLevel = 0;
  for (const [key, value] of Object.entries(ranks)) {
    const kind = MARTIAL_SCHOOLS[key]?.kind;
    if (kind === "sword") adeptLevel = Math.max(adeptLevel, value);
    else if (kind === "gunKata") gunslingerLevel = Math.max(gunslingerLevel, value);
  }
  return { adeptLevel, gunslingerLevel };
}

/** XP of the style points added to an attack (p. 261). */
export const perStylePoint = MARTIAL_XP.perStylePoint;
