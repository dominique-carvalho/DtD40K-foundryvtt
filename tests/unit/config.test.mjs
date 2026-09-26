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
