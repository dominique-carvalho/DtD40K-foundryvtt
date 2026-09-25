import { describe, expect, it } from "vitest";
import { buildDots, filterSkills, nextBaseValue, nextDotValue, sanitizeDerivedMods } from "../../module/rules/sheet.mjs";

describe("buildDots", () => {
  it("returns 6 dots, filling the first N and flagging the 6th as superhuman", () => {
    const dots = buildDots(3);
    expect(dots).toHaveLength(6);
    expect(dots.map((d) => d.filled)).toEqual([true, true, true, false, false, false]);
    expect(dots.map((d) => d.index)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(dots.map((d) => d.superhuman)).toEqual([false, false, false, false, false, true]);
  });

  it("fills nothing for 0 and everything for 6", () => {
    expect(buildDots(0).some((d) => d.filled)).toBe(false);
    expect(buildDots(6).every((d) => d.filled)).toBe(true);
  });

  it("accepts a custom maximum", () => {
    expect(buildDots(2, 5)).toHaveLength(5);
  });
});

describe("nextDotValue (FR-025)", () => {
  it("sets the value to the clicked dot", () => {
    expect(nextDotValue(3, 4)).toBe(4);
    expect(nextDotValue(3, 1)).toBe(1);
  });

  it("lowers by one when clicking the current value", () => {
    expect(nextDotValue(3, 3)).toBe(2);
    expect(nextDotValue(1, 1)).toBe(0);
  });

  it("never goes below 0", () => {
    expect(nextDotValue(0, 0)).toBe(0);
  });
});

describe("filterSkills (FR-027)", () => {
  const entries = [
    { key: "academicLore", name: "Academic Lore", value: 0 },
    { key: "commonLore", name: "Common Lore", value: 2 },
    { key: "forbiddenLore", name: "Forbidden Lore", value: 1 },
    { key: "athletics", name: "Athletics", value: 3 },
    { key: "persuasion", name: "Perícia Persuasão", value: 0 }
  ];
  const keys = (list) => list.map((e) => e.key);

  it("returns everything without filters", () => {
    expect(filterSkills(entries)).toHaveLength(5);
  });

  it("matches the query case-insensitively", () => {
    expect(keys(filterSkills(entries, { query: "LORE" }))).toEqual(["academicLore", "commonLore", "forbiddenLore"]);
  });

  it("ignores accents in both query and name", () => {
    expect(keys(filterSkills(entries, { query: "pericia" }))).toEqual(["persuasion"]);
    expect(keys(filterSkills(entries, { query: "persuasão" }))).toEqual(["persuasion"]);
  });

  it("keeps only trained skills (value >= 1)", () => {
    expect(keys(filterSkills(entries, { onlyTrained: true }))).toEqual(["commonLore", "forbiddenLore", "athletics"]);
  });

  it("combines query and trained filter", () => {
    expect(keys(filterSkills(entries, { query: "lore", onlyTrained: true }))).toEqual(["commonLore", "forbiddenLore"]);
  });
});

describe("sanitizeDerivedMods (FR-010)", () => {
  it("turns a blank bonus into 0 and a blank override into null", () => {
    expect(sanitizeDerivedMods({ hpMax: { bonus: null, override: "" } })).toEqual({ hpMax: { bonus: 0, override: null } });
  });

  it("parses numeric strings and keeps a real override", () => {
    expect(sanitizeDerivedMods({ speed: { bonus: "2", override: "0" } })).toEqual({ speed: { bonus: 2, override: 0 } });
  });

  it("treats non-numeric input as blank", () => {
    expect(sanitizeDerivedMods({ speed: { bonus: "abc", override: "x" } })).toEqual({ speed: { bonus: 0, override: null } });
  });
});

describe("buildDots with racial bonus (spec 002, FR-014)", () => {
  it("marks dots above the base value as racial", () => {
    const dots = buildDots(3, 6, 2);
    expect(dots.map((d) => d.filled)).toEqual([true, true, true, false, false, false]);
    expect(dots.map((d) => d.racial)).toEqual([false, false, true, false, false, false]);
  });

  it("marks nothing as racial without a base", () => {
    expect(buildDots(3).some((d) => d.racial)).toBe(false);
  });
});

describe("nextBaseValue (spec 002, FR-014)", () => {
  it("makes the clicked dot the final value", () => {
    expect(nextBaseValue({ base: 2, final: 3, clicked: 5 })).toBe(4);
  });

  it("lowers the final value by one when clicking the current final value", () => {
    expect(nextBaseValue({ base: 2, final: 3, clicked: 3 })).toBe(1);
  });

  it("never goes below zero (final never below the racial bonus)", () => {
    expect(nextBaseValue({ base: 0, final: 1, clicked: 1 })).toBe(0);
  });

  it("uses the capped bonus", () => {
    expect(nextBaseValue({ base: 6, final: 6, clicked: 6 })).toBe(5);
  });

  it("behaves like nextDotValue without a bonus", () => {
    expect(nextBaseValue({ base: 3, final: 3, clicked: 3 })).toBe(2);
    expect(nextBaseValue({ base: 3, final: 3, clicked: 5 })).toBe(5);
  });
});
