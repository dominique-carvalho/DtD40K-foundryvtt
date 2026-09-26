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

/**
 * Resource maximum formulas of the exaltations (spec 004, research R3; DtD 7.7a pp. 68–100).
 * fixed: a set value, for exaltations created by the GM.
 */
export const EXALTATION_FORMULAS = ["motes", "favor", "essence", "breath", "actionPoints", "pyros", "vitae", "rage", "plasm", "fixed"];

/** Automated static powers (spec 004, FR-025); the others are text only. */
export const EXALTATION_POWER_AUTOMATION = ["none", "destiny", "statuesque", "perfection", "bloodQuickening"];

/** Recovery buttons offered on the sheet (research R4). */
export const RESOURCE_ACTIONS = ["restoreAll", "regain", "lose", "unravel"];

/** When the generic "heal 1 HP" spend is allowed (p. 65; Werewolf anytime, Promethean never). */
export const RESOURCE_HEALING = ["outOfCombat", "anytime", "never"];

/** Power Stat caps: Level (p. 65), or Level and half the Devotion for the Chosen (p. 71). */
export const POWER_STAT_CAPS = ["level", "levelAndDevotion"];

/** Feat item categories (spec 004 research R1, spec 005 research R1). */
export const FEAT_CATEGORIES = ["feat", "racialFeat", "asset", "hindrance", "exaltedAsset"];

/** Exalted Asset groups (DtD 7.7a pp. 211–223). */
export const ASSET_GROUPS = [
  "atlanteanCaste", "chosenMark", "daemonhostSin", "dragonbloodedBloodline", "paragon", "paragonRacial",
  "prometheanMaterial", "vampireClan", "werewolfTribe", "wraithHaunting"
];

/** Automated Exalted Assets (research R6); the others are text only. */
export const ASSET_AUTOMATION = ["none", "actionHero", "extraAction", "bloodOfIo", "warboss", "longbeard", "markOfNurgle", "sloth", "elusive"];

/** Groups that do not count toward the one-Exalted-Asset limit (p. 179). */
export const LIMIT_EXEMPT_GROUPS = ["paragon", "paragonRacial"];

/** Automated feats, racial feats, assets and Exalted Assets (spec 005, research R4). */
export const FEAT_AUTOMATION = [
  ...ASSET_AUTOMATION,
  "soundConstitution", "discipline", "paranoia", "farsighted", "halflingAgility", "noOneTougher", "madeOfMettle",
  "beneficialMutation", "matron", "sturdy", "sand", "nineLives", "veteran", "skillFocus", "noisyCricket"
];

/** At most two hindrances per character (DtD 7.7a p. 179). */
export const HINDRANCE_LIMIT = 2;

/** What a feat may depend on: another feat, or a racial power (e.g. Elven Accuracy, Warp Step). */
export const FEAT_REQUIREMENT_TYPES = ["feat", "racePower"];

/** Generic 1-point resource spends (DtD 7.7a p. 65). */
export const GENERIC_SPENDS = ["heal", "skill", "reaction", "stunned", "dazed"];

export const DTD = {
  GROUPS,
  CHARACTERISTICS,
  CHARACTERISTIC_GRID,
  SKILLS,
  DERIVED_KEYS,
  MAX_RATING,
  RACE_POWER_AUTOMATION,
  EXALTATION_FORMULAS,
  EXALTATION_POWER_AUTOMATION,
  RESOURCE_ACTIONS,
  RESOURCE_HEALING,
  POWER_STAT_CAPS,
  FEAT_CATEGORIES,
  ASSET_GROUPS,
  ASSET_AUTOMATION,
  LIMIT_EXEMPT_GROUPS,
  GENERIC_SPENDS,
  FEAT_AUTOMATION,
  HINDRANCE_LIMIT,
  FEAT_REQUIREMENT_TYPES
};
