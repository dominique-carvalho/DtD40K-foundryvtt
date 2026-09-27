import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COMBAT_ACTIONS } from "../../module/rules/combat-actions.mjs";
import {
  ASSET_AUTOMATION, ASSET_GROUPS, CHARACTERISTICS, EXALTATION_FORMULAS, RACE_POWER_AUTOMATION, RESOURCE_ACTIONS, SKILLS,
  MAGIC_SCHOOLS, MARTIAL_ENTRY_TYPES, MARTIAL_SCHOOLS, PANTHEONS, RARITIES, SPELL_KEYWORDS, STATUS_EFFECTS, WEAPON_PROFICIENCIES, WEAPON_QUALITIES
} from "../../module/config.mjs";

/** Every JSON document of a compendium source folder. */
const readPack = (dir) =>
  readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(join(dir, file), "utf8")));

const races = readPack("src/packs/races");

/**
 * Reference table — spec 002 "Tabela de referência" (DtD 7.7a, cap. 4, pp. 30–63).
 * [characteristic options (null = any), fixed skills, choose, size, power, automation, page]
 */
const EXPECTED = {
  Aasimar: [["wis", "con"], ["command", "ballistics"], 0, 5, "And They Shall Know No Fear", "none", 31],
  "Dark Eldarin": [["cha", "dex"], ["deceive", "forbiddenLore"], 0, 3, "Warp Miasma", "none", 33],
  Dragonborn: [["str", "cha"], ["command", "intimidation"], 0, 5, "Dragon Breath", "none", 35],
  Dryad: [["fel", "wil"], ["animalKen", "scrutiny"], 0, 4, "Pheromones", "none", 37],
  Eldarin: [["wis", "int"], ["academicLore", "arcana"], 0, 3, "Warp Step", "usesPerScene", 39],
  Elf: [["wis", "dex"], ["perception", "charm"], 0, 3, "Elven Accuracy", "none", 41],
  Gnome: [["int", "fel"], ["crafts", "academicLore"], 0, 3, "Improvise", "none", 43],
  Halfling: [["int", "fel"], ["larceny", "deceive"], 0, 2, "Shifty", "shifty", 45],
  Human: [null, [], 2, 4, "Heroic Heritage", "heroicHeritage", 47],
  Kenku: [["int", "wis"], ["performer", "pilot"], 0, 3, "Wing-Aided Movement", "none", 49],
  Kobold: [["cha", "dex"], ["arcana", "stealth"], 0, 2, "Power in the Blood", "none", 51],
  Ork: [["str", "wil"], ["intimidation", "scrutiny"], 0, 5, "WAAAAAGH!", "none", 53],
  Squat: [["con", "wil"], ["crafts", "commonLore"], 0, 3, "Squat Toughness", "squatToughness", 55],
  Tau: [["int", "cmp"], ["commonLore", "persuasion"], 0, 4, "Fall Back", "none", 57],
  "Thri-Kreen": [["dex", "wis"], ["acrobatics", "perception"], 0, 4, "Multi-Armed", "none", 59],
  Tiefling: [["dex", "con"], ["intimidation", "weaponry"], 0, 5, "Bloody Minded", "none", 61]
};

const sorted = (list) => [...list].sort();

describe("races compendium source (SC-001)", () => {
  it("contains exactly the 16 races of the 7.7a", () => {
    expect(sorted(races.map((race) => race.name))).toEqual(sorted(Object.keys(EXPECTED)));
  });

  it("has unique 16-character ids and matching LevelDB keys", () => {
    const ids = races.map((race) => race._id);
    for (const race of races) {
      expect(race._id).toMatch(/^[A-Za-z0-9]{16}$/);
      expect(race._key).toBe(`!items!${race._id}`);
      expect(race.type).toBe("race");
      expect(race.effects).toEqual([]);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(races.map((race) => [race.name, race]))("%s", (name, race) => {
    const [options, skills, choose, size, power, automation, page] = EXPECTED[name];
    const system = race.system;

    it("matches the book's racial statistics", () => {
      if (options === null) {
        expect(system.characteristicBonus).toEqual({ options: [], any: true });
      } else {
        expect(system.characteristicBonus.any).toBe(false);
        expect(sorted(system.characteristicBonus.options)).toEqual(sorted(options));
      }
      expect(sorted(system.skillBonus.skills)).toEqual(sorted(skills));
      expect(system.skillBonus.choose).toBe(choose);
      expect(system.size).toBe(size);
      expect(system.power.name).toBe(power);
      expect(system.power.automation).toBe(automation);
      expect(system.source).toEqual({ book: "DtD 7.7a", page });
    });

    it("uses only known keys and an empty choice", () => {
      for (const key of system.characteristicBonus.options) expect(CHARACTERISTICS).toHaveProperty(key);
      for (const key of system.skillBonus.skills) expect(SKILLS).toHaveProperty(key);
      expect(RACE_POWER_AUTOMATION).toContain(system.power.automation);
      expect(system.choice).toEqual({ characteristic: "", skills: [] });
      expect(system.power.uses).toEqual({ spent: 0 });
      // The book text is never shipped: each table pastes it in its own world (constitution V).
      expect(system.fullText).toBe("");
    });

    it("has summaries and lore", () => {
      expect(system.description.trim()).not.toBe("");
      expect(system.power.description.trim()).not.toBe("");
      expect(system.lore.languages).toContain("Trade");
      // Human has no height, weight, traits or example names in the book (7.7a p. 47).
      if (name !== "Human") {
        for (const list of ["personality", "physical", "names"]) expect(system.lore[list].length).toBeGreaterThan(0);
      }
    });
  });
});

const ID = /^[A-Za-z0-9]{16}$/;
const ELEMENTS = [["air", "int", 0], ["earth", "con", 2], ["fire", "cha", 0], ["water", "str", 0], ["wood", "wis", 0]];

/**
 * Reference table — spec 004 "Tabela de referência — Exaltações" (DtD 7.7a, cap. 5).
 * [power stat, cap, resource, formula, debt, healing, pressure, static powers, powers 1–5, page]
 */
const EXALTATIONS = {
  Atlantean: ["Gnosis", "level", "Motes", "motes", "Paradox", "outOfCombat", false,
    ["Magical Aptitude", "Prestidigitation", "Past Lives", "Paradox"],
    ["Ancient Style", "Empower Spell", "Excellence", "Maximize Spell", "Quicken Spell"], 67],
  Chosen: ["Faith", "levelAndDevotion", "Favor", "favor", "", "outOfCombat", false,
    ["Conviction", "Redeemed", "Divine Power", "Leeway"],
    ["Overbeing", "Divine Protection", "Prayer Strip", "Trial of Faith", "Demigod"], 71],
  Daemonhost: ["Arcanoi", "level", "Essence", "essence", "Resonance", "outOfCombat", false,
    ["Demonic Tutor", "Unholy Might", "Rejected by Creation", "Feeding"],
    ["Daemonic", "Unnatural Characteristics", "Scorn Earth", "Not Of This World", "Black Miracle"], 75],
  Dragonblooded: ["Aspect", "level", "Breath", "breath", "", "outOfCombat", false,
    ["Draconic Aura", "Hot-Blooded", "Claws", "Blood Quickening"],
    ["Dragon Mind", "Dragon Wings", "Dragon Heart", "Dragon Skin", "Maximum Dragoning"], 79],
  Paragon: ["Excellence", "level", "Action Points", "actionPoints", "", "outOfCombat", true,
    ["Destiny", "Statuesque", "Flash", "Perfection"],
    ["Be a Man", "Swift as a Coursing River", "All the Force of a Great Typhoon", "Strength of a Raging Fire",
      "Mysterious as the Dark Side of the Moon"], 83],
  Promethean: ["Generation", "level", "Pyros", "pyros", "", "never", false,
    ["Living Construct", "Refitting", "Disquiet", "Superlative Constitution"],
    ["Integrated Armor", "Integrated Weapons", "Transhuman Potential", "Recharge", "Warstrider"], 87],
  Vampire: ["Blood Potency", "level", "Vitae", "vitae", "", "outOfCombat", false,
    ["Old Money", "Undead Resilience", "Sunlight Weakness", "Blood Dependency"],
    ["Auspex", "Dread", "Celerity", "Potence", "Dominate"], 91],
  Werewolf: ["Feral Heart", "level", "Rage", "rage", "", "anytime", false,
    ["Shifting", "Lycan Resilience", "Spirit Sight", "Silver Bane"],
    ["Fast Healing", "Spirit Walk", "Quick Shift", "Stoking Fury", "Luna's Blessing"], 95],
  Wraith: ["Synergy", "level", "Plasm", "plasm", "", "outOfCombat", false,
    ["Dematerialize", "Second Death", "Deathsight", "Ghost Dice"],
    ["Whispers", "Poltergeist", "Curse", "Shroud", "Ectoplasmic Form"], 99]
};

/** Automated static powers (FR-025); every other static power is text only. */
const STATIC_AUTOMATION = {
  Destiny: "destiny", Statuesque: "statuesque", Perfection: "perfection", "Blood Quickening": "bloodQuickening"
};

const exaltations = readPack("src/packs/exaltations");

describe("exaltations compendium source (spec 004, SC-001)", () => {
  it("contains exactly the 9 exaltations of the 7.7a", () => {
    expect(sorted(exaltations.map((entry) => entry.name))).toEqual(sorted(Object.keys(EXALTATIONS)));
  });

  it("has unique 16-character ids and matching LevelDB keys", () => {
    for (const entry of exaltations) {
      expect(entry._id).toMatch(ID);
      expect(entry._key).toBe(`!items!${entry._id}`);
      expect(entry.type).toBe("exaltation");
      expect(entry.effects).toEqual([]);
    }
    expect(new Set(exaltations.map((entry) => entry._id)).size).toBe(exaltations.length);
  });

  describe.each(exaltations.map((entry) => [entry.name, entry]))("%s", (name, entry) => {
    const [powerStat, cap, resource, formula, debt, healing, pressure, statics, powers, page] = EXALTATIONS[name];
    const system = entry.system;

    it("matches the book's power stat and resource", () => {
      expect(system.powerStat).toEqual({ name: powerStat, cap, value: 1 });
      expect(system.resource.name).toBe(resource);
      expect(system.resource.formula).toBe(formula);
      expect(EXALTATION_FORMULAS).toContain(formula);
      expect(system.resource.debtName).toBe(debt);
      expect(system.resource.healing).toBe(healing);
      expect(system.pressure.enabled).toBe(pressure);
      expect(system.source).toEqual({ book: "DtD 7.7a", page });
      for (const action of system.resource.actions) expect(RESOURCE_ACTIONS).toContain(action.type);
    });

    it("lists the static powers and the 5 powers by rank in book order", () => {
      expect(system.staticPowers.map((power) => power.name)).toEqual(statics);
      for (const power of system.staticPowers) {
        expect(power.automation).toBe(STATIC_AUTOMATION[power.name] ?? "none");
      }
      expect(system.powers.map((power) => power.name)).toEqual(powers);
      expect(system.powers.map((power) => power.rank)).toEqual([1, 2, 3, 4, 5]);
    });

    it("lists the Blood Quickening elements only for the Dragonblooded", () => {
      const elements = system.elements.map((element) => [element.key, element.characteristic, element.hpMax]);
      expect(elements).toEqual(name === "Dragonblooded" ? ELEMENTS : []);
      for (const [, key] of elements) expect(CHARACTERISTICS).toHaveProperty(key);
    });

    it("ships an empty character state", () => {
      expect(system.resource.spent).toBe(0);
      expect(system.round).toEqual({ spent: 0, marker: "none" });
      expect(system.scene).toEqual({ spent: 0 });
      expect(system.pressure.spent).toBe(0);
      expect(system.selection).toEqual({ statuesque: "", element: "" });
      expect(system.fullText).toBe("");
    });

    it("has summaries for every power, the Tell and the lore", () => {
      for (const text of [system.description, system.tell, system.resource.recovery, system.lore.origin]) {
        expect(text.trim()).not.toBe("");
      }
      for (const power of [...system.staticPowers, ...system.powers, ...system.elements]) {
        expect(power.description.trim()).not.toBe("");
      }
    });
  });
});

/**
 * Reference table — spec 004 "Tabela de referência — Exalted Assets" (DtD 7.7a pp. 211–223).
 * group: [exaltation, pages, asset names]
 */
const ASSETS = {
  atlanteanCaste: ["Atlantean", [211], ["Dawn Caste", "Zenith Caste", "Twilight Caste", "Night Caste", "Eclipse Caste"]],
  chosenMark: ["Chosen", [212, 213, 214], [
    "Mark of Acererak", "Mark of Bahamut", "Mark of Chaos", "Mark of Corellon", "Mark of Cuthbert", "Mark of Khorne",
    "Mark of Lolth", "Mark of Luna", "Mark of Malal", "Mark of Moradin", "Mark of Nurgle", "Mark of Order",
    "Mark of Pelor", "Mark of the Council", "Mark of the Omnissiah", "Mark of the Raven", "Mark of Tiamat",
    "Mark of Slaanesh", "Mark of Sigmar", "Mark of Tzeentch", "Mark of Vectron"
  ]],
  daemonhostSin: ["Daemonhost", [215], ["Desire", "Hunger", "Pride", "Rage", "Sloth"]],
  dragonbloodedBloodline: ["Dragonblooded", [216], ["Adamic Dragon", "Blood of Bahamut", "Blood of Io", "Blood of Tiamat", "Double Dragon"]],
  paragon: ["Paragon", [217], ["Action Hero", "Extra Action", "Stuntman", "Martial Prodigy"]],
  paragonRacial: ["Paragon", [218, 219], [
    "You Will Not Falter", "Dark Mirth", "Inner Dragon", "Woodland Magic", "Controlled Warp", "Elven Perfection", "Tuning",
    "Elusive", "Multiclass", "Tengu Dive", "Blood is Power", "Warboss", "Longbeard", "For the Greater Good", "...and Dangerous"
  ]],
  prometheanMaterial: ["Promethean", [220], ["Orichalcum", "Mithril", "Darksteel", "Wraithbone", "Necrodermis"]],
  vampireClan: ["Vampire", [221], ["Brujah", "Malkavian", "Toreador", "Tremere", "Ventrue"]],
  werewolfTribe: ["Werewolf", [222], ["Black Spiral Dancers", "Get of Fenris", "Iron Masters", "Red Talons", "Silent Striders"]],
  wraithHaunting: ["Wraith", [223], ["Children of Ash", "Children of Dust", "Children of Salt", "Children of Silence", "Children of Void"]]
};

/** Race required by each Paragon Racial Asset (pp. 218–219). Tiefling has none. */
const PARAGON_RACES = {
  "You Will Not Falter": "Aasimar", "Dark Mirth": "Dark Eldarin", "Inner Dragon": "Dragonborn", "Woodland Magic": "Dryad",
  "Controlled Warp": "Eldarin", "Elven Perfection": "Elf", Tuning: "Gnome", Elusive: "Halfling", Multiclass: "Human",
  "Tengu Dive": "Kenku", "Blood is Power": "Kobold", Warboss: "Ork", Longbeard: "Squat", "For the Greater Good": "Tau",
  "...and Dangerous": "Thri-Kreen"
};

/** Automated assets (research R6); every other asset is text only. */
const ASSET_AUTOMATED = {
  "Action Hero": "actionHero", "Extra Action": "extraAction", "Blood of Io": "bloodOfIo", Warboss: "warboss",
  Longbeard: "longbeard", "Mark of Nurgle": "markOfNurgle", Sloth: "sloth", Elusive: "elusive"
};

const assetPack = readPack("src/packs/exalted-assets");
const folders = assetPack.filter((doc) => doc._key?.startsWith("!folders!"));
const assets = assetPack.filter((doc) => doc._key?.startsWith("!items!"));

describe("exalted-assets compendium source (spec 004, SC-002)", () => {
  it("has one folder per asset group", () => {
    expect(folders).toHaveLength(ASSET_GROUPS.length);
    expect(sorted(folders.map((folder) => folder.flags.dtd40k.assetGroup))).toEqual(sorted(ASSET_GROUPS));
    for (const folder of folders) {
      expect(folder._id).toMatch(ID);
      expect(folder._key).toBe(`!folders!${folder._id}`);
      expect(folder.type).toBe("Item");
    }
  });

  it("contains the 75 assets of the book, with unique ids", () => {
    expect(assets).toHaveLength(75);
    expect(assetPack).toHaveLength(85);
    const ids = assetPack.map((doc) => doc._id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const asset of assets) {
      expect(asset._id).toMatch(ID);
      expect(asset._key).toBe(`!items!${asset._id}`);
      expect(asset.type).toBe("feat");
      expect(asset.effects).toEqual([]);
    }
  });

  describe.each(Object.entries(ASSETS))("%s", (group, [exaltation, pages, names]) => {
    const members = assets.filter((asset) => asset.system.group === group);
    const folder = folders.find((entry) => entry.flags.dtd40k.assetGroup === group);

    it("has the book's assets in the group folder", () => {
      expect(sorted(members.map((asset) => asset.name))).toEqual(sorted(names));
      for (const asset of members) expect(asset.folder).toBe(folder._id);
    });

    it.each(names)("%s matches the reference table", (assetName) => {
      const { system } = members.find((asset) => asset.name === assetName);
      expect(system.category).toBe("exaltedAsset");
      expect(system.xpCost).toBe(100);
      expect(system.prerequisites.exaltation).toBe(exaltation);
      expect(system.prerequisites.race).toBe(group === "paragonRacial" ? PARAGON_RACES[assetName] : "");
      if (group === "chosenMark") expect(system.prerequisites.deity.trim()).not.toBe("");
      else expect(system.prerequisites.deity).toBe("");
      expect(system.automation).toBe(ASSET_AUTOMATED[assetName] ?? "none");
      expect(ASSET_AUTOMATION).toContain(system.automation);
      expect(system.source.book).toBe("DtD 7.7a");
      expect(pages).toContain(system.source.page);
      expect(system.description.trim()).not.toBe("");
    });
  });

  it("requires only races that exist in the Races compendium", () => {
    const raceNames = races.map((race) => race.name);
    for (const race of Object.values(PARAGON_RACES)) expect(raceNames).toContain(race);
    expect(Object.values(PARAGON_RACES)).not.toContain("Tiefling");
  });
});

/**
 * Reference tables — spec 005 "Tabela de referência" (DtD 7.7a, cap. 7, pp. 174–210).
 */
const RACIAL_FEATS = {
  Aasimar: ["Celestial Wrath", "Made of Mettle", "Terminator Honors"],
  "Dark Eldarin": ["Dark Cruelty", "Recluse", "Warp Fire"],
  Dragonborn: ["Dragonborn Frenzy", "Dragon Sight", "Elder Wyrm's Fire"],
  Dryad: ["Matron", "Photosynthetic", "Treestrider"],
  Eldarin: ["Ancestral Recall", "Extra Warp", "Guess Destination"],
  Elf: ["Elven Precision", "Light Step", "Precise Technique"],
  Gnome: ["Eureka!", "Explorer", "Tinker"],
  Halfling: ["Escape Artist", "Halfling Agility", "Second Chance"],
  Human: ["Able Learner", "Human Perseverance", "Mixed Heritage"],
  Kenku: ["Ace Pilot", "Kenjutsu", "Teacher"],
  Kobold: ["K'sten'mannav", "K'vend'l", "Legal Miner", "Trapmaster"],
  Ork: ["I'm Da Boss!", "Mobbing Up", "WAAAAAGH CRY!"],
  Squat: ["No One Tougher", "Squat Armor Proficiency", "Squat Stability"],
  Tau: ["Farsighted", "Move And Shoot", "Silent Arcana"],
  "Thri-Kreen": ["Lightning Bug", "Mandibles", "Noisy Cricket"],
  Tiefling: ["Beneficial Mutation", "Mutation", "Outsider"]
};
const ASSETS_005 = [
  "Academy", "Ambidextrous", "Androgynous", "Appearance", "Brave", "Dangerous Beauty", "Driven", "Education", "Eagle Eyes",
  "Fast", "Gifted", "Left Handed", "Level Headed", "Linguist", "Magic Resistance", "Nerves o' Steel", "Nine Lives", "Sand",
  "Spirit Mentor", "Sturdy", "Tough as Nails", "Veteran o' the Wheel"
];
const HINDRANCES = [
  "Ailin'", "All Thumbs", "Bad Luck", "Big Britches", "Clueless", "Deathwish", "Enemy", "Geezer", "Grim Servant o' Death",
  "High-Falutin'", "Illiterate", "Impulsive", "Intolerance", "Kid", "Law o' the Stars", "Loco", "Night Terrors", "Slowpoke",
  "Ugly as Sin", "Vengeful", "Wanted", "Wimpy"
];
const FEAT_AUTOMATED = {
  "Sound Constitution": "soundConstitution", Discipline: "discipline", Paranoia: "paranoia", Farsighted: "farsighted",
  "Halfling Agility": "halflingAgility", "No One Tougher": "noOneTougher", "Made of Mettle": "madeOfMettle",
  "Beneficial Mutation": "beneficialMutation", Matron: "matron", Sturdy: "sturdy", Sand: "sand", "Nine Lives": "nineLives",
  "Veteran o' the Wheel": "veteran", "Skill Focus": "skillFocus", "Noisy Cricket": "noisyCricket"
};
const REQUIRES = {
  "Battle Rage": [["feat", "Frenzy"]], Beastmaster: [["feat", "Animal Companion"]],
  "Improved Animal Companion": [["feat", "Animal Companion"]], "Diamond Body": [["feat", "Wholeness of Body"]],
  "Improved Wild Shape": [["feat", "Wild Shape"]], "Nekomimi Mode": [["feat", "Wild Shape"]],
  "Luminen Blast": [["feat", "Mechanicus Implants"]], "Luminen Charge": [["feat", "Mechanicus Implants"]],
  "Improved Weapon Focus": [["feat", "Weapon Focus"]], "Improved Weapon Specialization": [["feat", "Weapon Specialization"]],
  "Greater Spell Focus": [["feat", "Spell Focus"]], "Elven Precision": [["racePower", "Elven Accuracy"]],
  "Precise Technique": [["racePower", "Elven Accuracy"]], "Extra Warp": [["racePower", "Warp Step"]],
  "Guess Destination": [["racePower", "Warp Step"]]
};
const FEAT_GRANTS = {
  Academy: [["Weapon Proficiency", "", true], ["Weapon Proficiency", "", true]],
  Kenjutsu: [["Extracurricular Study", "", false]],
  "K'sten'mannav": [["Armor of Contempt", "", false]],
  "Lightning Bug": [["Luminen Blast", "", false]]
};
const GROUP_OPTIONS = {
  "Armor Proficiency": ["Light", "Medium", "Heavy", "Extreme", "Power"],
  "Weapon Proficiency": ["Basic", "Melee 1", "Melee 2", "Melee 3", "Ranged 1", "Ranged 2", "Throwing"],
  "Wholeness of Body": ["Wisdom", "Constitution"]
};
const REPEATABLE = [
  "Armor Proficiency", "Armor Specialization", "Elemental Shot I", "Elemental Shot II", "Elemental Shot III", "Good Reputation",
  "Greater Spell Focus", "Hatred", "Heightened Senses", "Improved Weapon Focus", "Improved Weapon Specialization", "Peer",
  "Skill Focus", "Speak Language", "Spell Book", "Spell Focus", "Spell Specialization", "Upgraded", "Weapon Focus",
  "Weapon Proficiency", "Weapon Specialization", "Wizard Tradition"
];

const featPack = readPack("src/packs/feats");
const featFolders = featPack.filter((doc) => doc._key?.startsWith("!folders!"));
const feats = featPack.filter((doc) => doc._key?.startsWith("!items!"));
const byName = (name) => feats.find((doc) => doc.name === name);
const ofCategory = (category) => feats.filter((doc) => doc.system.category === category);

describe("feats compendium source (spec 005, SC-001)", () => {
  it("has 274 entries in 20 folders", () => {
    expect(feats).toHaveLength(274);
    expect(featFolders).toHaveLength(20);
    expect(featPack).toHaveLength(294);
  });

  it("counts 181 feats, 49 racial feats, 22 assets and 22 hindrances", () => {
    expect(ofCategory("feat")).toHaveLength(181);
    expect(ofCategory("racialFeat")).toHaveLength(49);
    expect(ofCategory("asset")).toHaveLength(22);
    expect(ofCategory("hindrance")).toHaveLength(22);
  });

  it("has unique ids, matching keys and valid folders", () => {
    const ids = featPack.map((doc) => doc._id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const doc of featPack) {
      expect(doc._id).toMatch(ID);
      expect(doc._key).toBe(`${doc.type === "feat" ? "!items!" : "!folders!"}${doc._id}`);
    }
    const folderIds = new Set(featFolders.map((doc) => doc._id));
    for (const doc of feats) expect(folderIds.has(doc.folder)).toBe(true);
  });

  it("lists the assets and hindrances of the book", () => {
    expect(sorted(ofCategory("asset").map((doc) => doc.name))).toEqual(sorted(ASSETS_005));
    expect(sorted(ofCategory("hindrance").map((doc) => doc.name))).toEqual(sorted(HINDRANCES));
  });

  it.each(Object.entries(RACIAL_FEATS))("has the racial feats of the %s in the race folder", (race, names) => {
    const racial = ofCategory("racialFeat").filter((doc) => doc.system.prerequisites.race === race);
    expect(sorted(racial.map((doc) => doc.name))).toEqual(sorted(names));
    const raceFolder = featFolders.find((doc) => doc.flags.dtd40k.featFolder === `race:${race}`);
    for (const doc of racial) expect(doc.folder).toBe(raceFolder._id);
    expect(races.map((doc) => doc.name)).toContain(race);
  });

  it("uses the XP of the book (feat and asset 100, hindrance +100)", () => {
    for (const doc of feats) {
      const hindrance = doc.system.category === "hindrance";
      expect(doc.system.xpCost).toBe(hindrance ? 0 : 100);
      expect(doc.system.xpGranted).toBe(hindrance ? 100 : 0);
    }
  });

  it("marks the repeatable feats and the feat group options", () => {
    expect(sorted(feats.filter((doc) => doc.system.repeatable).map((doc) => doc.name))).toEqual(sorted(REPEATABLE));
    for (const [name, options] of Object.entries(GROUP_OPTIONS)) {
      expect(byName(name).system.featGroup).toEqual({ enabled: true, options });
    }
    expect(byName("Peer").system.featGroup.enabled).toBe(true);
    expect(byName("Speak Language").system.featGroup.options).toContain("Syrneth");
  });

  it("automates exactly the 15 feats of research R4", () => {
    const automated = Object.fromEntries(feats.filter((doc) => doc.system.automation !== "none").map((doc) => [doc.name, doc.system.automation]));
    expect(automated).toEqual(FEAT_AUTOMATED);
  });

  it("records the dependencies and the grants of the spec", () => {
    const requires = Object.fromEntries(feats.filter((doc) => doc.system.requires.length)
      .map((doc) => [doc.name, doc.system.requires.map(({ type, name }) => [type, name])]));
    expect(requires).toEqual(REQUIRES);
    const grants = Object.fromEntries(feats.filter((doc) => doc.system.grants.length)
      .map((doc) => [doc.name, doc.system.grants.map(({ name, subcategory, choose }) => [name, subcategory, choose])]));
    expect(grants).toEqual(FEAT_GRANTS);
    for (const [, list] of Object.entries(FEAT_GRANTS)) for (const [name] of list) expect(byName(name)).toBeDefined();
  });

  it("ships summaries and an empty selection", () => {
    for (const doc of feats) {
      expect(doc.type).toBe("feat");
      expect(doc.system.description.trim()).not.toBe("");
      expect(doc.system.source.book).toBe("DtD 7.7a");
      expect(doc.system.source.page).toBeGreaterThanOrEqual(179);
      expect(doc.system.source.page).toBeLessThanOrEqual(210);
      expect(doc.system.selection).toEqual({ subcategory: "", characteristic: "", characteristic2: "", skill: "", specialty: "" });
      expect(doc.effects).toEqual([]);
    }
    expect(byName("Peer").system.source.page).toBe(192);
    expect(byName("Halfling Agility").system.source.page).toBe(202);
  });
});

/** Grants of races, exaltations and Exalted Assets — spec 005 "Tabela de concessões". */
const WP_OPTIONS = ["Basic", "Melee 1", "Melee 2", "Melee 3", "Ranged 1", "Ranged 2", "Throwing"];
const AP_OPTIONS = ["Light", "Medium", "Heavy", "Extreme", "Power"];
const ORIGIN_GRANTS = {
  races: {
    Aasimar: [["Jaded", "", false], ["Fearless", "", false]],
    Gnome: [...WP_OPTIONS.map((o) => ["Weapon Proficiency", o, false]), ...AP_OPTIONS.map((o) => ["Armor Proficiency", o, false])]
  },
  exaltations: {
    Atlantean: [["Speak Language", "Syrneth", false, 1]],
    Promethean: AP_OPTIONS.map((o) => ["Armor Proficiency", o, false, 1])
  },
  "exalted-assets": {
    "You Will Not Falter": [["Armor of Contempt", "", false], ["Armor Proficiency", "Power", false], ["Armor Specialization", "Power", false]],
    Tuning: [["Weapon Specialization", "", true], ["Weapon Focus", "", true], ["Armor Specialization", "", true]],
    Ventrue: [["Peer", "Ventrue", false]]
  }
};

describe("feats granted by races, exaltations and Exalted Assets (spec 005, US4)", () => {
  describe.each(Object.entries(ORIGIN_GRANTS))("%s", (pack, expected) => {
    const docs = readPack(`src/packs/${pack}`).filter((doc) => doc.system);

    it("grants exactly the feats of the spec", () => {
      const granting = Object.fromEntries(docs.filter((doc) => doc.system.grants.length).map((doc) => [
        doc.name,
        doc.system.grants.map((g) => (g.rank === undefined ? [g.name, g.subcategory, g.choose] : [g.name, g.subcategory, g.choose, g.rank]))
      ]));
      expect(granting).toEqual(expected);
      for (const doc of docs) expect(Array.isArray(doc.system.grants)).toBe(true);
    });

    it("only grants feats that exist in the Feats compendium, with valid sub-categories", () => {
      for (const doc of docs) {
        for (const grant of doc.system.grants) {
          const target = byName(grant.name);
          expect(target, grant.name).toBeDefined();
          if (grant.subcategory && target.system.featGroup.options.length && grant.name !== "Peer") {
            expect(target.system.featGroup.options).toContain(grant.subcategory);
          }
        }
      }
    });
  });
});

/** Reference — spec 006 "Tabela de referência" (DtD 7.7a, cap. 6, pp. 104–172). */
const CLASS_TRACKS = {
  Assassin: ["Sell-Steel", "Nighthawk", "Assassin", "Freeblade", "Nihilator"],
  "Arcane Knight": ["Spellsword", "Swordmage", "Runeblade", "Arcane Knight", "Sorcerer-Swordsman"],
  Barbarian: ["Feral", "Savage", "Rager", "Barbarian", "Berserker"],
  Bard: ["Minstrel", "Bard", "Skald", "Swashbuckler", "Master Bard"],
  Cleric: ["Priest", "Preacher", "Cleric", "Zealot", "Bishop"],
  Courtier: ["Negotiator", "Courtier", "Diplomat", "Legate", "Emissary"],
  Druid: ["Ovate", "Oak-Knower", "Druid", "Archdruid", "Patriarch"],
  Fighter: ["Swordsman", "Myrmidon", "Fight Guy", "Fighter", "Master Fight Guy"],
  Guardsman: ["Conscript", "Guardsman", "Sergeant", "Grenadier", "Stormtrooper"],
  Heavy: ["Big Shot", "Krazy Ivan", "Heavy Weapons Guy", "Walking Gunshow", "Living Fortress"],
  "Magic User": ["Apprentice", "Aspirant", "Magic User", "Sorcerer", "Master Sorcerer"],
  "Magitek Gunman": ["Spellshooter", "Riflemancer", "Gunmage", "Bulletwizard", "Witch-Sniper"],
  Monk: ["Brother", "Disciple", "Monk", "Immaculate Master", "Grand Master of Flowers"],
  Operator: ["Hunter", "Marksman", "Sniper", "Quickscope", "Targetmaster"],
  Paladin: ["Gallant", "Protector", "Defender", "Paladin", "Chevalier"],
  Sheriff: ["Deputy", "Sheriff", "Constable", "Marshal", "Judge"],
  Techpriest: ["Mech-Wright", "Enginseer", "Tech-Priest", "Technomancer", "Magos"],
  Thief: ["Outcast", "Outlaw", "Renegade", "Rogue", "Stubjack"]
};
const OTHER_CLASSES = {
  Initiate: 1, Mercenary: 1, Peasant: 1, Ratcatcher: 1, Scholar: 1, "Operations Officer": 2, "Science Officer": 2,
  "Tactical Officer": 2, Captain: 3, "Chief Arcana Officer": 3, "Chief of Engineering": 3, "Chief of Security": 3, Commodore: 4
};
const trackOf = (list, value) => Object.fromEntries(list.map((name) => [name, value]));
const COMPLETION_006 = {
  ...trackOf(["Mercenary", "Ratcatcher"], ["hpMax", 2]),
  ...trackOf([...CLASS_TRACKS.Cleric, ...CLASS_TRACKS.Heavy], ["hpMax", 1]),
  ...trackOf(CLASS_TRACKS.Assassin, ["initiative", 1]),
  ...trackOf(CLASS_TRACKS.Courtier, ["resolveMax", 1]),
  ...trackOf(CLASS_TRACKS.Thief, ["staticDefense", 1]),
  ...trackOf(["Initiate", "Scholar"], ["specialty", 0, "any"]),
  ...trackOf(["Captain", "Commodore"], ["specialty", 0, "social"]),
  ...trackOf(CLASS_TRACKS.Bard, ["skillDot", 0])
};
const COMPLETION_GRANTS = {
  ...trackOf(CLASS_TRACKS.Druid, [["Improved Animal Companion", ""], ["Beastmaster", ""]]),
  "Mech-Wright": [["Upgraded", "Rare"]], Enginseer: [["Upgraded", "Rare"]], "Tech-Priest": [["Upgraded", "Very Rare"]],
  Technomancer: [["Upgraded", "Mythic Rare"]], Magos: [["Upgraded", "Artifact"]]
};
const featLabel = (f) => `${f.mandatory ? "" : "*"}${f.name}${f.subcategory ? ` (${f.subcategory})` : ""}${f.orGroup ? ` |${f.orGroup}` : ""}`;

const classPack = readPack("src/packs/classes");
const classFolders = classPack.filter((doc) => doc._key?.startsWith("!folders!"));
const classDocs = classPack.filter((doc) => doc._key?.startsWith("!items!"));
const classByName = (name) => classDocs.find((doc) => doc.name === name);
const featNameSet = new Set(feats.map((doc) => doc.name));

describe("classes compendium source (spec 006, SC-001)", () => {
  it("has 103 classes in 19 folders, 23/21/22/19/18 by Level", () => {
    expect(classDocs).toHaveLength(103);
    expect(classFolders).toHaveLength(19);
    const byLevel = [1, 2, 3, 4, 5].map((level) => classDocs.filter((doc) => doc.system.level === level).length);
    expect(byLevel).toEqual([23, 21, 22, 19, 18]);
  });

  it("has unique ids, matching keys and valid folders", () => {
    const ids = classPack.map((doc) => doc._id);
    expect(new Set(ids).size).toBe(ids.length);
    const folderIds = new Set(classFolders.map((doc) => doc._id));
    for (const doc of classPack) {
      expect(doc._id).toMatch(ID);
      expect(doc._key).toBe(`${doc.type === "class" ? "!items!" : "!folders!"}${doc._id}`);
    }
    for (const doc of classDocs) expect(folderIds.has(doc.folder)).toBe(true);
  });

  it.each(Object.entries(CLASS_TRACKS))("puts the %s track in its folder, Level 1 to 5", (track, names) => {
    const folder = classFolders.find((doc) => doc.flags.dtd40k.classFolder === track);
    for (const [index, name] of names.entries()) {
      const doc = classByName(name);
      expect(doc, name).toBeDefined();
      expect(doc.system.track).toBe(track);
      expect(doc.system.level).toBe(index + 1);
      expect(doc.folder).toBe(folder._id);
    }
  });

  it("keeps the starter and starship classes in Other", () => {
    const folder = classFolders.find((doc) => doc.flags.dtd40k.classFolder === "Other");
    for (const [name, level] of Object.entries(OTHER_CLASSES)) {
      expect(classByName(name).system).toMatchObject({ level, track: "" });
      expect(classByName(name).folder).toBe(folder._id);
    }
  });

  it("matches the book for Swordsman, Fighter, Initiate, Peasant and Nighthawk", () => {
    const sw = classByName("Swordsman").system;
    expect(sw.source.page).toBe(135);
    expect(sw.prerequisites.skills).toEqual([{ keys: ["weaponry"], value: 2 }, { keys: ["athletics"], value: 1 }]);
    expect(sw.characteristics).toEqual(["str", "dex", "con"]);
    expect(sw.skills).toHaveLength(8);
    expect(sw.feats.map(featLabel)).toEqual(["Quick Draw", "*Armor Proficiency (Any)", "Hardy", "Fast Reflexes", "Power Attack", "*Weapon Proficiency (Any)"]);
    expect(sw.swordSchools).toEqual(["Iron Heart", "Diamond Mind", "White Raven", "Stone Dragon"]);
    const fi = classByName("Fighter").system;
    expect(fi.prerequisites.feats).toEqual(["Swift Attack", "Weapon Specialization", "Jaded"]);
    expect(fi.feats.map(featLabel)).toEqual([
      "Fearless", "Iron Jaw", "Combat Master", "Wall of Steel", "*Sound Constitution |or1", "*Cleave |or1",
      "*Weapon Focus (Any)", "Improved Weapon Focus (Any)"
    ]);
    const ini = classByName("Initiate").system;
    expect(ini.prerequisites).toEqual({ skills: [], feats: [], schools: [], text: "" });
    expect(ini.feats.map(featLabel)).toEqual(["Divine Ministration", "Hatred (Heretics)", "Minor Magic", "Peer (Religious Organization)", "*Weapon Proficiency (Basic)"]);
    expect(classByName("Peasant").system.anyCharacteristic).toBe(true);
    expect(classByName("Nighthawk").system.prerequisites.skills[0]).toEqual({ keys: ["weaponry", "ballistics"], value: 2 });
  });

  it("automates the completion bonuses of FR-009", () => {
    for (const doc of classDocs) {
      const { automation, value, skillGroup, grants } = doc.system.completion;
      const expected = COMPLETION_006[doc.name];
      if (expected) {
        expect([automation, value], doc.name).toEqual(expected.slice(0, 2));
        if (expected[2]) expect(skillGroup).toBe(expected[2]);
      } else {
        expect(automation, doc.name).toBe("none");
      }
      expect(grants.map((g) => [g.name, g.subcategory]), doc.name).toEqual(COMPLETION_GRANTS[doc.name] ?? []);
    }
  });

  it("uses only valid keys and feats of the Feats compendium", () => {
    for (const doc of classDocs) {
      const { system } = doc;
      for (const key of system.characteristics) expect(CHARACTERISTICS).toHaveProperty(key);
      for (const key of system.skills) expect(SKILLS).toHaveProperty(key);
      for (const req of system.prerequisites.skills) for (const key of req.keys) expect(SKILLS).toHaveProperty(key);
      for (const feat of system.feats) expect(featNameSet.has(feat.name), `${doc.name}: ${feat.name}`).toBe(true);
      for (const feat of system.prerequisites.feats) expect(featNameSet.has(feat.replace(/\s*\(.*\)$/, "")), `${doc.name}: ${feat}`).toBe(true);
      for (const grant of system.completion.grants) expect(featNameSet.has(grant.name)).toBe(true);
    }
  });

  it("ships descriptions, bonus texts and an empty character state", () => {
    for (const doc of classDocs) {
      expect(doc.type).toBe("class");
      expect(doc.system.description.trim(), doc.name).not.toBe("");
      expect(doc.system.completion.text.trim(), doc.name).not.toBe("");
      expect(doc.system.status).toBe("current");
      expect(doc.system.startedAt).toBe(0);
      expect(doc.system.completion.selection).toEqual({ skill: "", specialty: "" });
      expect(doc.effects).toEqual([]);
    }
  });
});

// ---------- Equipment (spec 007, SC-001; Tabela de referência) ----------

const equipmentPack = readPack("src/packs/equipment");
const equipmentFolders = equipmentPack.filter((doc) => doc._key.startsWith("!folders!"));
const equipment = equipmentPack.filter((doc) => !doc._key.startsWith("!folders!"));
const itemNamed = (name) => equipment.find((doc) => doc.name === name);
const ofType = (type, category) => equipment.filter((doc) => doc.type === type && (!category || doc.system.category === category));

describe("equipment compendium source (spec 007, SC-001)", () => {
  const config = { RARITIES, WEAPON_PROFICIENCIES, WEAPON_QUALITIES };

  it("has the 170 items of chapters XIII–XIV", () => {
    expect(equipment).toHaveLength(170);
    expect(ofType("weapon")).toHaveLength(73);
    expect(ofType("armor")).toHaveLength(10);
    expect(ofType("gear", "gear")).toHaveLength(18);
    expect(ofType("gear", "cybernetic")).toHaveLength(16);
    expect(ofType("gear", "cybernetic").filter((doc) => doc.system.mechadendrite)).toHaveLength(5);
    expect(ofType("gear", "drug")).toHaveLength(16);
    expect(ofType("gear", "material")).toHaveLength(5);
    expect(ofType("gear", "wonder")).toHaveLength(16);
    expect(ofType("gear", "hearthstone")).toHaveLength(16);
  });

  it("counts the weapons by group (28 guns, 17 other ranged, 28 melee)", () => {
    const count = (filter) => ofType("weapon").filter(filter).length;
    const other = ["Primitive", "Launchers", "Grenades and Missiles"];
    expect(count((doc) => doc.system.weaponType === "melee")).toBe(28);
    expect(count((doc) => doc.system.weaponType !== "melee" && other.includes(doc.system.group))).toBe(17);
    expect(count((doc) => doc.system.weaponType !== "melee" && !other.includes(doc.system.group))).toBe(28);
    const groups = {};
    for (const doc of ofType("weapon")) {
      const key = `${doc.system.weaponType === "melee" ? "melee" : "ranged"}:${doc.system.group}`;
      groups[key] = (groups[key] ?? 0) + 1;
    }
    expect(groups).toEqual({
      "ranged:Ordinary": 8, "ranged:Las": 5, "ranged:Plasma": 2, "ranged:Melta": 2, "ranged:Bolter": 3, "ranged:Syrneth": 2,
      "ranged:Exotic": 4, "ranged:Flamer": 2, "ranged:Primitive": 6, "ranged:Launchers": 2, "ranged:Grenades and Missiles": 9,
      "melee:Ordinary": 4, "melee:Parrying": 3, "melee:Cavalry": 3, "melee:Flail": 3, "melee:Fencing": 3, "melee:Two Handed": 3,
      "melee:Syrneth": 3, "melee:Chain": 2, "melee:Shields": 1, "melee:Unarmed": 3
    });
  });

  it("matches the reference items", () => {
    expect(itemNamed("Autopistol").system).toMatchObject({
      weaponType: "pistol", group: "Ordinary", proficiencies: ["Basic", "Ranged 1"], damage: { rolled: 2, kept: 2, type: "I" },
      pen: 0, rof: { single: true, auto: 6 }, range: { value: 30, strMultiplier: 0 }, clip: 12, reload: "Full", rarity: "common",
      source: { page: 323 }
    });
    expect(itemNamed("Hand Cannon").system).toMatchObject({ rarity: "uncommon", qualities: [] });
    expect(itemNamed("Club").system).toMatchObject({ weaponType: "melee", damage: { rolled: 1, kept: 2, type: "I" }, rarity: "ubiquitous" });
    expect(itemNamed("Brass Knuckles").system.qualities.map((q) => q.key)).toEqual(["brawling", "armMounted"]);
    expect(itemNamed("Knife").system).toMatchObject({ weaponType: "melee", thrown: true });
    expect(itemNamed("Frag Grenade").system).toMatchObject({ weaponType: "thrown", range: { strMultiplier: 3 }, qualities: [{ key: "blast", value: 4 }] });
    expect(itemNamed("Grenade Launcher").system).toMatchObject({ ammoGroup: "grenade", damage: { kept: 0 } });
    expect(itemNamed("Carapace").system).toMatchObject({ armorType: "heavy", ap: 7, maxDex: 4, rarity: "uncommon", piece: "", suitOnly: false });
    expect(itemNamed("Mesh").system.maxDex).toBeNull();
    expect(itemNamed("Power Armor").system).toMatchObject({ armorType: "power", ap: 12, maxDex: 2, rarity: "veryRare", suitOnly: true });
    expect(itemNamed("Plate").system.primitive).toBe(true);
    expect(itemNamed("Medkit").system).toMatchObject({ category: "gear", rarity: "uncommon" });
    expect(itemNamed("Slaught").system).toMatchObject({ category: "drug", rarity: "rare", addictivity: "moderate", quantity: 10 });
    expect(itemNamed("Dragon Tear Tiara").system.sockets).toBe(3);
    expect(itemNamed("Bionic Arm").system.location).toBe("arms");
  });

  it("gives the simple items their effects and grants", () => {
    const changes = (name) => itemNamed(name).effects.flatMap((effect) => effect.changes.map((c) => `${c.key}=${c.value}`));
    expect(changes("Power Armor")).toEqual(["system.characteristics.str.value=1", "system.modifiers.resilience=1"]);
    expect(changes("Machinator Array")).toEqual([
      "system.characteristics.str.value=1", "system.characteristics.dex.value=-1", "system.modifiers.resilience=1"
    ]);
    expect(changes("Medkit")).toEqual(["system.modifiers.rolls.skills.medicae.freeRaises=1"]);
    expect(changes("Stone of Healing")).toEqual(["system.modifiers.rolls.skills.medicae.rolled=1", "system.modifiers.rolls.skills.medicae.kept=1"]);
    expect(changes("Bionic Heart")).toEqual(["system.modifiers.armor.gizzards=2"]);
    expect(itemNamed("Bionic Heart").system.grants.map((g) => g.name)).toEqual(["Hardy"]);
    expect(itemNamed("Gem of the Calm Heart").system.grants.map((g) => g.name)).toEqual(["Common Sense"]);
    for (const doc of equipment) {
      for (const effect of doc.effects) {
        expect(effect.transfer).toBe(true);
        expect(effect._key).toBe(`!items.effects!${doc._id}.${effect._id}`);
      }
    }
  });

  it("uses valid keys and non-empty descriptions", () => {
    for (const doc of equipment) {
      expect(Object.keys(config.RARITIES)).toContain(doc.system.rarity);
      expect(doc.system.description, doc.name).toMatch(/^<p>.+<\/p>$/s);
      if (doc.type === "weapon") {
        for (const q of doc.system.qualities) expect(Object.keys(config.WEAPON_QUALITIES), doc.name).toContain(q.key);
        for (const p of doc.system.proficiencies) expect(config.WEAPON_PROFICIENCIES).toContain(p);
      }
    }
  });

  it("has unique ids, matching keys and valid folders", () => {
    const ids = equipmentPack.map((doc) => doc._id);
    expect(new Set(ids).size).toBe(ids.length);
    const folderIds = new Set(equipmentFolders.map((doc) => doc._id));
    expect(equipmentFolders).toHaveLength(33);
    for (const doc of equipment) {
      expect(doc._key).toBe(`!items!${doc._id}`);
      expect(folderIds.has(doc.folder), doc.name).toBe(true);
    }
  });
});

// ---------- Combat tables (spec 008, SC-002) ----------

const tablePack = readPack("src/packs/combat-tables");
const tables = tablePack.filter((doc) => doc._key.startsWith("!tables!"));
const tableNamed = (name) => tables.find((doc) => doc.name === name);
const statusIds = new Set(STATUS_EFFECTS.map((s) => s.id));

describe("combat tables compendium source (spec 008, SC-002)", () => {
  it("has 20 critical tables, the Shock Table, Mental Traumas and the two Warp tables (009) and Degeneration (011) in 4 folders", () => {
    expect(tables).toHaveLength(25);
    expect(tablePack.filter((doc) => doc._key.startsWith("!folders!"))).toHaveLength(4);
    const criticals = tables.filter((doc) => doc.flags.dtd40k.table.kind === "critical");
    expect(criticals).toHaveLength(20);
    for (const type of ["energy", "explosive", "impact", "rending"]) {
      for (const location of ["arm", "body", "gizzards", "head", "legs"]) {
        const table = criticals.find((doc) => doc.flags.dtd40k.table.type === type && doc.flags.dtd40k.table.location === location);
        expect(table, `${type}/${location}`).toBeDefined();
        expect(table.formula).toBe("1d5");
        expect(table.results.map((r) => r.range)).toEqual([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]);
        expect(table.results[4].flags.dtd40k.effect.dead, `${type}/${location} row 5`).toBe(true);
      }
    }
  });

  it("matches reference results and uses valid statuses", () => {
    const energyBody = tableNamed("Critical — Energy — Body");
    expect(energyBody.results[2].flags.dtd40k.effect).toEqual({ statuses: ["prone", "stunned"], rounds: "1d10" });
    expect(tableNamed("Critical — Energy — Gizzards").results[3].flags.dtd40k.effect.dead).toBe(true);
    expect(tableNamed("Critical — Explosive — Legs").results[3].flags.dtd40k.effect.test).toEqual({ characteristic: "con", tn: 20, onFail: "dead" });
    expect(tableNamed("Shock Table").results.map((r) => r.range)).toEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9, 9], [10, 10], [11, 11], [12, 12], [13, 30]]);
    expect(tableNamed("Mental Traumas").results.map((r) => r.range)).toEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9, 9], [10, 10], [11, 11], [12, 12], [13, 13], [14, 30]]);
    for (const table of tables) {
      expect(table._key).toBe(`!tables!${table._id}`);
      for (const result of table.results) {
        expect(result._key).toBe(`!tables.results!${table._id}.${result._id}`);
        expect(result.description).toMatch(/^<p>.+<\/p>$/s);
        for (const id of result.flags.dtd40k.effect.statuses ?? []) expect(statusIds.has(id), id).toBe(true);
      }
    }
  });
});

// ---------- Spells (spec 009, SC-001) ----------

const spellPack = readPack("src/packs/spells");
const spells = spellPack.filter((doc) => doc._key.startsWith("!items!"));
const spellNamed = (name) => spells.find((doc) => doc.name === name);

describe("spells compendium source (spec 009, SC-001)", () => {
  it("has 126 spells in 9 school folders, 14 per school, 3/3/3/3/2 by level", () => {
    expect(spells).toHaveLength(126);
    expect(spellPack.filter((doc) => doc._key.startsWith("!folders!"))).toHaveLength(9);
    for (const school of Object.keys(MAGIC_SCHOOLS)) {
      const list = spells.filter((doc) => doc.system.school === school);
      expect(list, school).toHaveLength(14);
      expect([1, 2, 3, 4, 5].map((level) => list.filter((doc) => doc.system.level === level).length)).toEqual([3, 3, 3, 3, 2]);
    }
  });

  it("matches the reference spells", () => {
    expect(spellNamed("Magic Missile").system).toMatchObject({
      school: "evocation", level: 1, tn: { value: 15, special: "" }, action: "half", keywords: ["attack", "comboOk", "somatic"],
      duration: { type: "instant" }, range: "30m", damage: { rolled: 2, kept: 1, type: "E" }, source: { page: 245 }
    });
    expect(spellNamed("Armoring Aura").system.automation).toEqual({
      target: "target", changes: [{ key: "system.modifiers.combat.aura", value: 1, perRaise: 1, perLevel: 0, capLevelMultiplier: 3 }], statuses: []
    });
    expect(spellNamed("Scry").system.duration).toMatchObject({ type: "concentration", concentration: "half" });
    expect(spellNamed("Energy Burst").system.damage).toMatchObject({ rolled: 3, kept: 2, perLevelRolled: 2 });
    expect(spellNamed("Detect Thoughts").system.tn.special).toBe("mentalDefense");
    expect(spellNamed("Blindness").system).toMatchObject({ save: "wil", automation: { statuses: ["blinded"] } });
  });

  it("uses valid keywords and has descriptions, unique ids and folders", () => {
    const folderIds = new Set(spellPack.filter((doc) => doc._key.startsWith("!folders!")).map((doc) => doc._id));
    for (const doc of spells) {
      for (const k of doc.system.keywords) expect(SPELL_KEYWORDS).toContain(k);
      expect(doc.system.description, doc.name).toMatch(/^<p>.+<\/p>$/s);
      expect(folderIds.has(doc.folder), doc.name).toBe(true);
    }
    expect(new Set(spells.map((doc) => doc._id)).size).toBe(126);
  });

  it("has the Warp tables", () => {
    const phenomena = tableNamed("Psychic Phenomena");
    const perils = tableNamed("Perils of the Warp");
    expect(phenomena.results).toHaveLength(26);
    expect(phenomena.results.at(-1).flags.dtd40k.effect).toEqual({ perils: true });
    expect(perils.results).toHaveLength(18);
    expect(perils.results.at(-1)).toMatchObject({ range: [100, 100], flags: { dtd40k: { effect: { dead: true } } } });
  });
});

const martialPack = readPack("src/packs/martial-schools");
const martial = martialPack.filter((doc) => doc._key.startsWith("!items!"));
const schoolNamed = (name) => martial.find((doc) => doc.name === name);

describe("martial-schools compendium source (spec 010, SC-001)", () => {
  it("has the 9 Sword Schools and 6 Gun Kata in 2 folders, 9 entries over ranks 1–5 each", () => {
    expect(martial).toHaveLength(15);
    expect(martial.filter((doc) => doc.system.kind === "sword")).toHaveLength(9);
    expect(martial.filter((doc) => doc.system.kind === "gunKata")).toHaveLength(6);
    expect(martialPack.filter((doc) => doc._key.startsWith("!folders!"))).toHaveLength(2);
    expect(sorted(martial.map((doc) => doc.system.key))).toEqual(sorted(Object.keys(MARTIAL_SCHOOLS)));
    for (const doc of martial) {
      expect(doc.system.entries, doc.name).toHaveLength(9);
      expect(sorted(new Set(doc.system.entries.map((e) => e.rank)))).toEqual([1, 2, 3, 4, 5]);
      expect(doc.system.keySkill).toBe(MARTIAL_SCHOOLS[doc.system.key].skill);
      expect(doc.name).toBe(MARTIAL_SCHOOLS[doc.system.key].name);
    }
  });

  it("matches the reference schools", () => {
    const desert = schoolNamed("Desert Wind").system;
    expect(desert).toMatchObject({ kind: "sword", keySkill: "athletics", weaponGroup: "Syrneth", source: { page: 263 } });
    expect(desert.entries.map((e) => [e.rank, e.type, e.name, e.cost])).toEqual([
      [1, "weapon", "Weapon (Syrneth)", -1], [1, "action", "Action (Multiple Attacks)", null], [2, "flaw", "Empty Hand", -2],
      [2, "advantage", "Blistering Flourish", 1], [3, "skill", "Skill (Athletics)", -1], [3, "advantage", "Burning Blade", 2],
      [4, "mastery", "Mastery (Zephyr Dance)", null], [4, "advantage", "Leaping Flame", 1], [5, "advantage", "Holocaust Cloak", 4]
    ]);
    expect(desert.entries.find((e) => e.name === "Blistering Flourish").automation).toEqual({ onHit: [{ condition: "dazed", rounds: "perRaise" }] });
    expect(desert.entries.find((e) => e.name === "Burning Blade").automation).toEqual({ quality: { key: "incendiary" } });
    const clay = schoolNamed("Clay Pigeon").system;
    expect(clay).toMatchObject({ kind: "gunKata", keySkill: "performer", weaponGroup: "", source: { page: 274 } });
    expect(clay.entries.find((e) => e.name === "Ocelot's Roar").automation).toEqual({ requires: { weaponType: "pistol" } });
    const ox = schoolNamed("Devoted Spirit").system.entries.find((e) => e.type === "mastery");
    expect(ox.automation).toEqual({ changes: [{ key: "system.modifiers.hpMax", value: 4 }] });
    expect(schoolNamed("Devoted Spirit").system.entries.find((e) => e.name === "Revitalizing Strike").variableCost).toEqual([1, 3]);
    expect(schoolNamed("Setting Sun").system.entries.find((e) => e.name === "Knockout Blow")).toMatchObject({ cost: 2, perPoint: true });
  });

  it("uses valid entry types, actions, qualities, skills and weapon groups", () => {
    const groups = new Set(readPack("src/packs/equipment").filter((doc) => doc.type === "weapon").map((doc) => doc.system.group));
    const actions = new Set(COMBAT_ACTIONS.map((a) => a.key));
    const folderIds = new Set(martialPack.filter((doc) => doc._key.startsWith("!folders!")).map((doc) => doc._id));
    for (const doc of martial) {
      expect(folderIds.has(doc.folder), doc.name).toBe(true);
      expect(doc.system.description, doc.name).toMatch(/^<p>.+<\/p>$/s);
      if (doc.system.weaponGroup) expect(groups.has(doc.system.weaponGroup), doc.name).toBe(true);
      expect(new Set(doc.system.entries.map((e) => e.id)).size, doc.name).toBe(9);
      for (const e of doc.system.entries) {
        expect(MARTIAL_ENTRY_TYPES).toContain(e.type);
        expect(e.effect, `${doc.name}: ${e.name}`).not.toBe("");
        const a = e.automation;
        if (a.unlocksAction) expect(actions.has(a.unlocksAction), e.name).toBe(true);
        if (a.quality) expect(WEAPON_QUALITIES[a.quality.key], e.name).toBeDefined();
        if (a.test) expect(SKILLS[a.test.skill], e.name).toBeDefined();
        if (a.requires?.weaponGroup) expect(groups.has(a.requires.weaponGroup), e.name).toBe(true);
        for (const hit of a.onHit ?? []) if (hit.condition) expect(STATUS_EFFECTS.map((s) => s.id), e.name).toContain(hit.condition);
        if (e.type === "action") expect(e.cost).toBeNull();
        if (["weapon", "flaw", "skill"].includes(e.type)) expect(e.cost, e.name).toBeLessThan(0);
      }
    }
  });
});

const deityPack = readPack("src/packs/deities");
const deities = deityPack.filter((doc) => doc._key.startsWith("!items!"));
const deityNamed = (name) => deities.find((doc) => doc.name === name);

describe("deities compendium source (spec 011, SC-001)", () => {
  it("has 21 deities in 3 pantheon folders, 7 each", () => {
    expect(deities).toHaveLength(21);
    expect(deityPack.filter((doc) => doc._key.startsWith("!folders!"))).toHaveLength(3);
    for (const pantheon of Object.keys(PANTHEONS)) expect(deities.filter((doc) => doc.system.pantheon === pantheon), pantheon).toHaveLength(7);
    expect(sorted(deities.filter((d) => d.system.pantheon === "grayCouncil").map((d) => d.name))).toEqual(
      ["Acerath", "Corellon", "Lolth", "Luna", "Raven Queen", "Unaligned", "Vectron"]
    );
  });

  it("matches the reference deities", () => {
    expect(deityNamed("Slaanesh").system).toMatchObject({
      pantheon: "ruinousPowers", keywords: ["Excellence", "Experience", "Excess", "Self-Indulgence", "Pride"],
      directivesTitle: "Emancipation of Slaanesh", source: { page: 295 }
    });
    expect(deityNamed("Slaanesh").system.cults.map((c) => c.name)).toEqual(["Noise Marines", "The S Academy"]);
    expect(deityNamed("Sigmar").system.pantheon).toBe("blessedPantheon");
  });

  it("has 3 commandments, 5 keywords, 5 directives and 2 cults each, descriptions and folders", () => {
    const folderIds = new Set(deityPack.filter((doc) => doc._key.startsWith("!folders!")).map((doc) => doc._id));
    for (const doc of deities) {
      const s = doc.system;
      expect(s.commandments.length, doc.name).toBeGreaterThanOrEqual(3);
      expect(s.keywords, doc.name).toHaveLength(5);
      expect(s.directives, doc.name).toHaveLength(5);
      expect(s.cults, doc.name).toHaveLength(2);
      expect(s.description, doc.name).toMatch(/^<p>.+<\/p>$/s);
      expect(folderIds.has(doc.folder), doc.name).toBe(true);
    }
  });

  it("has the Degeneration table with its automation", () => {
    const table = tableNamed("Degeneration");
    expect(table.results).toHaveLength(16);
    expect(table.flags.dtd40k.table.kind).toBe("degeneration");
    expect(table.results[0]).toMatchObject({ range: [1, 7], flags: { dtd40k: { effect: { characteristic: "dex", value: -1 } } } });
    expect(table.results.at(-1)).toMatchObject({ range: [91, 100], flags: { dtd40k: { effect: { derangement: "minor" } } } });
    const chars = Object.keys(CHARACTERISTICS);
    for (const r of table.results) {
      const e = r.flags.dtd40k.effect;
      if (e.characteristic) expect(chars).toContain(e.characteristic);
    }
    expect(table.results.find((r) => r.name.includes("Horrific Nightmare")).flags.dtd40k.effect).toEqual({ hindrance: "Night Terrors" });
    expect(table.results.find((r) => r.name.includes("Skin Affliction")).flags.dtd40k.effect).toEqual({ social: { rolled: -2 } });
  });
});
