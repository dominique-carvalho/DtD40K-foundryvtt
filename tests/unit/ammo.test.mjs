import { describe, expect, it } from "vitest";
import { parseReload, reloadStep, roundsFor, spendRounds, tracksAmmo } from "../../module/rules/ammo.mjs";

const gun = (over = {}) => ({ weaponType: "basic", thrown: false, clip: 30, ammoGroup: "", rof: { single: true, auto: 10 }, ...over });

describe("tracksAmmo (research R1)", () => {
  it("counts rounds only for ranged weapons with a clip and no launcher ammo", () => {
    expect(tracksAmmo(gun())).toBe(true);
    expect(tracksAmmo(gun({ weaponType: "melee", clip: 0 }))).toBe(false);
    expect(tracksAmmo(gun({ weaponType: "melee", thrown: true, clip: 0 }))).toBe(false);
    expect(tracksAmmo(gun({ clip: 0 }))).toBe(false);
    expect(tracksAmmo(gun({ weaponType: "heavy", clip: 6, ammoGroup: "grenade" }))).toBe(false);
    expect(tracksAmmo(null)).toBe(false);
  });
});

describe("parseReload (p. 318)", () => {
  it("reads every spelling of the packs", () => {
    expect(parseReload("Half")).toEqual({ type: "half", actions: 1 });
    expect(parseReload("Full")).toEqual({ type: "full", actions: 1 });
    expect(parseReload("2Full")).toEqual({ type: "full", actions: 2 });
    expect(parseReload("2 Full")).toEqual({ type: "full", actions: 2 });
    expect(parseReload("8Full")).toEqual({ type: "full", actions: 8 });
    expect(parseReload("Free")).toEqual({ type: "free", actions: 1 });
    expect(parseReload("-")).toEqual({ type: "none", actions: 0 });
    expect(parseReload("")).toEqual({ type: "none", actions: 0 });
  });
});

describe("roundsFor and spendRounds (pp. 318, 426)", () => {
  it("spends 1 for a single shot and the ROF for a burst", () => {
    expect(roundsFor({ mode: "single", rof: 10 })).toBe(1);
    expect(roundsFor({ mode: "auto", rof: 10 })).toBe(10);
  });

  it("fires a short burst with the rounds left", () => {
    expect(spendRounds({ current: 30, mode: "single", rof: 10 })).toEqual({ allowed: true, spent: 1, left: 29, effectiveRof: 10 });
    expect(spendRounds({ current: 19, mode: "auto", rof: 10 })).toEqual({ allowed: true, spent: 10, left: 9, effectiveRof: 10 });
    expect(spendRounds({ current: 9, mode: "auto", rof: 10 })).toEqual({ allowed: true, spent: 9, left: 0, effectiveRof: 9 });
  });

  it("refuses an empty clip", () => {
    expect(spendRounds({ current: 0, mode: "single", rof: 10 })).toEqual({ allowed: false, spent: 0, left: 0, effectiveRof: 0 });
  });
});

describe("reloadStep (pp. 424, 429)", () => {
  it("needs a spare clip", () => {
    expect(reloadStep({ progress: 0, actions: 1, spare: 0 })).toEqual({ allowed: false, reason: "noSpare", progress: 0, done: false });
  });

  it("fills at once or after the last of several actions", () => {
    expect(reloadStep({ progress: 0, actions: 1, spare: 2 })).toEqual({ allowed: true, reason: "", progress: 0, done: true });
    expect(reloadStep({ progress: 0, actions: 2, spare: 2 })).toEqual({ allowed: true, reason: "", progress: 1, done: false });
    expect(reloadStep({ progress: 1, actions: 2, spare: 2 })).toEqual({ allowed: true, reason: "", progress: 0, done: true });
  });

  it("refuses a weapon that is not reloaded", () => {
    expect(reloadStep({ progress: 0, actions: 0, spare: 2 }).reason).toBe("noReload");
  });
});
