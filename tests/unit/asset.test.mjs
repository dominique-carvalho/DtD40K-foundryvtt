import { describe, expect, it } from "vitest";
import { buildAssetEffects, countsTowardLimit, perfectionAsset, validateAssetAdd } from "../../module/rules/asset.mjs";

/** Minimal Exalted Asset (feat) data. */
const asset = (name, group, exaltation, { race = "", automation = "none" } = {}) => ({
  name,
  system: { category: "exaltedAsset", group, prerequisites: { exaltation, race, deity: "" }, automation }
});

const bloodOfIo = asset("Blood of Io", "dragonbloodedBloodline", "Dragonblooded", { automation: "bloodOfIo" });
const doubleDragon = asset("Double Dragon", "dragonbloodedBloodline", "Dragonblooded");
const extraAction = asset("Extra Action", "paragon", "Paragon", { automation: "extraAction" });
const actionHero = asset("Action Hero", "paragon", "Paragon", { automation: "actionHero" });
const warboss = asset("Warboss", "paragonRacial", "Paragon", { race: "Ork", automation: "warboss" });
const multiclass = asset("Multiclass", "paragonRacial", "Paragon", { race: "Human" });
const khorne = asset("Mark of Khorne", "chosenMark", "Chosen");

describe("countsTowardLimit (p. 179)", () => {
  it("exempts the Paragon groups from the one-asset limit", () => {
    expect(countsTowardLimit(extraAction)).toBe(false);
    expect(countsTowardLimit(warboss)).toBe(false);
    expect(countsTowardLimit(bloodOfIo)).toBe(true);
  });
});

describe("validateAssetAdd (FR-022)", () => {
  const dragonblooded = { name: "Dragonblooded" };
  const paragon = { name: "Paragon" };

  it("accepts a first asset of the character's exaltation", () => {
    expect(validateAssetAdd({ asset: bloodOfIo, exaltation: dragonblooded, race: null, assets: [] })).toEqual({ valid: true });
  });

  it("refuses a second asset outside the Paragon groups", () => {
    expect(validateAssetAdd({ asset: doubleDragon, exaltation: dragonblooded, race: null, assets: [bloodOfIo] }))
      .toEqual({ valid: false, error: "limit" });
  });

  it("lets a Paragon stack Paragon assets", () => {
    expect(validateAssetAdd({ asset: actionHero, exaltation: paragon, race: null, assets: [extraAction] }))
      .toEqual({ valid: true });
    expect(validateAssetAdd({ asset: multiclass, exaltation: paragon, race: { name: "Human" }, assets: [extraAction, actionHero] }))
      .toEqual({ valid: true });
  });

  it("checks the exaltation, the race and duplicates, in that order", () => {
    expect(validateAssetAdd({ asset: khorne, exaltation: null, race: null, assets: [] }))
      .toEqual({ valid: false, error: "noExaltation" });
    expect(validateAssetAdd({ asset: khorne, exaltation: { name: "Werewolf" }, race: null, assets: [] }))
      .toEqual({ valid: false, error: "wrongExaltation" });
    expect(validateAssetAdd({ asset: warboss, exaltation: paragon, race: { name: "Elf" }, assets: [] }))
      .toEqual({ valid: false, error: "wrongRace" });
    expect(validateAssetAdd({ asset: warboss, exaltation: paragon, race: null, assets: [] }))
      .toEqual({ valid: false, error: "wrongRace" });
    expect(validateAssetAdd({ asset: actionHero, exaltation: paragon, race: null, assets: [actionHero] }))
      .toEqual({ valid: false, error: "duplicate" });
  });
});

describe("buildAssetEffects (research R6)", () => {
  const changes = (automation) => buildAssetEffects({ automation }).flatMap((effect) => effect.changes);

  it("builds one effect per automated asset", () => {
    expect(changes("actionHero")).toEqual([{ key: "system.heroPoints.max", mode: 2, value: "1" }]);
    expect(changes("extraAction")).toEqual([{ key: "system.modifiers.exaltation.resourceBonus", mode: 2, value: "2" }]);
    expect(changes("bloodOfIo")).toEqual([{ key: "system.modifiers.exaltation.resourcePerPowerStat", mode: 2, value: "1" }]);
    expect(changes("longbeard")).toEqual([{ key: "system.modifiers.resilience", mode: 2, value: "1" }]);
    expect(changes("markOfNurgle")).toEqual([{ key: "system.modifiers.resilience", mode: 2, value: "1" }]);
    expect(changes("sloth")).toEqual([{ key: "system.modifiers.hpMax", mode: 2, value: "2" }]);
    expect(changes("elusive")).toEqual([{ key: "system.modifiers.staticDefenseSize", mode: 5, value: "false" }]);
  });

  it("applies Warboss after the racial Size override (priority 60 > 50)", () => {
    expect(changes("warboss")).toEqual([{ key: "system.size", mode: 2, value: "1", priority: 60 }]);
  });

  it("builds nothing for text-only assets", () => {
    expect(buildAssetEffects({ automation: "none" })).toEqual([]);
  });

  it("tags each effect with its automation", () => {
    expect(buildAssetEffects({ automation: "sloth" })).toEqual([
      { asset: "sloth", changes: [{ key: "system.modifiers.hpMax", mode: 2, value: "2" }] }
    ]);
  });
});

describe("perfectionAsset (Paragon, p. 83)", () => {
  const pack = [bloodOfIo, extraAction, warboss, multiclass];

  it("finds the Paragon Racial Asset of the race", () => {
    expect(perfectionAsset(pack, "Human")).toBe(multiclass);
    expect(perfectionAsset(pack, "Ork")).toBe(warboss);
  });

  it("finds nothing for a race without one (Tiefling) or without a race", () => {
    expect(perfectionAsset(pack, "Tiefling")).toBeNull();
    expect(perfectionAsset(pack, "")).toBeNull();
  });
});
