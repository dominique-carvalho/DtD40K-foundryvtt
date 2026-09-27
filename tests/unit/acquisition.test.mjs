import { describe, expect, it } from "vitest";
import {
  acquisitionTn, effectiveWealth, rarityStep, startingSlotFor, startingSlots, strainRoll
} from "../../module/rules/acquisition.mjs";

describe("acquisitionTn (pp. 315–317)", () => {
  it("uses the rarity TN", () => {
    expect(acquisitionTn({ rarity: "common" })).toEqual({ tn: 10, rarity: "common", time: "DTD.Rarity.Time.common" });
    expect(acquisitionTn({ rarity: "veryRare" }).tn).toBe(25);
  });

  it("lowers an armor piece one step", () => {
    expect(acquisitionTn({ rarity: "uncommon", piece: true })).toMatchObject({ tn: 10, rarity: "common" });
  });

  it("adds craftsmanship and earlier tries", () => {
    expect(acquisitionTn({ rarity: "uncommon", craftsmanship: "best" }).tn).toBe(25);
    expect(acquisitionTn({ rarity: "common", craftsmanship: "poor" }).tn).toBe(5);
    expect(acquisitionTn({ rarity: "common", attempts: 1 }).tn).toBe(15);
    expect(acquisitionTn({ rarity: "worthless", craftsmanship: "poor" }).tn).toBe(0);
  });
});

describe("strainRoll (p. 316)", () => {
  it("does not strain when the TN is within Wealth × 5", () => {
    expect(strainRoll({ tn: 15, wealth: 3, d10: 10 })).toEqual({ strained: false, roll: 0, penalty: 0 });
  });

  it("rolls 1d10 + 1 per 5 above Wealth × 5 and maps the bands", () => {
    expect(strainRoll({ tn: 25, wealth: 3, d10: 4 })).toEqual({ strained: true, roll: 6, penalty: 0 });
    expect(strainRoll({ tn: 25, wealth: 3, d10: 5 })).toEqual({ strained: true, roll: 7, penalty: 1 });
    expect(strainRoll({ tn: 25, wealth: 3, d10: 8 })).toEqual({ strained: true, roll: 10, penalty: 3 });
    expect(strainRoll({ tn: 25, wealth: 3, d10: 9 })).toEqual({ strained: true, roll: 11, penalty: 5 });
  });

  it("lowers the penalty one level per raise", () => {
    expect(strainRoll({ tn: 25, wealth: 3, d10: 9, raises: 1 }).penalty).toBe(3);
    expect(strainRoll({ tn: 25, wealth: 3, d10: 9, raises: 2 }).penalty).toBe(1);
    expect(strainRoll({ tn: 25, wealth: 3, d10: 9, raises: 5 }).penalty).toBe(0);
  });
});

describe("starting equipment (p. 16)", () => {
  it("fits an item into a pick by its rarity adjusted by craftsmanship", () => {
    expect(startingSlotFor("rare")).toBe("rare");
    expect(startingSlotFor("common", "good")).toBe("uncommon");
    expect(startingSlotFor("common", "best")).toBe("rare");
    expect(startingSlotFor("uncommon", "poor")).toBe("common");
    expect(startingSlotFor("veryRare")).toBeNull();
    expect(startingSlotFor("ubiquitous")).toBeNull();
  });

  it("counts the picks used", () => {
    const items = [{ system: { startingSlot: "common" } }, { system: { startingSlot: "common" } }, { system: { startingSlot: "" } }];
    expect(startingSlots(items)).toEqual({
      rare: { used: 0, max: 1 }, uncommon: { used: 0, max: 1 }, common: { used: 2, max: 2 }, veryCommon: { used: 0, max: 2 }
    });
  });
});

describe("starting equipment with Inheritance (spec 011, p. 282)", () => {
  it("adds the Inheritance picks to the starting picks", () => {
    expect(startingSlots([], { common: 2, veryRare: 1 })).toEqual({
      rare: { used: 0, max: 1 }, uncommon: { used: 0, max: 1 }, common: { used: 0, max: 4 }, veryCommon: { used: 0, max: 2 },
      veryRare: { used: 0, max: 1 }
    });
    expect(startingSlots([], { ubiquitous: 0 })).not.toHaveProperty("ubiquitous");
  });

  it("fits rarities the Inheritance opened", () => {
    expect(startingSlotFor("veryRare", "common", ["rare", "veryRare"])).toBe("veryRare");
    expect(startingSlotFor("ubiquitous", "common", ["ubiquitous"])).toBe("ubiquitous");
    expect(startingSlotFor("mythicRare", "common", ["rare"])).toBeNull();
  });
});

describe("rarityStep and effectiveWealth", () => {
  it("clamps at the ends of the ladder", () => {
    expect(rarityStep("worthless", -1)).toBe("worthless");
    expect(rarityStep("glittergold", 2)).toBe("glittergold");
    expect(rarityStep("common", 1)).toBe("uncommon");
  });

  it("subtracts the Strain, never below 0", () => {
    expect(effectiveWealth({ value: 3, strain: 1 })).toBe(2);
    expect(effectiveWealth({ value: 3, strain: 5 })).toBe(0);
  });
});
