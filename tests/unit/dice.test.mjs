import { describe, expect, it } from "vitest";
import { rollAndKeep } from "../../module/rules/dice.mjs";
import { facesRng } from "./helpers.mjs";

const pool = (rolled, kept, flat = 0) => ({ rolled, kept, flat, conversion: null });

describe("rollAndKeep", () => {
  it("keeps the highest K dice and adds the flat bonus", () => {
    const result = rollAndKeep(pool(4, 2, 3), { rng: facesRng([3, 7, 1, 5]) });
    expect(result.dice.map((d) => d.total)).toEqual([3, 7, 1, 5]);
    expect(result.dice.map((d) => d.kept)).toEqual([false, true, false, true]);
    expect(result.keptSum).toBe(12);
    expect(result.total).toBe(15);
  });

  it("compounds explosions into a single die (10, 10, 4 = 24)", () => {
    const result = rollAndKeep(pool(2, 1), { rng: facesRng([10, 10, 4, 6]) });
    expect(result.dice[0]).toMatchObject({ chain: [10, 10, 4], total: 24, kept: true });
    expect(result.dice[1]).toMatchObject({ chain: [6], total: 6, kept: false });
    expect(result.total).toBe(24);
  });

  it("breaks ties by roll order", () => {
    const result = rollAndKeep(pool(3, 1), { rng: facesRng([5, 5, 2]) });
    expect(result.dice.map((d) => d.kept)).toEqual([true, false, false]);
  });

  it("zeroCharacteristic: a 10 counts as 0 and never explodes", () => {
    const result = rollAndKeep(pool(2, 1), { rng: facesRng([10, 3]), zeroCharacteristic: true });
    expect(result.dice[0]).toMatchObject({ chain: [10], total: 0 });
    expect(result.keptSum).toBe(3);
  });

  it("rerollOnes rerolls a 1 once, and the new 10 explodes", () => {
    const result = rollAndKeep(pool(1, 1), { rng: facesRng([1, 10, 2]), rerollOnes: true });
    expect(result.dice[0]).toMatchObject({ rerolled: [1], chain: [10, 2], total: 12 });
  });

  it("rerollOnes does not reroll a second 1", () => {
    const result = rollAndKeep(pool(1, 1), { rng: facesRng([1, 1]), rerollOnes: true });
    expect(result.dice[0]).toMatchObject({ rerolled: [1], chain: [1], total: 1 });
  });

  it("without rerollOnes a 1 stays", () => {
    const result = rollAndKeep(pool(1, 1), { rng: facesRng([1]) });
    expect(result.dice[0].rerolled).toBeUndefined();
    expect(result.total).toBe(1);
  });
});

describe("rollAndKeep — Proven and Volatile (spec 007, pp. 320–321)", () => {
  it("rerollBelow rerolls once the faces below the Proven value", () => {
    const result = rollAndKeep(pool(3, 3), { rng: facesRng([2, 8, 3, 1, 5]), rerollBelow: 3 });
    expect(result.dice[0]).toMatchObject({ rerolled: [2], chain: [8] });
    expect(result.dice[1]).toMatchObject({ chain: [3] });
    expect(result.dice[1].rerolled).toBeUndefined();
    expect(result.dice[2]).toMatchObject({ rerolled: [1], chain: [5] });
  });

  it("combines the specialty with Proven using the higher threshold", () => {
    const result = rollAndKeep(pool(1, 1), { rng: facesRng([2, 6]), rerollOnes: true, rerollBelow: 3 });
    expect(result.dice[0]).toMatchObject({ rerolled: [2], chain: [6] });
  });

  it("explodes on 9 with explodeOn 9 and never with explodeOn 11", () => {
    expect(rollAndKeep(pool(1, 1), { rng: facesRng([9, 4]), explodeOn: 9 }).dice[0].chain).toEqual([9, 4]);
    expect(rollAndKeep(pool(1, 1), { rng: facesRng([10, 4]), explodeOn: 11 }).dice[0].chain).toEqual([10]);
  });
});
