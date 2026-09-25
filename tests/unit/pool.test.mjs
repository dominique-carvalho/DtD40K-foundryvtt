import { describe, expect, it } from "vitest";
import { buildCharacteristicPool, buildSkillPool, formatPool, normalizePool } from "../../module/rules/pool.mjs";

describe("normalizePool — book conversion examples (p. 235)", () => {
  it.each([
    [{ rolled: 12, kept: 6, flat: 0 }, { rolled: 10, kept: 7, flat: 0 }],
    [{ rolled: 11, kept: 5, flat: 0 }, { rolled: 10, kept: 5, flat: 0 }],
    [{ rolled: 15, kept: 10, flat: 0 }, { rolled: 10, kept: 10, flat: 25 }],
    [{ rolled: 11, kept: 11, flat: 0 }, { rolled: 10, kept: 10, flat: 10 }]
  ])("%o → %o", (input, expected) => {
    expect(normalizePool(input)).toMatchObject(expected);
  });

  it("keeps the flat bonus it already had", () => {
    expect(normalizePool({ rolled: 15, kept: 10, flat: 3 })).toMatchObject({ rolled: 10, kept: 10, flat: 28 });
  });

  it("records the conversion", () => {
    expect(normalizePool({ rolled: 12, kept: 6, flat: 0 }).conversion).toEqual({ from: "12k6", to: "10k7", bonus: 0 });
    expect(normalizePool({ rolled: 5, kept: 3, flat: 0 }).conversion).toBeNull();
  });

  it("clamps kept to rolled and enforces a 1k1 minimum", () => {
    expect(normalizePool({ rolled: 2, kept: 3, flat: 0 })).toMatchObject({ rolled: 2, kept: 2 });
    expect(normalizePool({ rolled: 0, kept: 0, flat: 0 })).toMatchObject({ rolled: 1, kept: 1 });
    expect(normalizePool({ rolled: -2, kept: 1, flat: 0 })).toMatchObject({ rolled: 1, kept: 1 });
  });
});

describe("buildSkillPool", () => {
  it("trained: (skill + char) k char", () => {
    expect(buildSkillPool({ skill: 3, characteristic: 3, advanced: false }))
      .toEqual({ rolled: 6, kept: 3, untrained: false, zeroCharacteristic: false });
  });

  it("basic untrained: (char − 1) k (char − 1)", () => {
    expect(buildSkillPool({ skill: 0, characteristic: 3, advanced: false }))
      .toEqual({ rolled: 2, kept: 2, untrained: true, zeroCharacteristic: false });
  });

  it("advanced untrained is blocked", () => {
    expect(buildSkillPool({ skill: 0, characteristic: 3, advanced: true })).toEqual({ blocked: "advancedUntrained" });
  });

  it("characteristic 0 counts as one rolled and kept die", () => {
    expect(buildSkillPool({ skill: 2, characteristic: 0, advanced: false }))
      .toEqual({ rolled: 3, kept: 1, untrained: false, zeroCharacteristic: true });
  });

  it("basic untrained with characteristic 1 (effective 0) → 1k1", () => {
    expect(buildSkillPool({ skill: 0, characteristic: 1, advanced: false }))
      .toEqual({ rolled: 1, kept: 1, untrained: true, zeroCharacteristic: true });
  });
});

describe("buildCharacteristicPool", () => {
  it("char k char", () => {
    expect(buildCharacteristicPool({ characteristic: 4 })).toEqual({ rolled: 4, kept: 4, zeroCharacteristic: false });
  });

  it("characteristic 0 → 1k1", () => {
    expect(buildCharacteristicPool({ characteristic: 0 })).toEqual({ rolled: 1, kept: 1, zeroCharacteristic: true });
  });
});

describe("formatPool", () => {
  it("formats XkY with optional flat bonus", () => {
    expect(formatPool({ rolled: 6, kept: 3, flat: 0 })).toBe("6k3");
    expect(formatPool({ rolled: 10, kept: 10, flat: 25 })).toBe("10k10+25");
    expect(formatPool({ rolled: 4, kept: 2, flat: -2 })).toBe("4k2-2");
    expect(formatPool({ rolled: 3, kept: 2 })).toBe("3k2");
  });
});
