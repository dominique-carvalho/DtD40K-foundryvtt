import { describe, expect, it } from "vitest";
import { runTest } from "../../module/rules/test.mjs";
import { facesRng } from "./helpers.mjs";

describe("runTest", () => {
  it("composes pool → roll → outcome for a trained skill", () => {
    const result = runTest({
      base: { rolled: 6, kept: 3, untrained: false, zeroCharacteristic: false },
      tn: 15,
      rng: facesRng([10, 4, 9, 2, 7, 1, 3])
    });
    expect(result.pool).toMatchObject({ rolled: 6, kept: 3, flat: 0, conversion: null });
    expect(result.dice).toHaveLength(6);
    // Chain 10+4 = 14 on die 1; remaining faces 9, 2, 7, 1, 3 → keep 14, 9, 7.
    expect(result.keptSum).toBe(30);
    expect(result.total).toBe(30);
    expect(result.tn).toBe(15);
    expect(result.outcome).toEqual({ success: true, raises: 3, checks: 0 });
    expect(result.flags).toEqual({ zeroCharacteristic: false, specialty: false, untrained: false });
  });

  it("normalizes pools above 10 dice and records the conversion", () => {
    const result = runTest({
      base: { rolled: 12, kept: 6 },
      tn: null,
      rng: facesRng([2, 2, 2, 2, 2, 2, 2, 2, 2, 2])
    });
    expect(result.pool).toMatchObject({ rolled: 10, kept: 7 });
    expect(result.pool.conversion).toEqual({ from: "12k6", to: "10k7", bonus: 0 });
    expect(result.outcome).toBeNull();
  });

  it("applies the zero-characteristic rule reported by the pool", () => {
    const result = runTest({
      base: { rolled: 1, kept: 1, untrained: true, zeroCharacteristic: true },
      tn: 5,
      rng: facesRng([10])
    });
    expect(result.total).toBe(0);
    expect(result.flags).toMatchObject({ zeroCharacteristic: true, untrained: true });
    expect(result.outcome.success).toBe(false);
  });

  it("passes the specialty flag through as reroll of 1s", () => {
    const result = runTest({
      base: { rolled: 1, kept: 1 },
      specialty: true,
      tn: 15,
      rng: facesRng([1, 8])
    });
    expect(result.dice[0]).toMatchObject({ rerolled: [1], chain: [8] });
    expect(result.flags.specialty).toBe(true);
  });
});

describe("runTest with modifiers (US3)", () => {
  it("a free raise turns 14 vs TN 15 into 19, a success (US3-3)", () => {
    // Die 9 + flat modifier 5 = 14: a failure against TN 15.
    const plain = runTest({ base: { rolled: 1, kept: 1 }, modifiers: { flat: 5 }, tn: 15, rng: facesRng([9]) });
    expect(plain.total).toBe(14);
    expect(plain.outcome.success).toBe(false);
    // Same roll with one free raise (+5) = 19: a success.
    const boosted = runTest({ base: { rolled: 1, kept: 1 }, modifiers: { flat: 5, freeRaises: 1 }, tn: 15, rng: facesRng([9]) });
    expect(boosted.total).toBe(19);
    expect(boosted.outcome).toEqual({ success: true, raises: 0, checks: 0 });
  });

  it("stunts (+1k1 per level) enlarge the pool before normalization", () => {
    const result = runTest({ base: { rolled: 9, kept: 5 }, modifiers: { stuntDice: 3 }, tn: null, rng: facesRng(Array(10).fill(2)) });
    expect(result.pool).toMatchObject({ rolled: 10, kept: 9 });
    expect(result.pool.conversion).toEqual({ from: "12k8", to: "10k9", bonus: 0 });
  });

  it("choosing another characteristic changes the pool (Persuasion 2 + Fellowship 4 → 6k4)", async () => {
    const { buildSkillPool } = await import("../../module/rules/pool.mjs");
    const base = buildSkillPool({ skill: 2, characteristic: 4, advanced: false });
    const result = runTest({ base, tn: 15, rng: facesRng([3, 3, 3, 3, 3, 3]) });
    expect(result.pool).toMatchObject({ rolled: 6, kept: 4 });
    expect(result.total).toBe(12);
  });
});
