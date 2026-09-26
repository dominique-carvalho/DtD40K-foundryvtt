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

/** Class completion bonuses that are automated (spec 006, research R4); the others are text. */
export const CLASS_COMPLETION = ["none", "hpMax", "initiative", "resolveMax", "staticDefense", "specialty", "skillDot"];

/** State of a class on a character: the one being worked on, or completed (p. 106). */
export const CLASS_STATUS = ["current", "completed"];

/** XP costs of the character creation table (DtD 7.7a pp. 15–16). */
export const XP_COSTS = { characteristic: 200, newSkill: 100, skill: 50, feat: 100, asset: 100, powerStat: 300 };

/** Starting XP of a Hero (p. 15). */
export const STARTING_XP = 600;

/** Free Study: characteristics and skills off the completed class lists cost double (p. 106). */
export const FREE_STUDY_MULTIPLIER = 2;

/** What an XP purchase can buy (schools, spells and backgrounds come with their own features). */
export const XP_KINDS = ["characteristic", "skill", "feat", "asset", "powerStat"];

/** Generic 1-point resource spends (DtD 7.7a p. 65). */
export const GENERIC_SPENDS = ["heal", "skill", "reaction", "stunned", "dazed"];

/* ---------- Equipment (spec 007, DtD 7.7a ch. XIII–XIV, pp. 314–356) ---------- */

/** Rarity ladder, in steps: TN of the Wealth Test and search time (p. 315). */
export const RARITIES = Object.fromEntries([
  ["worthless", 0], ["ubiquitous", 2], ["veryCommon", 5], ["common", 10], ["uncommon", 15], ["rare", 20],
  ["veryRare", 25], ["mythicRare", 30], ["nearUnique", 35], ["fabulousMax", 40], ["irrationallyExpensive", 45],
  ["glittergold", 50]
].map(([key, tn]) => [key, { tn, label: `DTD.Rarity.${key}`, time: `DTD.Rarity.Time.${key}` }]));

/** Craftsmanship and its Wealth Test TN shift (p. 317). */
export const CRAFTSMANSHIP = { poor: -5, common: 0, good: 5, best: 10 };

/** Weapon types of the profile tables (p. 318). */
export const WEAPON_TYPES = ["melee", "thrown", "pistol", "basic", "heavy"];

/** Weapon Proficiency choices (p. 197); weapon groups accept one or two of them. */
export const WEAPON_PROFICIENCIES = ["Basic", "Melee 1", "Melee 2", "Melee 3", "Ranged 1", "Ranged 2", "Throwing"];

/** Damage types: Energy, Explosive, Rending, Impact (p. 318). */
export const DAMAGE_TYPES = ["E", "X", "R", "I"];

const quality = (key, { hasValue = false, automated = false } = {}) => [key, {
  label: `DTD.Quality.${key}.label`, hint: `DTD.Quality.${key}.hint`, hasValue, automated
}];

/** The 36 weapon special properties (pp. 319–321); `automated` ones change the dice or the jam check. */
export const WEAPON_QUALITIES = Object.fromEntries([
  quality("balanced", { automated: true }), quality("accurate", { automated: true }), quality("armMounted"),
  quality("armored"), quality("beam"), quality("blast", { hasValue: true }), quality("brawling", { automated: true }),
  quality("combiweapon"), quality("compact", { automated: true }), quality("defensive", { automated: true }),
  quality("flame"), quality("flexible"), quality("homing"), quality("inaccurate", { automated: true }),
  quality("incendiary"), quality("orgoneArray"), quality("overheats"), quality("powerField"),
  quality("proven", { hasValue: true, automated: true }), quality("razorSharp", { automated: true }), quality("reach"),
  quality("recharge"), quality("reliable", { automated: true }), quality("scatter"), quality("shocking"),
  quality("smoke"), quality("snare"), quality("storm", { automated: true }), quality("tearing"), quality("toxic"),
  quality("twinLinked", { automated: true }), quality("twoHands"), quality("unbalanced", { automated: true }),
  quality("unreliable", { automated: true }), quality("unwieldy", { automated: true }),
  quality("volatile", { automated: true })
]);

/** Armor types, matching the Armor Proficiency choices (p. 180, p. 332). */
export const ARMOR_TYPES = ["light", "medium", "heavy", "extreme", "power"];

/** Pieces of an armor suit; the body piece also covers the Gizzards (p. 332). */
export const ARMOR_PIECES = ["head", "body", "arms", "legs"];

/** Hit locations by d10 (p. 431). */
export const HIT_LOCATIONS = {
  1: "leftLeg", 2: "rightLeg", 3: "body", 4: "body", 5: "body", 6: "body",
  7: "gizzards", 8: "leftArm", 9: "rightArm", 10: "head"
};

/** Categories of the `gear` Item subtype (research R1). */
export const GEAR_CATEGORIES = ["gear", "cybernetic", "drug", "material", "wonder", "hearthstone"];

/** Magical materials of artifacts (pp. 349–351); numeric bonuses by item kind (research R11). */
export const MATERIALS = {
  orichalcum: { melee: { attack: [2, 0], damage: [2, 0] }, ranged: { attack: [1, 1], reliable: true }, armor: { ap: 2, maxDex: 1 } },
  mithril: { melee: { attack: [1, 1] }, ranged: { ignoreHandling: true }, armor: { maxDex: 2 } },
  darksteel: { melee: { pen: 8 }, ranged: {}, armor: {} },
  wraithbone: { melee: {}, ranged: {}, armor: {} },
  necrodermis: { melee: { damage: [1, 0] }, ranged: { damage: [1, 0] }, armor: {} }
};

/** Drug Addictivity and the Willpower TN to avoid addiction (p. 341). */
export const ADDICTIVITY = { none: 0, low: 10, moderate: 15, high: 20, extreme: 25 };

/** Addiction severity (p. 341): 0 none, 1 Minor, 2 Moderate, 3 Major. */
export const ADDICTION_LEVELS = ["none", "minor", "moderate", "major"];

/** Starting equipment picks at character creation (p. 16). */
export const STARTING_SLOTS = { rare: 1, uncommon: 1, common: 2, veryCommon: 2 };

/** Wealth Strain: minimum 1d10 result → Wealth penalty until the end of the next session (p. 316). */
export const WEALTH_STRAIN = [{ min: 11, penalty: 5 }, { min: 10, penalty: 3 }, { min: 7, penalty: 1 }, { min: 1, penalty: 0 }];

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
  FEAT_REQUIREMENT_TYPES,
  CLASS_COMPLETION,
  CLASS_STATUS,
  XP_COSTS,
  STARTING_XP,
  FREE_STUDY_MULTIPLIER,
  XP_KINDS,
  RARITIES,
  CRAFTSMANSHIP,
  WEAPON_TYPES,
  WEAPON_PROFICIENCIES,
  DAMAGE_TYPES,
  WEAPON_QUALITIES,
  ARMOR_TYPES,
  ARMOR_PIECES,
  HIT_LOCATIONS,
  GEAR_CATEGORIES,
  MATERIALS,
  ADDICTIVITY,
  ADDICTION_LEVELS,
  STARTING_SLOTS,
  WEALTH_STRAIN
};
