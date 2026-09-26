import { describe, expect, it } from "vitest";
import { advanceCost, canAdvance, undoPlan, xpTotals } from "../../module/rules/xp.mjs";

const f = (name, subcategory = "", mandatory = true, orGroup = "") => ({ name, subcategory, mandatory, orGroup });
const cls = (name, status, { characteristics = [], skills = [], feats = [], anyCharacteristic = false } = {}) => ({
  name, system: { status, characteristics, anyCharacteristic, skills, feats }
});
const feat = (name, category = "feat", race = "") => ({ name, system: { category, prerequisites: { race }, selection: { subcategory: "" } } });

const swordsman = cls("Swordsman", "current", {
  characteristics: ["str", "dex", "con"],
  skills: ["perception", "acrobatics", "athletics", "ballistics", "brawl", "weaponry", "intimidation", "scrutiny"],
  feats: [f("Quick Draw"), f("Hardy"), f("Power Attack"), f("Weapon Proficiency", "Any", false)]
});
const swordsmanDone = { ...swordsman, system: { ...swordsman.system, status: "completed" } };

describe("advanceCost (pp. 15–16)", () => {
  it("uses the costs of the book", () => {
    expect(advanceCost("characteristic", 2)).toBe(200);
    expect(advanceCost("skill", 0)).toBe(100);
    expect(advanceCost("skill", 2)).toBe(50);
    expect(advanceCost("feat", 0)).toBe(100);
    expect(advanceCost("asset", 0)).toBe(100);
    expect(advanceCost("powerStat", 1)).toBe(300);
  });
});

describe("canAdvance (p. 106)", () => {
  const ctx = { classes: [swordsman], race: null, owned: [] };

  it("allows the current class lists and refuses what is off them", () => {
    expect(canAdvance({ ...ctx, kind: "characteristic", key: "str" })).toEqual({ allowed: true, multiplier: 1, reason: "" });
    expect(canAdvance({ ...ctx, kind: "skill", key: "stealth" })).toEqual({ allowed: false, multiplier: 1, reason: "offList" });
  });

  it("doubles characteristics and skills off the completed lists in Free Study", () => {
    const free = { ...ctx, classes: [swordsmanDone] };
    expect(canAdvance({ ...free, kind: "skill", key: "weaponry" })).toEqual({ allowed: true, multiplier: 1, reason: "" });
    expect(canAdvance({ ...free, kind: "skill", key: "stealth" })).toEqual({ allowed: true, multiplier: 2, reason: "" });
  });

  it("allows the current class feats, the optional feats of completed classes and own racial feats", () => {
    expect(canAdvance({ ...ctx, kind: "feat", feat: feat("Power Attack") })).toMatchObject({ allowed: true });
    expect(canAdvance({ ...ctx, kind: "feat", feat: feat("Luck") })).toMatchObject({ allowed: false, reason: "notOnList" });
    const free = { ...ctx, classes: [swordsmanDone] };
    expect(canAdvance({ ...free, kind: "feat", feat: { ...feat("Weapon Proficiency"), system: { ...feat("x").system, selection: { subcategory: "Basic" } } } }))
      .toMatchObject({ allowed: true });
    expect(canAdvance({ ...free, kind: "feat", feat: feat("Hardy") })).toMatchObject({ allowed: false, reason: "notOnList" });
    expect(canAdvance({ ...ctx, race: { name: "Ork" }, kind: "feat", feat: feat("Mobbing Up", "racialFeat", "Ork") })).toMatchObject({ allowed: true });
  });

  it("refuses a feat already owned or blocked by an A-or-B choice", () => {
    expect(canAdvance({ ...ctx, owned: [feat("Hardy")], kind: "feat", feat: feat("Hardy") })).toMatchObject({ allowed: false, reason: "ownedOrBlocked" });
    const nighthawk = cls("Nighthawk", "current", { feats: [f("Far Shot", "", true, "or1"), f("Furious Assault", "", true, "or1")] });
    expect(canAdvance({ ...ctx, classes: [nighthawk], owned: [feat("Far Shot")], kind: "feat", feat: feat("Furious Assault") }))
      .toMatchObject({ allowed: false, reason: "ownedOrBlocked" });
  });

  it("lets an (Any) list feat be bought again with another sub-category", () => {
    const wp = (sub) => ({ name: sub ? `Weapon Proficiency (${sub})` : "Weapon Proficiency", system: { category: "feat", prerequisites: { race: "" }, selection: { subcategory: sub } } });
    const owned = [wp("Basic")];
    expect(canAdvance({ ...ctx, owned, kind: "feat", feat: { name: "Weapon Proficiency", system: wp("Melee 1").system } })).toMatchObject({ allowed: true });
  });

  it("always allows the Power Stat and refuses everything without a class", () => {
    expect(canAdvance({ ...ctx, kind: "powerStat" })).toMatchObject({ allowed: true });
    expect(canAdvance({ classes: [], race: null, owned: [], kind: "characteristic", key: "str" })).toEqual({ allowed: false, multiplier: 1, reason: "noClass" });
  });

  it("accepts any characteristic for Peasant", () => {
    const peasant = cls("Peasant", "current", { anyCharacteristic: true });
    expect(canAdvance({ ...ctx, classes: [peasant], kind: "characteristic", key: "int" })).toMatchObject({ allowed: true, multiplier: 1 });
  });
});

describe("xpTotals and undoPlan (FR-012, FR-016)", () => {
  it("adds awards and hindrances to the starting XP and subtracts purchases", () => {
    const log = [{ type: "award", cost: 150 }, { type: "purchase", cost: 200 }, { type: "purchase", cost: 150 }];
    expect(xpTotals({ starting: 600, log, hindranceXp: 100 })).toEqual({ total: 850, spent: 350, available: 500, hindranceXp: 100 });
  });

  it("restores a value only if it is still the purchased one", () => {
    const entry = { kind: "characteristic", key: "str", from: 3, to: 4, cost: 200, itemId: "" };
    expect(undoPlan(entry, 4)).toEqual({ restore: { path: "system.characteristics.str.value", value: 3 }, deleteItem: null, refund: 200 });
    expect(undoPlan(entry, 5)).toEqual({ restore: null, deleteItem: null, refund: 200 });
    expect(undoPlan({ kind: "skill", key: "stealth", from: 0, to: 1, cost: 200 }, 1).restore).toEqual({ path: "system.skills.stealth.value", value: 0 });
    expect(undoPlan({ kind: "powerStat", key: "", from: 1, to: 2, cost: 300 }, 2).restore).toEqual({ path: "powerStat", value: 1 });
    expect(undoPlan({ kind: "feat", key: "", from: 0, to: 1, cost: 100, itemId: "abc" }, null)).toEqual({ restore: null, deleteItem: "abc", refund: 100 });
  });
});
