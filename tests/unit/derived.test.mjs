import { describe, expect, it } from "vitest";
import { computeDerived } from "../../module/rules/derived.mjs";

/** Build a characteristics object: every value defaults to 1. */
const chars = (values = {}) => {
  const keys = ["str", "dex", "con", "cha", "fel", "cmp", "int", "wis", "wil"];
  return Object.fromEntries(keys.map((k) => [k, { value: values[k] ?? 1 }]));
};

describe("computeDerived", () => {
  it("matches the Traya example (DtD 1.6 p. 15)", () => {
    const result = computeDerived({
      characteristics: chars({ str: 4, dex: 3, con: 4, wil: 2, wis: 2, cmp: 2 }),
      size: 5,
      level: 1
    });
    expect(result).toEqual({
      staticDefense: 15,
      hpMax: 12,
      mentalDefense: 15,
      resolveMax: 4,
      speed: 7,
      resilience: 4
    });
  });

  it("computes a fresh character (all 1, size 4, level 1)", () => {
    const result = computeDerived({ characteristics: chars(), size: 4, level: 1 });
    expect(result.hpMax).toBe(4);
    expect(result.resolveMax).toBe(2);
    expect(result.staticDefense).toBe(8);
    expect(result.mentalDefense).toBe(10);
    expect(result.speed).toBe(2);
    expect(result.resilience).toBe(4);
  });

  it("rounds resilience up: level 5 human has resilience 6 (p. 14)", () => {
    const result = computeDerived({ characteristics: chars(), size: 4, level: 5 });
    expect(result.resilience).toBe(6);
  });

  it("adds the manual bonus", () => {
    const result = computeDerived(
      { characteristics: chars(), size: 4, level: 1 },
      { hpMax: { bonus: 3, override: null }, speed: { bonus: -1, override: null } }
    );
    expect(result.hpMax).toBe(7);
    expect(result.speed).toBe(1);
  });

  it("override replaces the value even with a bonus", () => {
    const result = computeDerived(
      { characteristics: chars({ dex: 5 }), size: 4, level: 1 },
      { staticDefense: { bonus: 4, override: 20 } }
    );
    expect(result.staticDefense).toBe(20);
  });

  it("override 0 is honoured (not treated as empty)", () => {
    const result = computeDerived(
      { characteristics: chars(), size: 4, level: 1 },
      { speed: { bonus: 0, override: 0 } }
    );
    expect(result.speed).toBe(0);
  });

  it("never lets resilience drop below 1", () => {
    const result = computeDerived(
      { characteristics: chars(), size: 1, level: 1 },
      { resilience: { bonus: -10, override: null } }
    );
    expect(result.resilience).toBe(1);
  });

  it("treats a null or missing bonus as 0", () => {
    const result = computeDerived(
      { characteristics: chars(), size: 4, level: 1 },
      { hpMax: { bonus: null, override: null }, speed: { override: null } }
    );
    expect(result.hpMax).toBe(4);
    expect(result.speed).toBe(2);
  });

  it("treats an empty-string override as no override", () => {
    const result = computeDerived(
      { characteristics: chars(), size: 4, level: 1 },
      { hpMax: { bonus: 1, override: "" } }
    );
    expect(result.hpMax).toBe(5);
  });

  it("works without derivedMods", () => {
    expect(() => computeDerived({ characteristics: chars(), size: 4, level: 1 })).not.toThrow();
  });
});

describe("computeDerived with racial modifiers (spec 002, FR-016/FR-019)", () => {
  const halfling = { characteristics: chars({ dex: 3, wis: 4 }), size: 2, level: 1 };
  const squat = { characteristics: chars(), size: 3, level: 1 };

  it("uses the Halfling Shifty formula: 10 + 6×Dex − 2×Size (7.7a p. 45)", () => {
    expect(computeDerived(halfling, {}, { staticDefenseFormula: "shifty" }).staticDefense).toBe(24);
    expect(computeDerived(halfling).staticDefense).toBe(27);
  });

  it("keeps the GM bonus and override on top of Shifty", () => {
    expect(computeDerived(halfling, { staticDefense: { bonus: 2, override: null } }, { staticDefenseFormula: "shifty" })
      .staticDefense).toBe(26);
    expect(computeDerived(halfling, { staticDefense: { bonus: 0, override: 18 } }, { staticDefenseFormula: "shifty" })
      .staticDefense).toBe(18);
  });

  it("adds Squat Toughness to Resilience (7.7a p. 55)", () => {
    expect(computeDerived(squat, {}, { resilience: 1 }).resilience).toBe(4);
  });

  it("lets the GM override and bonus win over Squat Toughness", () => {
    expect(computeDerived(squat, { resilience: { bonus: 0, override: 2 } }, { resilience: 1 }).resilience).toBe(2);
    expect(computeDerived(squat, { resilience: { bonus: 1, override: null } }, { resilience: 1 }).resilience).toBe(5);
  });

  it("changes nothing without modifiers (001 results unchanged)", () => {
    const traya = { characteristics: chars({ str: 4, dex: 3, con: 4, wil: 2, wis: 2, cmp: 2 }), size: 5, level: 1 };
    expect(computeDerived(traya, {}, {})).toEqual(computeDerived(traya));
    expect(computeDerived(traya, {}, { staticDefenseFormula: "standard", resilience: 0 })).toEqual(computeDerived(traya));
  });
});
