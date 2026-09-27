import { describe, expect, it } from "vitest";
import { allyBonus, casualties, minionDamage, squadDerived, squadPool } from "../../module/rules/minions.mjs";

describe("squadDerived (p. 543)", () => {
  it("has Static Defense 5 × TR, Speed = TR and range 10 × TR", () => {
    expect(squadDerived({ threatRating: 3 })).toEqual({ staticDefense: 15, speed: 3, range: 30 });
    expect(squadDerived({ threatRating: 1 })).toEqual({ staticDefense: 5, speed: 1, range: 10 });
  });
});

describe("squadPool (p. 543)", () => {
  it("rolls one die per attacking minion and keeps the Threat Rating, never more than rolled", () => {
    expect(squadPool({ count: 5, attacking: 5, threatRating: 3 })).toEqual({ rolled: 5, kept: 3 });
    expect(squadPool({ count: 5, attacking: 2, threatRating: 3 })).toEqual({ rolled: 2, kept: 2 });
    expect(squadPool({ count: 1, attacking: 5, threatRating: 1 })).toEqual({ rolled: 1, kept: 1 });
    expect(squadPool({ count: 0, attacking: 3, threatRating: 2 })).toEqual({ rolled: 0, kept: 0 });
  });
});

describe("minionDamage and casualties (pp. 543–544)", () => {
  it("deals 5 per Damage Rating and raise", () => {
    expect(minionDamage({ rating: 3, raises: 1 })).toBe(20);
    expect(minionDamage({ rating: 5, raises: 0 })).toBe(25);
  });

  it("removes one minion plus one per raise, or the Blast rating", () => {
    expect(casualties({ raises: 0, blast: 0 })).toBe(1);
    expect(casualties({ raises: 2, blast: 0 })).toBe(3);
    expect(casualties({ raises: 0, blast: 4 })).toBe(4);
  });
});

describe("allyBonus (p. 544)", () => {
  it("adds the highest Threat Rating plus one per minion beyond the first, up to Fellowship minions", () => {
    const squads = [{ threatRating: 2, count: 1 }, { threatRating: 3, count: 2 }];
    expect(allyBonus(squads, 4)).toBe(5);
    expect(allyBonus(squads, 2)).toBe(4);
    expect(allyBonus([], 4)).toBe(0);
    expect(allyBonus([{ threatRating: 3, count: 0 }], 4)).toBe(0);
    expect(allyBonus(squads, 0)).toBe(0);
  });
});
