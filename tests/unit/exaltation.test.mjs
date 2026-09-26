import { describe, expect, it } from "vitest";
import {
  applyResourceAction, buildExaltationEffects, computeExaltation, defaultSelection, effectivePowerStat, needsSelection,
  powerStatMax, pressureMax, resourceMax, resourceValue, roundSpent, spendCheck, statuesqueOptions, tellLevel,
  unlockedPowers, validateExaltationSelection
} from "../../module/rules/exaltation.mjs";

/** Build a characteristics object: every value defaults to 1. */
const chars = (values = {}) => {
  const keys = ["str", "dex", "con", "cha", "fel", "cmp", "int", "wis", "wil"];
  return Object.fromEntries(keys.map((k) => [k, { value: values[k] ?? 1 }]));
};

const stats = ({ level = 1, devotion = 6, resolveMax = 2, ...values } = {}) => ({
  characteristics: chars(values),
  level,
  devotion,
  resolveMax
});

const powers = ["One", "Two", "Three", "Four", "Five"].map((name, index) => ({ rank: index + 1, name, description: "" }));

/** Minimal exaltation system data (subset of ExaltationData). */
const exaltation = ({ formula = "rage", cap = "level", value = 1, statics = [], elements = [], ...rest } = {}) => ({
  powerStat: { name: "Feral Heart", cap, value },
  resource: { name: "Rage", formula, fixedMax: 0, actions: [], debtName: "", healing: "outOfCombat", spent: 0, ...rest.resource },
  round: { spent: 0, marker: "none", ...rest.round },
  scene: { spent: 0, ...rest.scene },
  pressure: { enabled: false, spent: 0, ...rest.pressure },
  staticPowers: statics.map((automation) => ({ name: automation, description: "", automation })),
  powers,
  elements,
  selection: { statuesque: "", element: "", ...rest.selection }
});

const ELEMENTS = [
  { key: "air", name: "Air", characteristic: "int", hpMax: 0 },
  { key: "earth", name: "Earth", characteristic: "con", hpMax: 2 },
  { key: "fire", name: "Fire", characteristic: "cha", hpMax: 0 },
  { key: "water", name: "Water", characteristic: "str", hpMax: 0 },
  { key: "wood", name: "Wood", characteristic: "wis", hpMax: 0 }
];

/** Race system data as stored on the character (RaceData subset with the player's choice). */
const race = (options, any, characteristic) => ({ characteristicBonus: { options, any }, choice: { characteristic, skills: [] } });

describe("powerStatMax and effectivePowerStat (DtD 7.7a pp. 65, 71)", () => {
  it("caps the Power Stat at the Level", () => {
    expect(powerStatMax({ cap: "level", level: 1, devotion: 6 })).toBe(1);
    expect(powerStatMax({ cap: "level", level: 4, devotion: 0 })).toBe(4);
    expect(powerStatMax({ cap: "level", level: 0, devotion: 6 })).toBe(1);
  });

  it("caps the Chosen's Faith at half the Devotion, rounded up (Conviction)", () => {
    expect(powerStatMax({ cap: "levelAndDevotion", level: 5, devotion: 5 })).toBe(3);
    expect(powerStatMax({ cap: "levelAndDevotion", level: 5, devotion: 3 })).toBe(2);
    expect(powerStatMax({ cap: "levelAndDevotion", level: 2, devotion: 10 })).toBe(2);
    expect(powerStatMax({ cap: "levelAndDevotion", level: 5, devotion: 0 })).toBe(1);
  });

  it("keeps the effective value between 1 and the cap", () => {
    expect(effectivePowerStat(4, 3)).toBe(3);
    expect(effectivePowerStat(0, 3)).toBe(1);
    expect(effectivePowerStat(2, 3)).toBe(2);
  });
});

describe("resourceMax (research R3)", () => {
  const max = (formula, values, ps, mods) => resourceMax({ formula, fixedMax: 4 }, stats(values), ps, mods);

  it("computes every formula of the book", () => {
    expect(max("rage", { cmp: 2, wil: 4, level: 1 }, 1)).toBe(7); // Traya, p. 18
    expect(max("rage", { cmp: 2, wil: 4, level: 3 }, 3)).toBe(9);
    expect(max("motes", { cha: 3, int: 4 }, 2)).toBe(11);
    expect(max("favor", { devotion: 5 }, 3)).toBe(8);
    expect(max("essence", { wil: 3, cha: 2 }, 1)).toBe(7);
    expect(max("breath", { level: 2 }, 1)).toBe(4);
    expect(max("actionPoints", { level: 2 }, 1)).toBe(3);
    expect(max("pyros", {}, 2)).toBe(6);
    expect(max("vitae", {}, 1)).toBe(5);
    expect(max("plasm", { resolveMax: 6 }, 1)).toBe(7);
    expect(max("fixed", {}, 3)).toBe(4);
  });

  it("adds asset modifiers (Blood of Io, Extra Action)", () => {
    expect(max("breath", { level: 2 }, 1, { resourcePerPowerStat: 1 })).toBe(5);
    expect(max("actionPoints", { level: 2 }, 1, { resourceBonus: 2 })).toBe(5);
  });

  it("never goes below 0", () => {
    expect(resourceMax({ formula: "fixed", fixedMax: 0 }, stats(), 1, { resourceBonus: -3 })).toBe(0);
  });
});

describe("resourceValue and unlockedPowers", () => {
  it("derives the current value from the points spent", () => {
    expect(resourceValue(7, 1)).toBe(6);
    expect(resourceValue(7, 9)).toBe(0);
  });

  it("unlocks the powers up to the Power Stat", () => {
    expect(unlockedPowers(powers, 1).map((power) => power.unlocked)).toEqual([true, false, false, false, false]);
    expect(unlockedPowers(powers, 3).map((power) => power.unlocked)).toEqual([true, true, true, false, false]);
  });
});

describe("selection (Statuesque, Blood Quickening)", () => {
  const paragon = exaltation({ formula: "actionPoints", statics: ["destiny", "statuesque", "none", "perfection"] });
  const dragon = exaltation({ formula: "breath", statics: ["none", "bloodQuickening"], elements: ELEMENTS });

  it("offers the race's other bonus characteristics to Statuesque (p. 83)", () => {
    expect(statuesqueOptions(null)).toHaveLength(9);
    const human = statuesqueOptions(race([], true, "cha"));
    expect(human).toHaveLength(8);
    expect(human).not.toContain("cha");
    expect(statuesqueOptions(race(["wis", "int"], false, "wis"))).toEqual(["int"]);
  });

  it("asks for a choice only when there is more than one option", () => {
    expect(needsSelection(paragon, race([], true, "cha"))).toBe(true);
    expect(needsSelection(paragon, race(["wis", "int"], false, "wis"))).toBe(false);
    expect(needsSelection(dragon, null)).toBe(true);
    expect(needsSelection(exaltation(), null)).toBe(false);
  });

  it("fills a single option by default", () => {
    expect(defaultSelection(paragon, race(["wis", "int"], false, "wis"))).toEqual({ statuesque: "int", element: "" });
    expect(defaultSelection(dragon, null)).toEqual({ statuesque: "", element: "" });
  });

  it("validates the selection", () => {
    const eldarin = race(["wis", "int"], false, "wis");
    expect(validateExaltationSelection(paragon, { statuesque: "int", element: "" }, eldarin)).toEqual({ valid: true });
    expect(validateExaltationSelection(paragon, { statuesque: "wis", element: "" }, eldarin))
      .toEqual({ valid: false, error: "statuesque" });
    expect(validateExaltationSelection(dragon, { statuesque: "", element: "earth" }, null)).toEqual({ valid: true });
    expect(validateExaltationSelection(dragon, { statuesque: "", element: "lava" }, null))
      .toEqual({ valid: false, error: "element" });
    expect(validateExaltationSelection(exaltation(), { statuesque: "", element: "" }, null)).toEqual({ valid: true });
  });

  it("builds the Paragon effects: Destiny and Statuesque", () => {
    const effects = buildExaltationEffects(paragon, { statuesque: "int", element: "" }, race(["wis", "int"], false, "wis"));
    expect(effects).toEqual([
      { exalted: "destiny", changes: [{ key: "system.heroPoints.max", mode: 2, value: "2" }], label: { type: "destiny" } },
      {
        exalted: "statuesque",
        changes: [{ key: "system.characteristics.int.value", mode: 2, value: "1" }],
        label: { type: "statuesque", key: "int" }
      }
    ]);
  });

  it("builds the Blood Quickening effects of the chosen element (p. 79)", () => {
    expect(buildExaltationEffects(dragon, { statuesque: "", element: "earth" }, null)).toEqual([
      {
        exalted: "element",
        changes: [{ key: "system.characteristics.con.value", mode: 2, value: "1" }],
        label: { type: "element", key: "con", name: "Earth" }
      },
      {
        exalted: "element.hp",
        changes: [{ key: "system.modifiers.hpMax", mode: 2, value: "2" }],
        label: { type: "elementHp", name: "Earth", value: 2 }
      }
    ]);
    expect(buildExaltationEffects(dragon, { statuesque: "", element: "fire" }, null).map((effect) => effect.exalted))
      .toEqual(["element"]);
  });

  it("builds no effect for exaltations without automated powers, and refuses invalid choices", () => {
    expect(buildExaltationEffects(exaltation(), { statuesque: "", element: "" }, null)).toEqual([]);
    expect(() => buildExaltationEffects(dragon, { statuesque: "", element: "lava" }, null)).toThrow();
  });
});

describe("round, scene and recovery (research R4)", () => {
  it("counts the round's spending only while the combat round is the same", () => {
    expect(roundSpent(2, "c1:3", "c1:4")).toBe(0);
    expect(roundSpent(2, "c1:3", "c1:3")).toBe(2);
    expect(roundSpent(1, "none", "none")).toBe(1);
  });

  it("maps the scene's spending to the Tell (p. 65)", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 9].map(tellLevel)).toEqual([0, 1, 2, 2, 3, 3, 4, 4]);
  });

  it("checks a spend against the pool and the per-round limit", () => {
    expect(spendCheck({ value: 0, roundSpent: 0, ps: 2 })).toBe("empty");
    expect(spendCheck({ value: 5, roundSpent: 2, ps: 2 })).toBe("overLimit");
    expect(spendCheck({ value: 5, roundSpent: 1, ps: 2 })).toBe("ok");
  });

  it("applies the recovery buttons", () => {
    expect(applyResourceAction(5, { type: "restoreAll", amount: "1" }, 1, 9)).toBe(0);
    expect(applyResourceAction(6, { type: "regain", amount: "powerStat" }, 3, 9)).toBe(3);
    expect(applyResourceAction(1, { type: "regain", amount: "2" }, 1, 9)).toBe(0);
    expect(applyResourceAction(2, { type: "unravel", amount: "1" }, 1, 11)).toBe(1);
    expect(applyResourceAction(3, { type: "lose", amount: "1" }, 1, 7)).toBe(4);
    expect(applyResourceAction(7, { type: "lose", amount: "1" }, 1, 7)).toBe(7);
  });

  it("gives the Paragon 5 Pressure Points per Excellence (Be a Man, p. 84)", () => {
    expect(pressureMax(1, true)).toBe(5);
    expect(pressureMax(3, true)).toBe(15);
    expect(pressureMax(3, false)).toBeNull();
  });
});

describe("computeExaltation", () => {
  it("matches the Traya example: Werewolf, Rage 7, Fast Healing unlocked (p. 18)", () => {
    const result = computeExaltation(exaltation(), stats({ cmp: 2, wil: 4, level: 1 }));
    expect(result.powerStat).toEqual({ name: "Feral Heart", value: 1, purchased: 1, max: 1 });
    expect(result.resource).toMatchObject({ name: "Rage", max: 7, value: 7, spent: 0, debt: 0, roundSpent: 0, roundLimit: 1, roundFull: false });
    expect(result.powers.map((power) => power.unlocked)).toEqual([true, false, false, false, false]);
    expect(result.tell).toEqual({ spent: 0, level: 0 });
    expect(result.pressure).toBeNull();
    expect(result.healing).toBe("outOfCombat");
  });

  it("limits the Chosen's Faith and locks the powers above it", () => {
    const chosen = exaltation({ formula: "favor", cap: "levelAndDevotion", value: 4 });
    const high = computeExaltation(chosen, stats({ level: 5, devotion: 5 }));
    expect(high.powerStat).toMatchObject({ value: 3, purchased: 4, max: 3 });
    expect(high.resource.max).toBe(8);
    const low = computeExaltation(chosen, stats({ level: 5, devotion: 3 }));
    expect(low.powerStat.value).toBe(2);
    expect(low.powers.map((power) => power.unlocked)).toEqual([true, true, false, false, false]);
  });

  it("shows the Atlantean's Paradox, the round and the Tell", () => {
    const atlantean = exaltation({
      formula: "motes",
      value: 2,
      resource: { debtName: "Paradox", spent: 2 },
      round: { spent: 2, marker: "c1:1" },
      scene: { spent: 2 }
    });
    const result = computeExaltation(atlantean, stats({ cha: 3, int: 4, level: 2 }), {}, { currentMarker: "c1:1" });
    expect(result.resource).toMatchObject({ max: 11, value: 9, debt: 2, debtName: "Paradox", roundSpent: 2, roundFull: true });
    expect(result.tell).toEqual({ spent: 2, level: 2 });
    expect(computeExaltation(atlantean, stats({ cha: 3, int: 4, level: 2 }), {}, { currentMarker: "c1:2" }).resource.roundSpent)
      .toBe(0);
  });

  it("gives the Paragon a separate Pressure pool", () => {
    const paragon = exaltation({ formula: "actionPoints", pressure: { enabled: true, spent: 3 } });
    const result = computeExaltation(paragon, stats({ level: 2 }));
    expect(result.resource.max).toBe(3);
    expect(result.pressure).toEqual({ max: 5, value: 2, spent: 3 });
  });
});
