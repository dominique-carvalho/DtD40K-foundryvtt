import { describe, expect, it } from "vitest";
import {
  CHARACTERISTIC_GRID, CHARACTERISTICS, DERIVED_KEYS, DTD, GROUPS, MAX_RATING, RACE_POWER_AUTOMATION, SKILLS
} from "../../module/config.mjs";

describe("CHARACTERISTIC_GRID (classic sheet layout, FR-023)", () => {
  it("has the Power/Finesse/Resistance rows and Mental/Physical/Social columns", () => {
    expect(CHARACTERISTIC_GRID.rows).toEqual(["power", "finesse", "resistance"]);
    expect(CHARACTERISTIC_GRID.columns).toEqual(["mental", "physical", "social"]);
  });

  it("places each characteristic in the official sheet cell", () => {
    expect(CHARACTERISTIC_GRID.cells).toEqual({
      power: ["int", "str", "cha"],
      finesse: ["wis", "dex", "fel"],
      resistance: ["wil", "con", "cmp"]
    });
  });

  it("uses every characteristic exactly once, in the column matching its group", () => {
    const all = CHARACTERISTIC_GRID.rows.flatMap((row) => CHARACTERISTIC_GRID.cells[row]);
    expect([...all].sort()).toEqual(Object.keys(CHARACTERISTICS).sort());
    for (const row of CHARACTERISTIC_GRID.rows) {
      CHARACTERISTIC_GRID.cells[row].forEach((key, col) => {
        expect(CHARACTERISTICS[key].group).toBe(CHARACTERISTIC_GRID.columns[col]);
      });
    }
  });
});

describe("CHARACTERISTICS", () => {
  it("defines the 9 characteristics with their groups", () => {
    expect(Object.keys(CHARACTERISTICS)).toEqual([
      "str", "dex", "con", "cha", "fel", "cmp", "int", "wis", "wil"
    ]);
    const byGroup = (group) => Object.keys(CHARACTERISTICS).filter((k) => CHARACTERISTICS[k].group === group);
    expect(byGroup("physical")).toEqual(["str", "dex", "con"]);
    expect(byGroup("social")).toEqual(["cha", "fel", "cmp"]);
    expect(byGroup("mental")).toEqual(["int", "wis", "wil"]);
  });

  it("uses i18n label keys", () => {
    for (const [key, def] of Object.entries(CHARACTERISTICS)) {
      expect(def.label).toBe(`DTD.Characteristic.${key}`);
      expect(def.abbr).toBe(`DTD.CharacteristicAbbr.${key}`);
    }
  });
});

describe("SKILLS", () => {
  it("defines exactly 27 skills", () => {
    expect(Object.keys(SKILLS)).toHaveLength(27);
  });

  it("marks exactly the 7 advanced skills (DtD 7.7a p. 25)", () => {
    const advanced = Object.keys(SKILLS).filter((k) => SKILLS[k].advanced).sort();
    expect(advanced).toEqual([
      "academicLore", "commonLore", "forbiddenLore",
      "medicae", "pilot", "politics", "techUse"
    ]);
  });

  it("follows DtD 7.7a for Acrobatics (basic) and Athletics (Strength)", () => {
    expect(SKILLS.acrobatics.advanced).toBe(false);
    expect(SKILLS.athletics.characteristic).toBe("str");
  });

  it("treats Arcana as a basic skill (spec clarification)", () => {
    expect(SKILLS.arcana.advanced).toBe(false);
  });

  it("gives every skill a valid characteristic, group and label", () => {
    for (const [key, def] of Object.entries(SKILLS)) {
      expect(CHARACTERISTICS).toHaveProperty(def.characteristic);
      expect(GROUPS).toContain(def.group);
      expect(def.label).toBe(`DTD.Skill.${key}`);
    }
  });

  it("has 9 skills per group", () => {
    for (const group of GROUPS) {
      expect(Object.values(SKILLS).filter((s) => s.group === group)).toHaveLength(9);
    }
  });
});

describe("DERIVED_KEYS", () => {
  it("lists the 7 derived values (Max Fatigue added in DtD 7.7a)", () => {
    expect(DERIVED_KEYS).toEqual([
      "staticDefense", "hpMax", "mentalDefense", "resolveMax", "speed", "resilience", "fatigueMax"
    ]);
  });
});

describe("race constants (002)", () => {
  it("lists the racial power automation modes", () => {
    expect(RACE_POWER_AUTOMATION).toEqual(["none", "usesPerScene", "heroicHeritage", "shifty", "squatToughness"]);
  });

  it("caps ratings at 6", () => {
    expect(MAX_RATING).toBe(6);
  });

  it("exposes both in DTD", () => {
    expect(DTD.RACE_POWER_AUTOMATION).toBe(RACE_POWER_AUTOMATION);
    expect(DTD.MAX_RATING).toBe(MAX_RATING);
  });
});

describe("exaltation and feat constants (004)", () => {
  const expected = {
    EXALTATION_FORMULAS: ["motes", "favor", "essence", "breath", "actionPoints", "pyros", "vitae", "rage", "plasm", "fixed"],
    EXALTATION_POWER_AUTOMATION: ["none", "destiny", "statuesque", "perfection", "bloodQuickening"],
    RESOURCE_ACTIONS: ["restoreAll", "regain", "lose", "unravel"],
    RESOURCE_HEALING: ["outOfCombat", "anytime", "never"],
    POWER_STAT_CAPS: ["level", "levelAndDevotion"],
    FEAT_CATEGORIES: ["feat", "racialFeat", "asset", "hindrance", "exaltedAsset"],
    ASSET_GROUPS: [
      "atlanteanCaste", "chosenMark", "daemonhostSin", "dragonbloodedBloodline", "paragon", "paragonRacial",
      "prometheanMaterial", "vampireClan", "werewolfTribe", "wraithHaunting"
    ],
    ASSET_AUTOMATION: ["none", "actionHero", "extraAction", "bloodOfIo", "warboss", "longbeard", "markOfNurgle", "sloth", "elusive"],
    LIMIT_EXEMPT_GROUPS: ["paragon", "paragonRacial"],
    GENERIC_SPENDS: ["heal", "skill", "reaction", "stunned", "dazed"]
  };

  for (const [name, value] of Object.entries(expected)) {
    it(`${name} matches the spec and is exposed in DTD`, () => {
      expect(DTD[name]).toEqual(value);
    });
  }
});

describe("feat constants (005)", () => {
  it("adds the feat automations after the Exalted Asset ones", () => {
    expect(DTD.FEAT_AUTOMATION).toEqual([
      ...DTD.ASSET_AUTOMATION,
      "soundConstitution", "discipline", "paranoia", "farsighted", "halflingAgility", "noOneTougher", "madeOfMettle",
      "beneficialMutation", "matron", "sturdy", "sand", "nineLives", "veteran", "skillFocus", "noisyCricket"
    ]);
  });

  it("limits hindrances to two (p. 179) and lists the requirement types", () => {
    expect(DTD.HINDRANCE_LIMIT).toBe(2);
    expect(DTD.FEAT_REQUIREMENT_TYPES).toEqual(["feat", "racePower"]);
  });
});

describe("class and XP constants (006)", () => {
  it("lists the completion automations, the class states and the XP costs of pp. 15–16", () => {
    expect(DTD.CLASS_COMPLETION).toEqual(["none", "hpMax", "initiative", "resolveMax", "staticDefense", "specialty", "skillDot"]);
    expect(DTD.CLASS_STATUS).toEqual(["current", "completed"]);
    expect(DTD.XP_COSTS).toEqual({ characteristic: 200, newSkill: 100, skill: 50, feat: 100, asset: 100, powerStat: 300 });
    expect(DTD.STARTING_XP).toBe(600);
    expect(DTD.FREE_STUDY_MULTIPLIER).toBe(2);
    expect(DTD.XP_KINDS).toEqual(["characteristic", "skill", "feat", "asset", "powerStat", "school", "combo", "martial", "specialAttack", "background"]);
  });
});

describe("equipment constants (007)", () => {
  it("orders the 12 rarity steps with their Wealth Test TNs (p. 315)", () => {
    expect(Object.keys(DTD.RARITIES)).toEqual([
      "worthless", "ubiquitous", "veryCommon", "common", "uncommon", "rare", "veryRare", "mythicRare", "nearUnique",
      "fabulousMax", "irrationallyExpensive", "glittergold"
    ]);
    expect(Object.values(DTD.RARITIES).map((r) => r.tn)).toEqual([0, 2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
    for (const [key, def] of Object.entries(DTD.RARITIES)) {
      expect(def.label).toBe(`DTD.Rarity.${key}`);
      expect(def.time).toBe(`DTD.Rarity.Time.${key}`);
    }
  });

  it("lists craftsmanship, weapon types, proficiencies and damage types", () => {
    expect(DTD.CRAFTSMANSHIP).toEqual({ poor: -5, common: 0, good: 5, best: 10 });
    expect(DTD.WEAPON_TYPES).toEqual(["melee", "thrown", "pistol", "basic", "heavy"]);
    expect(DTD.WEAPON_PROFICIENCIES).toEqual(["Basic", "Melee 1", "Melee 2", "Melee 3", "Ranged 1", "Ranged 2", "Throwing"]);
    expect(DTD.DAMAGE_TYPES).toEqual(["E", "X", "R", "I"]);
  });

  it("defines the 36 weapon qualities with i18n keys", () => {
    expect(Object.keys(DTD.WEAPON_QUALITIES)).toHaveLength(36);
    for (const [key, def] of Object.entries(DTD.WEAPON_QUALITIES)) {
      expect(def.label).toBe(`DTD.Quality.${key}.label`);
      expect(def.hint).toBe(`DTD.Quality.${key}.hint`);
    }
    expect(DTD.WEAPON_QUALITIES.proven.hasValue).toBe(true);
    expect(DTD.WEAPON_QUALITIES.blast.hasValue).toBe(true);
  });

  it("lists armor types and pieces, hit locations and gear categories", () => {
    expect(DTD.ARMOR_TYPES).toEqual(["light", "medium", "heavy", "extreme", "power"]);
    expect(DTD.ARMOR_PIECES).toEqual(["head", "body", "arms", "legs"]);
    expect(Object.values(DTD.HIT_LOCATIONS)).toEqual([
      "leftLeg", "rightLeg", "body", "body", "body", "body", "gizzards", "leftArm", "rightArm", "head"
    ]);
    expect(DTD.GEAR_CATEGORIES).toEqual(["gear", "cybernetic", "drug", "material", "wonder", "hearthstone"]);
  });

  it("lists materials, addictivity, addiction levels, starting slots and Wealth Strain", () => {
    expect(Object.keys(DTD.MATERIALS)).toEqual(["orichalcum", "mithril", "darksteel", "wraithbone", "necrodermis"]);
    expect(DTD.ADDICTIVITY).toEqual({ none: 0, low: 10, moderate: 15, high: 20, extreme: 25 });
    expect(DTD.ADDICTION_LEVELS).toEqual(["none", "minor", "moderate", "major"]);
    expect(DTD.STARTING_SLOTS).toEqual({ rare: 1, uncommon: 1, common: 2, veryCommon: 2 });
    expect(DTD.WEALTH_STRAIN.map((s) => [s.min, s.penalty])).toEqual([[11, 5], [10, 3], [7, 1], [1, 0]]);
  });
});

describe("combat constants (008)", () => {
  it("defines the conditions and action effects as status effects with i18n names", () => {
    const ids = DTD.STATUS_EFFECTS.map((s) => s.id);
    expect(ids).toEqual([
      "blinded", "bloodLoss", "dazed", "deafened", "diseased", "onFire", "helpless", "immobilized", "pinned", "prone",
      "restrained", "stunned", "surprised", "unconscious", "dead", "grappled", "jaded", "lostHand", "lostArm", "lostEye",
      "lostFoot", "lostLeg", "fullDefense", "fightDefensively", "allOutAttack", "healingSurge", "running"
    ]);
    for (const s of DTD.STATUS_EFFECTS) {
      expect(s.name).toBe(`DTD.Condition.${s.id}`);
      expect(s.img).toMatch(/^icons\/svg\/.+\.svg$/);
    }
    const changes = (id) => DTD.STATUS_EFFECTS.find((s) => s.id === id).changes.map((c) => `${c.key}=${c.value}`);
    expect(changes("dazed")).toEqual(["system.modifiers.rolls.all.rolled=-1"]);
    expect(changes("fullDefense")).toEqual(["system.modifiers.combat.sd=10", "system.modifiers.combat.reactions=2"]);
    expect(changes("healingSurge")).toEqual(["system.modifiers.combat.sd=5"]);
    for (const id of DTD.UNTIL_NEXT_TURN) expect(ids).toContain(id);
  });

  it("maps damage types, locations, Fear TNs, action types and the Resolve limit", () => {
    expect(DTD.DAMAGE_TABLE_TYPES).toEqual({ E: "energy", X: "explosive", I: "impact", R: "rending" });
    expect(DTD.CRITICAL_LOCATIONS.leftArm).toBe("arm");
    expect(DTD.CRITICAL_LOCATIONS.rightLeg).toBe("legs");
    expect(DTD.FEAR_TN).toEqual({ 1: 15, 2: 20, 3: 25, 4: 30, 5: 35 });
    expect(DTD.ACTION_TYPES).toEqual(["half", "full", "free", "reaction", "varies"]);
    expect(DTD.ACTION_SUBTYPES).toContain("provokes");
    expect(DTD.RESOLVE_DRAIN_LIMIT).toBe(4);
  });
});

describe("magic constants (009)", () => {
  it("lists the nine schools with their characteristic (pp. 227–228)", () => {
    expect(Object.fromEntries(Object.entries(DTD.MAGIC_SCHOOLS).map(([k, v]) => [k, v.characteristic]))).toEqual({
      abjuration: "wil", conjuration: "wil", divination: "wis", enchantment: "cha", evocation: "cha", healing: "wis",
      illusion: "int", necromancy: "int", transmutation: "wis"
    });
    for (const [key, def] of Object.entries(DTD.MAGIC_SCHOOLS)) expect(def.label).toBe(`DTD.Magic.School.${key}`);
    expect(DTD.MAGIC_SCHOOLS.evocation.name).toBe("Evocation");
  });

  it("lists keywords, actions, durations, strengths, Push limits and XP", () => {
    expect(DTD.SPELL_KEYWORDS).toHaveLength(13);
    expect(DTD.SPELL_ACTIONS).toEqual(["half", "full", "reaction", "free", "halfOrReaction"]);
    expect(DTD.SPELL_DURATIONS).toContain("concentration");
    expect(DTD.CAST_STRENGTHS).toEqual(["fettered", "unfettered", "push"]);
    expect(DTD.MAX_PUSH).toEqual({ sanctioned: 3, unsanctioned: 4 });
    expect(DTD.MAGIC_XP).toEqual({ newSchool: 200, perRank: 100, comboPerLevel: 50 });
  });
});

describe("martial constants (010)", () => {
  it("lists the nine Sword Schools and six Gun Kata with their key skill (pp. 263–279)", () => {
    const schools = DTD.MARTIAL_SCHOOLS;
    expect(Object.keys(schools)).toHaveLength(15);
    expect(Object.values(schools).filter((s) => s.kind === "sword")).toHaveLength(9);
    expect(Object.values(schools).filter((s) => s.kind === "gunKata")).toHaveLength(6);
    expect(Object.fromEntries(Object.entries(schools).map(([k, v]) => [k, v.skill]))).toEqual({
      desertWind: "athletics", devotedSpirit: "medicae", diamondMind: "scrutiny", ironHeart: "perception",
      settingSun: "deceive", shadowHand: "stealth", stoneDragon: "intimidation", tigerClaw: "acrobatics",
      whiteRaven: "command", clayPigeon: "performer", crisisZone: "techUse", elementalGearbolt: "arcana",
      pointBlank: "athletics", silentScope: "perception", tinStar: "scrutiny"
    });
    for (const [key, def] of Object.entries(schools)) {
      expect(def.label).toBe(`DTD.Martial.School.${key}`);
      expect(DTD.SKILLS[def.skill]).toBeDefined();
    }
    expect(schools.desertWind.name).toBe("Desert Wind");
  });

  it("lists entry types and the XP per style point", () => {
    expect(DTD.MARTIAL_ENTRY_TYPES).toEqual(["action", "weapon", "flaw", "skill", "advantage", "mastery"]);
    expect(DTD.MARTIAL_XP).toEqual({ perStylePoint: 50 });
  });
});

describe("background and alignment constants (011)", () => {
  it("lists the three pantheons and the eleven Backgrounds (pp. 280–287)", () => {
    expect(Object.keys(DTD.PANTHEONS)).toEqual(["ruinousPowers", "blessedPantheon", "grayCouncil"]);
    expect(Object.keys(DTD.BACKGROUNDS)).toEqual(["allies", "artifact", "backing", "contacts", "fame", "followers", "holdings", "inheritance", "mentor", "status", "wealth"]);
    expect(Object.entries(DTD.BACKGROUNDS).filter(([, b]) => b.multiple).map(([k]) => k)).toEqual(["artifact", "backing"]);
    for (const [key, def] of Object.entries(DTD.BACKGROUNDS)) expect(def.label).toBe(`DTD.Background.${key}.label`);
  });

  it("prices Backgrounds at creation and sizes Inheritance picks (pp. 15–16, 282)", () => {
    expect(DTD.BACKGROUND_XP).toEqual({ freeDots: 7, freeMax: 3, low: 50, high: 100, artifactCreationMax: 5 });
    expect(DTD.INHERITANCE_SLOTS).toEqual({ ubiquitous: 0.125, veryCommon: 0.25, common: 0.5, uncommon: 1, rare: 2, veryRare: 4, mythicRare: 8, anyNonArtifact: 16 });
  });
});
