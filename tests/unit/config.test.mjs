import { describe, expect, it } from "vitest";
import { CHARACTERISTIC_GRID, CHARACTERISTICS, DERIVED_KEYS, GROUPS, SKILLS } from "../../module/config.mjs";

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

  it("marks exactly the 8 advanced skills", () => {
    const advanced = Object.keys(SKILLS).filter((k) => SKILLS[k].advanced).sort();
    expect(advanced).toEqual([
      "academicLore", "acrobatics", "commonLore", "forbiddenLore",
      "medicae", "pilot", "politics", "techUse"
    ]);
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
  it("lists the 6 derived values", () => {
    expect(DERIVED_KEYS).toEqual([
      "staticDefense", "hpMax", "mentalDefense", "resolveMax", "speed", "resilience"
    ]);
  });
});
