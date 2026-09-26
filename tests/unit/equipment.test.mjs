import { describe, expect, it } from "vitest";
import { armorProfile, armorValues, artifactRating, mechadendriteCheck } from "../../module/rules/equipment.mjs";

const suit = (name, armorType, ap, maxDex, extra = {}) => ({ name, armorType, ap, maxDex, piece: "", suitOnly: false, ...extra });
const carapace = suit("Carapace", "heavy", 7, 4);
const mesh = suit("Mesh", "light", 4, null);
const flak = suit("Flak", "medium", 5, 5);
const power = suit("Power Armor", "power", 12, 2, { suitOnly: true });

describe("armorProfile (pp. 332–333)", () => {
  it("gives the suit AP everywhere and the full AP as penalty without proficiency", () => {
    const result = armorProfile({ armors: [carapace] });
    expect(result.locations).toEqual({ head: 7, body: 7, gizzards: 7, arms: 7, legs: 7 });
    expect(result.sdPenalty).toBe(7);
    expect(result.maxDex).toBe(4);
    expect(result.sources).toEqual({ penalty: "Carapace", maxDex: "Carapace" });
  });

  it("halves the penalty of heavy armor with proficiency and removes it for light and medium", () => {
    expect(armorProfile({ armors: [carapace], proficiencies: ["heavy"] }).sdPenalty).toBe(3);
    expect(armorProfile({ armors: [flak], proficiencies: ["medium"] }).sdPenalty).toBe(0);
    expect(armorProfile({ armors: [mesh], proficiencies: ["light"] }).sdPenalty).toBe(0);
  });

  it("adds 2 to the power armor penalty, unhalved", () => {
    expect(armorProfile({ armors: [power], proficiencies: ["power"] }).sdPenalty).toBe(8);
    expect(armorProfile({ armors: [power] }).sdPenalty).toBe(14);
  });

  it("applies Squat Armor Proficiency: none with the feat, half without", () => {
    expect(armorProfile({ armors: [carapace], proficiencies: ["heavy"], squat: true }).sdPenalty).toBe(0);
    expect(armorProfile({ armors: [carapace], squat: true }).sdPenalty).toBe(3);
  });

  it("uses the highest AP per location without stacking, and the heaviest armor for the penalty", () => {
    const helmet = suit("Carapace Helmet", "heavy", 7, 4, { piece: "head" });
    const result = armorProfile({ armors: [helmet, mesh], proficiencies: ["light"] });
    expect(result.locations).toEqual({ head: 7, body: 4, gizzards: 4, arms: 4, legs: 4 });
    expect(result.sdPenalty).toBe(7);
    expect(result.sources.penalty).toBe("Carapace Helmet");
  });

  it("covers the Gizzards with the body piece", () => {
    const body = suit("Flak Vest", "medium", 5, 5, { piece: "body" });
    expect(armorProfile({ armors: [body] }).locations).toEqual({ head: 0, body: 5, gizzards: 5, arms: 0, legs: 0 });
  });

  it("ignores a single piece of power armor", () => {
    const piece = { ...power, piece: "head" };
    expect(armorProfile({ armors: [piece] })).toEqual({
      locations: { head: 0, body: 0, gizzards: 0, arms: 0, legs: 0 }, sdPenalty: 0, maxDex: null, sources: { penalty: "", maxDex: "" }
    });
  });

  it("applies craftsmanship and materials", () => {
    expect(armorValues({ ...carapace, craftsmanship: "best" })).toEqual({ ap: 8, maxDex: 5 });
    expect(armorValues({ ...carapace, craftsmanship: "poor" })).toEqual({ ap: 7, maxDex: 3 });
    expect(armorValues({ ...carapace, material: "orichalcum", craftsmanship: "best" })).toEqual({ ap: 9, maxDex: 5 });
    expect(armorValues({ ...carapace, material: "mithril" })).toEqual({ ap: 7, maxDex: 6 });
    expect(armorValues({ ...mesh, craftsmanship: "best" })).toEqual({ ap: 5, maxDex: null });
  });

  it("stacks the Bionic Heart and Bracers bonuses and treats bionic limbs as armor", () => {
    const result = armorProfile({ armors: [mesh], bonuses: { gizzards: 2, apAll: 2, locations: { arms: 2 } } });
    expect(result.locations).toEqual({ head: 6, body: 6, gizzards: 8, arms: 6, legs: 6 });
    const limbs = armorProfile({ armors: [], bonuses: { locations: { arms: 2 } } });
    expect(limbs.locations.arms).toBe(2);
  });

  it("returns no protection and no limit without armor", () => {
    expect(armorProfile({ armors: [] })).toEqual({
      locations: { head: 0, body: 0, gizzards: 0, arms: 0, legs: 0 }, sdPenalty: 0, maxDex: null, sources: { penalty: "", maxDex: "" }
    });
  });

  it("takes the lowest Max Dex of the worn armors", () => {
    const helmet = suit("Carapace Helmet", "heavy", 7, 4, { piece: "head" });
    expect(armorProfile({ armors: [flak, helmet] }).maxDex).toBe(4);
  });
});

describe("artifactRating (p. 348)", () => {
  it("rates by the base rarity, primitive one step lower, capped at 5", () => {
    expect(artifactRating("veryCommon")).toEqual({ rating: 1, capped: false });
    expect(artifactRating("common")).toEqual({ rating: 2, capped: false });
    expect(artifactRating("uncommon")).toEqual({ rating: 3, capped: false });
    expect(artifactRating("rare")).toEqual({ rating: 4, capped: false });
    expect(artifactRating("veryRare")).toEqual({ rating: 5, capped: false });
    expect(artifactRating("rare", { primitive: true })).toEqual({ rating: 3, capped: false });
    expect(artifactRating("mythicRare")).toEqual({ rating: 5, capped: true });
    expect(artifactRating("ubiquitous")).toEqual({ rating: 1, capped: false });
  });
});

describe("mechadendriteCheck (p. 340)", () => {
  it("allows at most Constitution mechadendrites", () => {
    expect(mechadendriteCheck({ installed: 2, con: 2 })).toEqual({ ok: true, max: 2 });
    expect(mechadendriteCheck({ installed: 3, con: 2 })).toEqual({ ok: false, max: 2 });
  });
});
