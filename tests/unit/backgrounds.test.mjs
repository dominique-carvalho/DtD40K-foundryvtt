import { describe, expect, it } from "vitest";
import { BACKGROUND_TEXT, backgroundCost, canRaise, creationDots, inheritanceFits, inheritanceUsed } from "../../module/rules/backgrounds.mjs";
import { BACKGROUNDS } from "../../module/config.mjs";

const empty = () => ({
  allies: { value: 0 }, contacts: { value: 0 }, fame: { value: 0 }, followers: { value: 0 }, holdings: { value: 0 },
  inheritance: { value: 0 }, mentor: { value: 0 }, status: { value: 0 }, artifacts: [], backings: []
});

describe("BACKGROUND_TEXT (pp. 280–283)", () => {
  it("describes every Background in our own words", () => {
    expect(Object.keys(BACKGROUND_TEXT)).toEqual(Object.keys(BACKGROUNDS));
    for (const [key, text] of Object.entries(BACKGROUND_TEXT)) expect(text.summary, key).not.toBe("");
    expect(Object.keys(BACKGROUND_TEXT.followers.levels)).toContain("5");
  });
});

describe("creationDots (pp. 15–16)", () => {
  it("counts every dot up to 3 of each Background and instance, Wealth included", () => {
    const b = empty();
    b.contacts.value = 3;
    b.fame.value = 2;
    expect(creationDots({ backgrounds: b, wealth: 2 })).toBe(7);
    b.fame.value = 4;
    expect(creationDots({ backgrounds: b, wealth: 2 })).toBe(8);
    b.artifacts = [{ value: 2 }, { value: 5 }];
    expect(creationDots({ backgrounds: b, wealth: 0 })).toBe(3 + 3 + 2 + 3);
  });
});

describe("backgroundCost (pp. 15–16)", () => {
  it("is free up to 3 while the 7 dots last, then 50 per dot 1–3 and 100 per dot 4–5", () => {
    expect(backgroundCost({ to: 2, dotsUsed: 5 })).toBe(0);
    expect(backgroundCost({ to: 2, dotsUsed: 7 })).toBe(50);
    expect(backgroundCost({ to: 4, dotsUsed: 0 })).toBe(100);
    expect(backgroundCost({ to: 5, dotsUsed: 9 })).toBe(100);
  });
});

describe("canRaise (pp. 15–16, 281)", () => {
  it("allows raises only at creation, up to 5, with at most 5 dots of Artifacts", () => {
    expect(canRaise({ creation: true, isGM: false, to: 3, artifactTotal: 0 })).toEqual({ allowed: true, reason: "" });
    expect(canRaise({ creation: false, isGM: false, to: 1, artifactTotal: 0 })).toEqual({ allowed: false, reason: "notCreation" });
    expect(canRaise({ creation: false, isGM: true, to: 1, artifactTotal: 0 })).toEqual({ allowed: true, reason: "" });
    expect(canRaise({ creation: true, isGM: false, to: 6, artifactTotal: 0 })).toEqual({ allowed: false, reason: "atMax" });
    expect(canRaise({ creation: true, isGM: false, to: 2, artifactTotal: 6 })).toEqual({ allowed: false, reason: "artifactCap" });
  });
});

describe("inheritanceFits (p. 282)", () => {
  it("takes one rank-1 choice at Inheritance 1", () => {
    expect(inheritanceFits(1, { uncommon: 1 })).toBe(true);
    expect(inheritanceFits(1, { common: 2 })).toBe(true);
    expect(inheritanceFits(1, { ubiquitous: 8 })).toBe(true);
    expect(inheritanceFits(1, { common: 1, veryCommon: 1 })).toBe(false);
    expect(inheritanceFits(1, { rare: 1 })).toBe(false);
    expect(inheritanceFits(0, { common: 1 })).toBe(false);
    expect(inheritanceFits(0, {})).toBe(true);
  });

  it("takes a rarer item or two choices of the rank below", () => {
    expect(inheritanceFits(2, { rare: 1 })).toBe(true);
    expect(inheritanceFits(2, { common: 2, veryCommon: 4 })).toBe(true);
    expect(inheritanceFits(2, { rare: 1, common: 1 })).toBe(false);
    expect(inheritanceFits(3, { veryRare: 1 })).toBe(true);
    expect(inheritanceFits(3, { rare: 1, uncommon: 1, common: 2 })).toBe(true);
    expect(inheritanceFits(3, { common: 3, uncommon: 2 })).toBe(true);
    expect(inheritanceFits(3, { common: 3, uncommon: 3 })).toBe(false);
    expect(inheritanceFits(5, { anyNonArtifact: 1 })).toBe(true);
    expect(inheritanceFits(5, { mythicRare: 2 })).toBe(true);
    expect(inheritanceFits(4, { anyNonArtifact: 1 })).toBe(false);
  });
});

describe("inheritanceUsed (spec 027)", () => {
  it("counts rank-1 slots, rounding each rank-1 kind up", () => {
    expect(inheritanceUsed({})).toBe(0);
    expect(inheritanceUsed({ uncommon: 1 })).toBe(1);
    expect(inheritanceUsed({ common: 3 })).toBe(2);
    expect(inheritanceUsed({ rare: 1, ubiquitous: 1 })).toBe(3);
  });
});
