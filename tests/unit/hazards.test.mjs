import { describe, expect, it } from "vitest";
import {
  breathLimit, encounterXp, fallCategory, fallReduction, fallWounds, hazardImmunity, marchDistance, marchTn, suffocationStep
} from "../../module/rules/hazards.mjs";
import { resolveDamage } from "../../module/rules/damage.mjs";
import { fatigueCheck } from "../../module/rules/healing.mjs";

describe("Falling (p. 434)", () => {
  it("lowers the fall one step with Catfall", () => {
    expect(fallCategory({ category: "fatal", catfall: true })).toBe("long");
    expect(fallCategory({ category: "long", catfall: true })).toBe("short");
    expect(fallCategory({ category: "short", catfall: true })).toBeNull();
    expect(fallCategory({ category: "fatal", catfall: false })).toBe("fatal");
  });

  it("wounds by category", () => {
    expect(fallWounds({ category: "short", d10: 7, d5a: 3, d5b: 2 })).toEqual({ wounds: 1, extraCritical: 0 });
    expect(fallWounds({ category: "long", d10: 7, d5a: 3, d5b: 2 })).toEqual({ wounds: 7, extraCritical: 0 });
    expect(fallWounds({ category: "fatal", d10: 7, d5a: 3, d5b: 2 })).toEqual({ wounds: 3, extraCritical: 2 });
  });

  it("reduces an intentional fall with Acrobatics, never a fatal one", () => {
    expect(fallReduction({ category: "long", intentional: true, success: true, raises: 2 })).toBe(3);
    expect(fallReduction({ category: "long", intentional: true, success: false, raises: 0 })).toBe(0);
    expect(fallReduction({ category: "fatal", intentional: true, success: true, raises: 4 })).toBe(0);
    expect(fallReduction({ category: "long", intentional: false, success: true, raises: 2 })).toBe(0);
  });
});

describe("Suffocation (p. 444)", () => {
  it("holds the breath Con minutes or 2 × Con rounds", () => {
    expect(breathLimit({ con: 3, mode: "strenuous" })).toBe(6);
    expect(breathLimit({ con: 3, mode: "conserve" })).toBe(3);
  });

  it("tests while the breath lasts, then falls unconscious, then loses HP", () => {
    expect(suffocationStep({ step: 6, limit: 6 })).toEqual({ test: true, unconscious: false, hpLoss: 0 });
    expect(suffocationStep({ step: 7, limit: 6 })).toEqual({ test: false, unconscious: true, hpLoss: 0 });
    expect(suffocationStep({ step: 8, limit: 6 })).toEqual({ test: false, unconscious: false, hpLoss: 1 });
  });
});

describe("Forced march (p. 445)", () => {
  it("raises the TN by 5 each hour after the first", () => {
    expect([1, 2, 3].map(marchTn)).toEqual([10, 15, 20]);
  });

  it("doubles the distance: 2 × Speed km per hour", () => {
    expect(marchDistance({ speed: 4, hours: 3 })).toBe(24);
  });
});

describe("hazardImmunity", () => {
  const none = { exaltation: "", traits: [], equipped: [], underwater: false };
  it("knows who does not breathe", () => {
    expect(hazardImmunity({ ...none, exaltation: "Vampire" })).toEqual({ breath: true, fatigue: false });
    expect(hazardImmunity({ ...none, exaltation: "Promethean" })).toEqual({ breath: true, fatigue: true });
    expect(hazardImmunity({ ...none, traits: ["undead"] }).breath).toBe(true);
    expect(hazardImmunity({ ...none, traits: ["stuffOfNightmares"] }).breath).toBe(true);
    expect(hazardImmunity({ ...none, equipped: ["Rebreather"] }).breath).toBe(true);
    expect(hazardImmunity(none)).toEqual({ breath: false, fatigue: false });
  });

  it("counts Amphibious only under water", () => {
    expect(hazardImmunity({ ...none, traits: ["amphibious"] }).breath).toBe(false);
    expect(hazardImmunity({ ...none, traits: ["amphibious"], underwater: true }).breath).toBe(true);
  });
});

describe("encounterXp (pp. 514–515)", () => {
  it("reads the Encounter Difficulty table and the session award", () => {
    expect(encounterXp("encounter", "easy")).toBe(50);
    expect(encounterXp("encounter", "hard")).toBe(200);
    expect(encounterXp("encounter", "veryHard")).toBe(250);
    expect(encounterXp("session")).toBe(500);
  });
});

describe("resolveDamage — direct wounds (p. 436)", () => {
  const base = { location: "body", armor: { head: 4, body: 4, gizzards: 4, arms: 4, legs: 4 }, resilience: 4, hp: 10 };
  it("wounds for the total, ignoring armor and Resilience", () => {
    const result = resolveDamage({ ...base, total: 7, direct: true });
    expect(result.wounds).toBe(7);
    expect(result.hpLoss).toBe(7);
    expect(result.criticalGain).toBe(0);
  });

  it("adds the Critical Damage of a fatal fall whatever the HP", () => {
    const result = resolveDamage({ ...base, total: 3, direct: true, extraCritical: 3 });
    expect(result.hpLoss).toBe(3);
    expect(result.criticalGain).toBe(3);
    expect(result.row).toBe(3);
  });
});

describe("fatigueCheck with a raised maximum (Sand, p. 207)", () => {
  it("knocks out only above the maximum", () => {
    expect(fatigueCheck({ fatigue: 5, con: 3, max: 5 })).toEqual({ unconscious: false, fatigue: 5, hours: 0 });
    expect(fatigueCheck({ fatigue: 6, con: 3, max: 5 })).toEqual({ unconscious: true, fatigue: 5, hours: 7 });
  });
});
