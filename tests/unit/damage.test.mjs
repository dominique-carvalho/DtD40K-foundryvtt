import { describe, expect, it } from "vitest";
import { resolveDamage } from "../../module/rules/damage.mjs";
import { criticalPlan, criticalTableKey } from "../../module/rules/critical.mjs";

const armor = { head: 7, body: 7, gizzards: 7, arms: 7, legs: 7 };
const base = { armor, resilience: 4, hp: 10, critical: 0, location: "body" };

describe("resolveDamage (pp. 431–437)", () => {
  it("subtracts AP less Pen and divides by Resilience, rounding down", () => {
    const result = resolveDamage({ ...base, total: 19, pen: 2 });
    expect(result).toMatchObject({ effective: 14, wounds: 3, hpLoss: 3, criticalGain: 0, row: 0, fatigue: 0 });
  });

  it("does nothing when the damage does not beat the armor", () => {
    expect(resolveDamage({ ...base, total: 7 })).toMatchObject({ effective: 0, wounds: 0, hpLoss: 0 });
  });

  it("rounds up with Tearing", () => {
    expect(resolveDamage({ ...base, armor: { ...armor, body: 0 }, total: 13, tearing: true }).wounds).toBe(4);
  });

  it("turns wounds beyond the HP into Critical Damage and picks the row by the total", () => {
    const result = resolveDamage({ ...base, armor: { ...armor, head: 0 }, location: "head", total: 20, hp: 2 });
    expect(result).toMatchObject({ wounds: 5, hpLoss: 2, criticalGain: 3, critical: 3, row: 3 });
    expect(resolveDamage({ ...base, armor: { ...armor, body: 0 }, total: 8, hp: 0, critical: 4 })).toMatchObject({ critical: 6, row: 5 });
  });

  it("counts Resilience 0 as 1", () => {
    expect(resolveDamage({ ...base, armor: { ...armor, body: 0 }, total: 3, resilience: 0 }).wounds).toBe(3);
  });

  it("uses the Aura instead of the armor for spells", () => {
    expect(resolveDamage({ ...base, total: 10, magic: true, aura: 2 })).toMatchObject({ effective: 8, wounds: 2 });
  });

  it("goes through cover first and marks it hit when it is pierced", () => {
    const cover = { ap: 8, locations: ["body", "legs"] };
    const pierced = resolveDamage({ ...base, total: 20, pen: 0, cover });
    expect(pierced).toMatchObject({ effective: 5, wounds: 1, coverHit: true });
    const stopped = resolveDamage({ ...base, total: 6, cover });
    expect(stopped).toMatchObject({ effective: 0, coverHit: false });
    expect(resolveDamage({ ...base, total: 20, location: "head", cover }).coverHit).toBe(false);
  });

  it("spends the Pen on the cover before the armor", () => {
    expect(resolveDamage({ ...base, total: 20, pen: 10, cover: { ap: 8, locations: ["body"] } })).toMatchObject({ effective: 15 });
  });

  it("adds 1 Fatigue to unarmed wounds and maps limbs to the armor location", () => {
    expect(resolveDamage({ ...base, armor: { ...armor, arms: 0 }, location: "leftArm", total: 4, unarmed: true }))
      .toMatchObject({ wounds: 1, fatigue: 1 });
    expect(resolveDamage({ ...base, location: "rightLeg", total: 11 }).wounds).toBe(1);
  });
});

describe("critical tables (pp. 437–443)", () => {
  it("maps the damage type and location, fire to Energy/Body", () => {
    expect(criticalTableKey("R", "leftArm")).toEqual({ type: "rending", location: "arm" });
    expect(criticalTableKey("X", "rightLeg")).toEqual({ type: "explosive", location: "legs" });
    expect(criticalTableKey("fire")).toEqual({ type: "energy", location: "body" });
  });

  it("reads the automation of a result", () => {
    expect(criticalPlan({ statuses: ["stunned"], rounds: "1d5", fatigue: 2 })).toEqual({
      statuses: ["stunned"], rounds: "1d5", fatigue: 2, tests: [], dead: false, halfAction: false, insanity: null
    });
    expect(criticalPlan({ dead: true }).dead).toBe(true);
    expect(criticalPlan({ test: { characteristic: "con", tn: 20, onFail: "dead" } }).tests).toHaveLength(1);
  });
});
