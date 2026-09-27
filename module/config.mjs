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
export const XP_KINDS = ["characteristic", "skill", "feat", "asset", "powerStat", "school", "combo", "martial", "specialAttack", "background"];

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

/* ---------- Combat (spec 008, DtD 7.7a ch. XVII, pp. 416–452) ---------- */

const ADD_MODE = 2;
const status = (id, img, changes = []) => ({
  id, name: `DTD.Condition.${id}`, img,
  changes: changes.map(([key, value]) => ({ key, mode: ADD_MODE, value: String(value) }))
});

/**
 * Conditions of the book (pp. 442–444) and effects of defensive actions (pp. 425–428), used as the token status
 * effects. Numeric effects are `changes`; the others are read from `actor.statuses` by the pure rules.
 */
export const STATUS_EFFECTS = [
  status("blinded", "icons/svg/blind.svg"),
  status("bloodLoss", "icons/svg/blood.svg"),
  status("dazed", "icons/svg/daze.svg", [["system.modifiers.rolls.all.rolled", -1]]),
  status("deafened", "icons/svg/deaf.svg"),
  status("diseased", "icons/svg/biohazard.svg"),
  status("onFire", "icons/svg/fire.svg"),
  status("helpless", "icons/svg/paralysis.svg"),
  status("immobilized", "icons/svg/anchor.svg"),
  status("pinned", "icons/svg/terror.svg"),
  status("prone", "icons/svg/falling.svg"),
  status("restrained", "icons/svg/net.svg"),
  status("stunned", "icons/svg/stoned.svg"),
  status("surprised", "icons/svg/hazard.svg"),
  status("unconscious", "icons/svg/unconscious.svg"),
  status("dead", "icons/svg/skull.svg"),
  status("grappled", "icons/svg/thrust.svg"),
  status("jaded", "icons/svg/silenced.svg"),
  status("lostHand", "icons/svg/downgrade.svg"),
  status("lostArm", "icons/svg/downgrade.svg"),
  status("lostEye", "icons/svg/invisible.svg"),
  status("lostFoot", "icons/svg/leg.svg"),
  status("lostLeg", "icons/svg/leg.svg"),
  status("fullDefense", "icons/svg/holy-shield.svg", [["system.modifiers.combat.sd", 10], ["system.modifiers.combat.reactions", 2]]),
  status("fightDefensively", "icons/svg/shield.svg", [["system.modifiers.combat.reactions", 1]]),
  status("allOutAttack", "icons/svg/sword.svg"),
  status("healingSurge", "icons/svg/regen.svg", [["system.modifiers.combat.sd", 5]]),
  status("running", "icons/svg/wingfoot.svg")
];

/** Statuses that are effects of an action and last until the character's next turn (research R5). */
export const UNTIL_NEXT_TURN = ["fullDefense", "fightDefensively", "allOutAttack", "healingSurge", "running"];

/** Damage type letter → critical table (pp. 438–441). */
export const DAMAGE_TABLE_TYPES = { E: "energy", X: "explosive", I: "impact", R: "rending" };

/** Hit location → critical table location; left and right share a table (p. 437). */
export const CRITICAL_LOCATIONS = {
  leftArm: "arm", rightArm: "arm", arms: "arm", body: "body", gizzards: "gizzards", head: "head",
  leftLeg: "legs", rightLeg: "legs", legs: "legs"
};

/** Fear rating → Willpower TN (p. 448). */
export const FEAR_TN = { 1: 15, 2: 20, 3: 25, 4: 30, 5: 35 };

/** Action types and subtypes (pp. 423–424). */
export const ACTION_TYPES = ["half", "full", "free", "reaction", "varies"];
export const ACTION_SUBTYPES = ["attack", "melee", "ranged", "movement", "concentration", "miscellaneous", "defense", "provokes"];

/** At most 4 Resolve drained per scene by social attacks, then Jaded (p. 446). */
export const RESOLVE_DRAIN_LIMIT = 4;

/* ---------- Magic (spec 009, DtD 7.7a ch. VIII, pp. 224–259) ---------- */

/** The nine Magic Schools and the characteristic each always uses (pp. 227–228). */
export const MAGIC_SCHOOLS = Object.fromEntries([
  ["abjuration", "wil"], ["conjuration", "wil"], ["divination", "wis"], ["enchantment", "cha"], ["evocation", "cha"],
  ["healing", "wis"], ["illusion", "int"], ["necromancy", "int"], ["transmutation", "wis"]
].map(([key, characteristic]) => [key, {
  label: `DTD.Magic.School.${key}`, characteristic, name: key.charAt(0).toUpperCase() + key.slice(1)
}]));

/** Spell keywords (pp. 228–229). */
export const SPELL_KEYWORDS = [
  "attack", "comboOk", "focus", "languageDependent", "material", "mindAffecting", "rangedTouch", "savingThrow", "social",
  "somatic", "subtle", "touch", "verbal"
];

/** Actions a spell takes (p. 228). */
export const SPELL_ACTIONS = ["half", "full", "reaction", "free", "halfOrReaction"];

/** Duration types (p. 229). */
export const SPELL_DURATIONS = ["instant", "scene", "rounds", "minutes", "hours", "days", "indefinite", "concentration", "special"];

/** Casting strength (pp. 226–227). */
export const CAST_STRENGTHS = ["fettered", "unfettered", "push"];

/** Most points a caster may Push: Sanctioned (the Tested feat) 3, Unsanctioned 4 (p. 227). */
export const MAX_PUSH = { sanctioned: 3, unsanctioned: 4 };

/** XP of Magic Schools and Spell Combos (p. 16, p. 229): new school 200, then 100 × current rank; combo 50 × levels. */
export const MAGIC_XP = { newSchool: 200, perRank: 100, comboPerLevel: 50 };

/* ---------- Sword Schools and Gun Kata (spec 010, DtD 7.7a ch. IX–X, pp. 260–279) ---------- */

/** The nine Sword Schools (pp. 263–271) and six Gun Kata (pp. 274–279) with their key skill. */
export const MARTIAL_SCHOOLS = Object.fromEntries([
  ["desertWind", "Desert Wind", "sword", "athletics"], ["devotedSpirit", "Devoted Spirit", "sword", "medicae"],
  ["diamondMind", "Diamond Mind", "sword", "scrutiny"], ["ironHeart", "Iron Heart", "sword", "perception"],
  ["settingSun", "Setting Sun", "sword", "deceive"], ["shadowHand", "Shadow Hand", "sword", "stealth"],
  ["stoneDragon", "Stone Dragon", "sword", "intimidation"], ["tigerClaw", "Tiger Claw", "sword", "acrobatics"],
  ["whiteRaven", "White Raven", "sword", "command"], ["clayPigeon", "Clay Pigeon", "gunKata", "performer"],
  ["crisisZone", "Crisis Zone", "gunKata", "techUse"], ["elementalGearbolt", "Elemental Gearbolt", "gunKata", "arcana"],
  ["pointBlank", "Point Blank", "gunKata", "athletics"], ["silentScope", "Silent Scope", "gunKata", "perception"],
  ["tinStar", "Tin Star", "gunKata", "scrutiny"]
].map(([key, name, kind, skill]) => [key, { label: `DTD.Martial.School.${key}`, name, kind, skill }]));

/** Kinds of school entries (p. 262): the unlocked action, the weapon, flaw and skill Restrictions, Advantages, Mastery. */
export const MARTIAL_ENTRY_TYPES = ["action", "weapon", "flaw", "skill", "advantage", "mastery"];

/** XP of Special Attacks and Trick Shots (p. 261, p. 273): 50 per style point of Advantages; schools cost as MAGIC_XP. */
export const MARTIAL_XP = { perStylePoint: 50 };

/* ---------- Backgrounds and Alignment (spec 011, DtD 7.7a ch. XI–XII, pp. 280–312) ---------- */

/** The three pantheons (pp. 287–291). */
export const PANTHEONS = Object.fromEntries(["ruinousPowers", "blessedPantheon", "grayCouncil"]
  .map((key) => [key, { label: `DTD.Alignment.Pantheon.${key}` }]));

/** The eleven Backgrounds (pp. 280–283); Artifact and Backing can be taken several times. */
export const BACKGROUNDS = Object.fromEntries([
  "allies", "artifact", "backing", "contacts", "fame", "followers", "holdings", "inheritance", "mentor", "status", "wealth"
].map((key) => [key, { label: `DTD.Background.${key}.label`, multiple: key === "artifact" || key === "backing" }]));

/**
 * Backgrounds at creation (pp. 15–16, 281): 7 free dots, none above 3 without XP; 50 XP per dot 1–3 and 100 per
 * dot 4–5, only during creation; at most 5 dots of Artifacts.
 */
export const BACKGROUND_XP = { freeDots: 7, freeMax: 3, low: 50, high: 100, artifactCreationMax: 5 };

/**
 * Inheritance picks (p. 282) in "slots": a rank-1 choice fills one slot (1 Uncommon, 2 Common, 4 Very Common or 8
 * Ubiquitous); each rank doubles the slots (a rarer item or two choices of the rank below).
 */
export const INHERITANCE_SLOTS = { ubiquitous: 0.125, veryCommon: 0.25, common: 0.5, uncommon: 1, rare: 2, veryRare: 4, mythicRare: 8, anyNonArtifact: 16 };

/* ---------- Antagonists (spec 012, DtD 7.7a ch. XX, pp. 520–544) ---------- */

/** Folders of the Antagonists compendium. */
export const NPC_CATEGORIES = ["people", "military", "criminals", "cultists", "machines", "daemons", "creatures", "legends", "undead", "xenos"];

/** The twenty creature traits (pp. 520–522); hasValue: printed with a rating, e.g. Armor Plating (X). */
export const NPC_TRAITS = Object.fromEntries([
  ["amphibious", false], ["amorphous", false], ["armorPlating", true], ["aura", true], ["autoStabilized", false],
  ["caster", true], ["crawler", false], ["daemonic", false], ["darkSight", false], ["fear", true], ["flyer", true],
  ["machine", true], ["mindless", false], ["phasing", false], ["quadruped", false], ["regeneration", true],
  ["resourceStat", true], ["stuffOfNightmares", false], ["undead", false], ["unnaturalToughness", false]
].map(([key, hasValue]) => [key, { label: `DTD.Npc.Trait.${key}.label`, hint: `DTD.Npc.Trait.${key}.hint`, hasValue }]));

/**
 * Minion Squads (pp. 543–544): up to 6 minions; Static Defense 5 × Threat Rating; 5 damage per Damage Rating and
 * raise; ranged range 10 × Threat Rating (the book also says 5 ×).
 */
export const MINION = { maxCount: 6, sdPerThreat: 5, damagePerRating: 5, rangePerThreat: 10 };

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
  WEALTH_STRAIN,
  STATUS_EFFECTS,
  UNTIL_NEXT_TURN,
  DAMAGE_TABLE_TYPES,
  CRITICAL_LOCATIONS,
  FEAR_TN,
  ACTION_TYPES,
  ACTION_SUBTYPES,
  RESOLVE_DRAIN_LIMIT,
  MAGIC_SCHOOLS,
  SPELL_KEYWORDS,
  SPELL_ACTIONS,
  SPELL_DURATIONS,
  CAST_STRENGTHS,
  MAX_PUSH,
  MAGIC_XP,
  MARTIAL_SCHOOLS,
  MARTIAL_ENTRY_TYPES,
  MARTIAL_XP,
  PANTHEONS,
  BACKGROUNDS,
  BACKGROUND_XP,
  INHERITANCE_SLOTS,
  NPC_CATEGORIES,
  NPC_TRAITS,
  MINION
};
