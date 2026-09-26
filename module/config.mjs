/**
 * Static rule data for Dungeons the Dragoning.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 22–29 (characteristics and skills); docs/analise-dtd.md §3.
 */

/** Characteristic and skill groups, in sheet order. */
export const GROUPS = ["physical", "social", "mental"];

/**
 * @typedef {object} CharacteristicDef
 * @property {"physical"|"social"|"mental"} group
 * @property {string} label  i18n key
 * @property {string} abbr   i18n key
 */

const characteristic = (key, group) => ({
  group,
  label: `DTD.Characteristic.${key}`,
  abbr: `DTD.CharacteristicAbbr.${key}`
});

/** @type {Record<string, CharacteristicDef>} */
export const CHARACTERISTICS = {
  str: characteristic("str", "physical"),
  dex: characteristic("dex", "physical"),
  con: characteristic("con", "physical"),
  cha: characteristic("cha", "social"),
  fel: characteristic("fel", "social"),
  cmp: characteristic("cmp", "social"),
  int: characteristic("int", "mental"),
  wis: characteristic("wis", "mental"),
  wil: characteristic("wil", "mental")
};

/**
 * Classic sheet layout (official PDF, p. 17): rows Power/Finesse/Resistance,
 * columns Mental/Physical/Social. Each column matches the characteristic group.
 */
export const CHARACTERISTIC_GRID = {
  rows: ["power", "finesse", "resistance"],
  columns: ["mental", "physical", "social"],
  cells: {
    power: ["int", "str", "cha"],
    finesse: ["wis", "dex", "fel"],
    resistance: ["wil", "con", "cmp"]
  }
};

/**
 * @typedef {object} SkillDef
 * @property {"physical"|"social"|"mental"} group
 * @property {string} characteristic  default characteristic key
 * @property {boolean} advanced       advanced skills cannot be rolled untrained
 * @property {string} label           i18n key
 */

const skill = (key, group, char, advanced = false) => ({
  group,
  characteristic: char,
  advanced,
  label: `DTD.Skill.${key}`
});

/**
 * The 27 skills, as in DtD 7.7a pp. 25–29: Arcana and Acrobatics are basic, Athletics uses
 * Strength (the 1.6 book had Acrobatics advanced and Athletics on Constitution).
 * Ballistics, Brawl and Weaponry are "Special" in the book; Dexterity is the
 * default for generic tests (research R8).
 * @type {Record<string, SkillDef>}
 */
export const SKILLS = {
  // Mental
  academicLore: skill("academicLore", "mental", "int", true),
  arcana: skill("arcana", "mental", "int"),
  commonLore: skill("commonLore", "mental", "int", true),
  crafts: skill("crafts", "mental", "wis"),
  forbiddenLore: skill("forbiddenLore", "mental", "int", true),
  medicae: skill("medicae", "mental", "wis", true),
  perception: skill("perception", "mental", "wis"),
  politics: skill("politics", "mental", "wis", true),
  techUse: skill("techUse", "mental", "int", true),
  // Physical
  acrobatics: skill("acrobatics", "physical", "dex"),
  athletics: skill("athletics", "physical", "str"),
  ballistics: skill("ballistics", "physical", "dex"),
  brawl: skill("brawl", "physical", "dex"),
  drive: skill("drive", "physical", "dex"),
  larceny: skill("larceny", "physical", "dex"),
  pilot: skill("pilot", "physical", "dex", true),
  stealth: skill("stealth", "physical", "dex"),
  weaponry: skill("weaponry", "physical", "dex"),
  // Social
  animalKen: skill("animalKen", "social", "cmp"),
  charm: skill("charm", "social", "fel"),
  command: skill("command", "social", "cha"),
  deceive: skill("deceive", "social", "cha"),
  disguise: skill("disguise", "social", "fel"),
  intimidation: skill("intimidation", "social", "cha"),
  performer: skill("performer", "social", "fel"),
  persuasion: skill("persuasion", "social", "cha"),
  scrutiny: skill("scrutiny", "social", "cmp")
};

/** Derived values that accept a manual bonus and override. */
export const DERIVED_KEYS = ["staticDefense", "hpMax", "mentalDefense", "resolveMax", "speed", "resilience", "fatigueMax"];

/** Highest characteristic or skill rating, racial bonuses included (spec 002, FR-015). */
export const MAX_RATING = 6;

/**
 * How a racial power is handled (spec 002, FR-016 to FR-018).
 * none: text only · usesPerScene: 1/2/3 uses at Level 1/3/5 · the others are automated.
 */
export const RACE_POWER_AUTOMATION = ["none", "usesPerScene", "heroicHeritage", "shifty", "squatToughness"];

export const DTD = {
  GROUPS,
  CHARACTERISTICS,
  CHARACTERISTIC_GRID,
  SKILLS,
  DERIVED_KEYS,
  MAX_RATING,
  RACE_POWER_AUTOMATION
};
