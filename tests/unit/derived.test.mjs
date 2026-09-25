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
