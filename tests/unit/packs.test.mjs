import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ASSET_AUTOMATION, ASSET_GROUPS, CHARACTERISTICS, EXALTATION_FORMULAS, RACE_POWER_AUTOMATION, RESOURCE_ACTIONS, SKILLS
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
