import { describe, expect, it } from "vitest";
import {
  UNARMED, attackPool, attackSkill, damagePool, effectiveQualities, fullAutoHits, hitLocation, isJammed, isProficient
} from "../../module/rules/weapon.mjs";

const weapon = (extra = {}) => ({
  weaponType: "pistol", thrown: false, proficiencies: ["Basic", "Ranged 1"], damage: { rolled: 2, kept: 2, type: "I" },
  pen: 0, rof: { single: true, auto: 6 }, qualities: [], craftsmanship: "common", material: "", ...extra
});
const autopistol = weapon();
const sword = weapon({ weaponType: "melee", proficiencies: ["Basic", "Melee 1"], damage: { rolled: 1, kept: 2, type: "R" }, rof: { single: true, auto: 0 } });
const q = (key, value = null) => ({ key, value });
const pool = (result) => `${result.rolled}k${result.kept}`;

describe("attackSkill and isProficient (pp. 197, 431)", () => {
  it("uses Weaponry in melee, Ballistics at range and Brawl for Brawling weapons", () => {
    expect(attackSkill(sword)).toBe("weaponry");
    expect(attackSkill(autopistol)).toBe("ballistics");
    expect(attackSkill(sword, { thrown: true })).toBe("ballistics");
    expect(attackSkill(weapon({ weaponType: "melee", qualities: [q("brawling")] }))).toBe("brawl");
    expect(attackSkill(UNARMED)).toBe("brawl");
  });

  it("is proficient when any accepted group matches, and a thrown melee weapon uses Throwing", () => {
    expect(isProficient(autopistol, ["Ranged 1"])).toBe(true);
    expect(isProficient(weapon({ proficiencies: ["Basic", "Ranged 2"] }), ["Basic"])).toBe(true);
    expect(isProficient(autopistol, ["Melee 1"])).toBe(false);
    expect(isProficient(sword, ["Melee 1"], { thrown: true })).toBe(false);
    expect(isProficient(sword, ["Throwing"], { thrown: true })).toBe(true);
  });
});

describe("attackPool (pp. 425–435)", () => {
  const base = { weapon: autopistol, skill: 3, level: 2 };

  it("rolls skill k skill and adds Level k0 when proficient", () => {
    expect(pool(attackPool({ ...base, proficient: true }))).toBe("5k3");
    expect(pool(attackPool({ ...base, proficient: false }))).toBe("3k3");
  });

  it("applies the range bands", () => {
    expect(pool(attackPool({ ...base, proficient: false, options: { range: "pointBlank" } }))).toBe("5k4");
    expect(pool(attackPool({ ...base, proficient: false, options: { range: "short" } }))).toBe("4k3");
    expect(attackPool({ ...base, proficient: false, options: { range: "long" } }).requiredRaises).toBe(1);
    expect(attackPool({ ...base, proficient: false, options: { range: "extreme" } }).requiredRaises).toBe(3);
  });

  it("applies Aim, Accurate and Inaccurate", () => {
    expect(pool(attackPool({ ...base, proficient: false, options: { aim: 1 } }))).toBe("4k3");
    expect(pool(attackPool({ ...base, proficient: false, options: { aim: 2 } }))).toBe("5k4");
    expect(pool(attackPool({ ...base, weapon: weapon({ qualities: [q("accurate")] }), proficient: false, options: { aim: 1 } }))).toBe("5k3");
    expect(pool(attackPool({ ...base, weapon: weapon({ qualities: [q("inaccurate")] }), proficient: false, options: { aim: 2 } }))).toBe("3k3");
  });

  it("gives +2k1 on full auto and removes it from unbraced heavy weapons", () => {
    expect(pool(attackPool({ ...base, proficient: false, options: { mode: "auto" } }))).toBe("5k4");
    const heavy = weapon({ weaponType: "heavy" });
    const unbraced = attackPool({ ...base, weapon: heavy, proficient: false, options: { mode: "auto" } });
    expect(pool(unbraced)).toBe("0k2");
    expect(unbraced.autoAllowed).toBe(false);
    expect(pool(attackPool({ ...base, weapon: heavy, proficient: false, options: { braced: true } }))).toBe("3k3");
  });

  it("penalizes one-handed basic weapons unless Compact", () => {
    const basic = weapon({ weaponType: "basic" });
    expect(pool(attackPool({ ...base, weapon: basic, proficient: false, options: { oneHanded: true } }))).toBe("1k3");
    const compact = weapon({ weaponType: "basic", qualities: [q("compact")] });
    expect(pool(attackPool({ ...base, weapon: compact, proficient: false, options: { oneHanded: true } }))).toBe("3k3");
  });

  it("applies Defensive, Twin Linked, Weapon Focus and materials", () => {
    const defensive = weapon({ weaponType: "melee", qualities: [q("defensive")] });
    expect(pool(attackPool({ ...base, weapon: defensive, proficient: false }))).toBe("1k3");
    expect(pool(attackPool({ ...base, weapon: weapon({ qualities: [q("twinLinked")] }), proficient: false }))).toBe("4k3");
    expect(pool(attackPool({ ...base, proficient: false, focus: true }))).toBe("5k3");
    expect(pool(attackPool({ ...base, weapon: { ...sword, material: "orichalcum" }, proficient: false }))).toBe("5k3");
    expect(pool(attackPool({ ...base, weapon: { ...sword, material: "mithril" }, proficient: false }))).toBe("4k4");
    expect(pool(attackPool({ ...base, weapon: { ...autopistol, material: "orichalcum" }, proficient: false }))).toBe("4k4");
    const mithrilHeavy = weapon({ weaponType: "heavy", material: "mithril" });
    expect(pool(attackPool({ ...base, weapon: mithrilHeavy, proficient: false }))).toBe("3k3");
  });

  it("ignores range and full auto in melee", () => {
    const result = attackPool({ ...base, weapon: sword, proficient: false, options: { range: "pointBlank", mode: "auto" } });
    expect(pool(result)).toBe("3k3");
    expect(result.autoAllowed).toBe(false);
  });
});

describe("damagePool (pp. 318–321, 431)", () => {
  it("adds Strength as rolled dice to melee damage but not to guns or explosives", () => {
    expect(pool(damagePool({ weapon: sword, str: 3 }))).toBe("4k2");
    expect(pool(damagePool({ weapon: autopistol, str: 3 }))).toBe("2k2");
    const grenade = weapon({ weaponType: "thrown", damage: { rolled: 2, kept: 2, type: "X" }, qualities: [q("blast", 4)] });
    expect(pool(damagePool({ weapon: grenade, str: 3 }))).toBe("2k2");
    expect(pool(damagePool({ weapon: sword, str: 3, options: { thrown: true } }))).toBe("4k2");
  });

  it("applies melee craftsmanship and Best's Proven", () => {
    expect(pool(damagePool({ weapon: { ...sword, craftsmanship: "poor" }, str: 0 }))).toBe("0k2");
    expect(pool(damagePool({ weapon: { ...sword, craftsmanship: "good" }, str: 0 }))).toBe("2k2");
    expect(damagePool({ weapon: { ...sword, craftsmanship: "best" }, str: 0 }).rerollBelow).toBe(2);
    expect(damagePool({ weapon: weapon({ qualities: [q("proven", 3)], craftsmanship: "best" }), str: 0 }).rerollBelow).toBe(4);
  });

  it("reads Proven and Volatile", () => {
    expect(damagePool({ weapon: weapon({ qualities: [q("proven", 3)] }), str: 0 }).rerollBelow).toBe(3);
    expect(damagePool({ weapon: weapon({ qualities: [q("volatile")] }), str: 0 }).explodeOn).toBe(9);
    expect(damagePool({ weapon: autopistol, str: 0 }).explodeOn).toBe(10);
  });

  it("adds full auto hits, Storm, Weapon Specialization, Twin Linked and Razor Sharp", () => {
    expect(pool(damagePool({ weapon: autopistol, str: 0, options: { mode: "auto" }, extraHits: 2 }))).toBe("4k2");
    expect(pool(damagePool({ weapon: weapon({ qualities: [q("storm")] }), str: 0, options: { mode: "auto" }, extraHits: 2 }))).toBe("6k2");
    expect(pool(damagePool({ weapon: autopistol, str: 0, specialization: true }))).toBe("4k2");
    expect(pool(damagePool({ weapon: weapon({ qualities: [q("twinLinked")] }), str: 0, raises: 2 }))).toBe("4k2");
    expect(damagePool({ weapon: weapon({ pen: 3, qualities: [q("razorSharp")] }), str: 0, raises: 2 }).pen).toBe(6);
  });

  it("applies material damage and Pen", () => {
    expect(pool(damagePool({ weapon: { ...sword, material: "orichalcum" }, str: 0 }))).toBe("3k2");
    expect(damagePool({ weapon: { ...sword, material: "darksteel", pen: 2 }, str: 0 }).pen).toBe(10);
    expect(pool(damagePool({ weapon: { ...autopistol, material: "necrodermis" }, str: 0 }))).toBe("3k2");
  });

  it("deals 0k1 plus Strength unarmed", () => {
    expect(pool(damagePool({ weapon: UNARMED, str: 2 }))).toBe("2k1");
  });
});

describe("effectiveQualities (p. 319)", () => {
  it("gives Unreliable to Poor guns and Reliable to Good guns", () => {
    expect(effectiveQualities(weapon({ craftsmanship: "poor", qualities: [q("reliable")] }))).toEqual({ unreliable: true });
    expect(effectiveQualities(weapon({ craftsmanship: "good" }))).toEqual({ reliable: true });
    expect(effectiveQualities(weapon({ craftsmanship: "best" }))).toEqual({ reliable: true, proven: 2 });
  });

  it("ignores craftsmanship with a material, and Orichalcum guns are Reliable", () => {
    expect(effectiveQualities({ ...sword, craftsmanship: "best", material: "mithril" })).toEqual({});
    expect(effectiveQualities({ ...autopistol, material: "orichalcum" })).toEqual({ reliable: true });
  });
});

describe("fullAutoHits, isJammed and hitLocation (pp. 427, 431, 435)", () => {
  it("counts one hit plus one per raise up to the ROF", () => {
    expect(fullAutoHits(3, 6)).toBe(4);
    expect(fullAutoHits(8, 6)).toBe(6);
    expect(fullAutoHits(0, 6)).toBe(1);
  });

  it("jams on more kept 1s than the Level; Unreliable counts 2s; Reliable never", () => {
    expect(isJammed({ keptFaces: [1, 1, 7], level: 1 })).toBe(true);
    expect(isJammed({ keptFaces: [1, 7], level: 1 })).toBe(false);
    expect(isJammed({ keptFaces: [1, 2, 7], level: 1, unreliable: true })).toBe(true);
    expect(isJammed({ keptFaces: [1, 1, 1], level: 1, reliable: true })).toBe(false);
  });

  it("maps the d10 to the hit location", () => {
    expect([1, 2, 3, 6, 7, 8, 9, 10].map(hitLocation)).toEqual(["leftLeg", "rightLeg", "body", "body", "gizzards", "leftArm", "rightArm", "head"]);
  });
});
