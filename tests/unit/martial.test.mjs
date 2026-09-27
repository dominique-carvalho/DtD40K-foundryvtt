import { describe, expect, it } from "vitest";
import { UNIVERSAL_ADVANTAGES, UNIVERSAL_RESTRICTIONS, adeptLevels } from "../../module/rules/martial.mjs";

describe("universal Advantages and Restrictions (p. 262, p. 273)", () => {
  it("lists 5 Advantages and 7 Restrictions with their costs", () => {
    expect(UNIVERSAL_ADVANTAGES.map((a) => [a.name, a.cost, a.perPoint])).toEqual([
      ["First Damage Improvement", 1, true], ["Second Damage Mastery", 3, true], ["First Accuracy Improvement", 1, true],
      ["Second Accuracy Mastery", 2, true], ["Penetration Mastery", 1, true]
    ]);
    expect(UNIVERSAL_RESTRICTIONS.map((r) => [r.name, r.cost, r.perPoint])).toEqual([
      ["Difficult Strike", -1, false], ["Last Resort", -2, false], ["Restrained Force", -1, true], ["Unbroken Skin", -2, true],
      ["Inaccurate", -1, true], ["Overextended", -2, true], ["Non-Penetrating", -1, false]
    ]);
  });
});

describe("adeptLevels (pp. 260, 272)", () => {
  it("takes the highest Sword School and the highest Gun Kata", () => {
    expect(adeptLevels({ settingSun: 2, ironHeart: 3 })).toEqual({ adeptLevel: 3, gunslingerLevel: 0 });
    expect(adeptLevels({ clayPigeon: 3, pointBlank: 2, ironHeart: 1 })).toEqual({ adeptLevel: 1, gunslingerLevel: 3 });
    expect(adeptLevels({})).toEqual({ adeptLevel: 0, gunslingerLevel: 0 });
  });
});
