import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  UNIVERSAL_ADVANTAGES, UNIVERSAL_RESTRICTIONS, adeptLevels, attackCost, attackModifiers, attackTotals, budget, options, points,
  resolveRef, usageCheck
} from "../../module/rules/martial.mjs";

describe("universal Advantages and Restrictions (p. 262, p. 273)", () => {
  it("lists 5 Advantages and 7 Restrictions with their costs", () => {
    expect(UNIVERSAL_ADVANTAGES.map((a) => [a.name, a.cost, a.perPoint])).toEqual([
      ["First Damage Improvement", 1, true], ["Second Damage Mastery", 3, true], ["First Accuracy Improvement", 1, true],
      ["Second Accuracy Mastery", 2, true], ["Penetration Mastery", 1, true]
    ]);
    expect(UNIVERSAL_RESTRICTIONS.map((r) => [r.name, r.cost, r.perPoint])).toEqual([
      ["Difficult Strike", -1, false], ["Last Resort", -2, false], ["Restrained Force", -1, true], ["Unbroken Skin", -2, true],
      ["Inaccurate", -1, true], ["Overextended", -2, true], ["Non-Penetrating", -1, false]
    ]);
  });
});

describe("adeptLevels (pp. 260, 272)", () => {
  it("takes the highest Sword School and the highest Gun Kata", () => {
    expect(adeptLevels({ settingSun: 2, ironHeart: 3 })).toEqual({ adeptLevel: 3, gunslingerLevel: 0 });
    expect(adeptLevels({ clayPigeon: 3, pointBlank: 2, ironHeart: 1 })).toEqual({ adeptLevel: 1, gunslingerLevel: 3 });
    expect(adeptLevels({})).toEqual({ adeptLevel: 0, gunslingerLevel: 0 });
  });
});

// Schools as the compendium stores them.
const FILES = ["desert-wind", "setting-sun", "iron-heart", "clay-pigeon", "point-blank", "devoted-spirit", "stone-dragon",
  "elemental-gearbolt", "tiger-claw", "shadow-hand"];
const pack = Object.fromEntries(FILES.map((file) => {
  const doc = JSON.parse(readFileSync(`src/packs/martial-schools/martial-${file}.json`, "utf8"));
  return [doc.system.key, doc];
}));
const opts = (kind, ranks) => options({ schools: pack, ranks, kind });
const pick = (list, name) => list.find((o) => o.name === name);

describe("options (pp. 261–262, 272–273)", () => {
  it("always offers the Standard Attack and the actions of rank 1 of the schools known", () => {
    expect(opts("special", {}).actions.map((a) => a.key)).toEqual(["standardAttack"]);
    const o = opts("special", { stoneDragon: 1, ironHeart: 1 });
    expect(o.actions.map((a) => a.key)).toEqual(["standardAttack", "aim", "calledShot"]);
    expect(pick(o.actions, "Action (Aim)")).toMatchObject({ prepares: true, ref: "ironHeart:actionAim" });
  });

  it("offers school Advantages and Restrictions up to the rank, universals always", () => {
    const o = opts("special", { settingSun: 2, ironHeart: 3 });
    expect(pick(o.advantages, "First Damage Improvement")).toMatchObject({ ref: "universal:firstDamage", cost: 1, perPoint: true });
    expect(pick(o.advantages, "Knockout Blow")).toBeDefined();
    expect(pick(o.advantages, "Hammer of the Emperor")).toBeDefined();
    expect(pick(o.advantages, "Distraction Method")).toBeUndefined();
    expect(pick(o.restrictions, "Opening the Path")).toMatchObject({ ref: "ironHeart:openingThePath", cost: -2 });
    expect(pick(o.restrictions, "Skill (Perception)")).toBeDefined();
    expect(pick(o.restrictions, "Weapon (Brawl)")).toBeDefined();
    expect(pick(o.restrictions, "Difficult Strike")).toBeDefined();
  });

  it("keeps Gun Kata for Trick Shots and Sword Schools for Special Attacks", () => {
    const ranks = { ironHeart: 2, clayPigeon: 3 };
    expect(pick(opts("special", ranks).advantages, "Total Recoil")).toBeUndefined();
    expect(pick(opts("trick", ranks).advantages, "Total Recoil")).toBeDefined();
    expect(pick(opts("trick", ranks).advantages, "Hammer of the Emperor")).toBeUndefined();
    expect(opts("trick", ranks).actions.map((a) => a.key)).toEqual(["standardAttack", "calledShot"]);
  });
});

describe("points, budget and cost (p. 261, p. 273)", () => {
  const o = opts("special", { settingSun: 2, ironHeart: 3, devotedSpirit: 2 });
  it("counts repeatable entries per purchase and variable costs by the choice", () => {
    expect(points(pick(o.advantages, "First Damage Improvement"), 2)).toBe(2);
    expect(points(pick(o.advantages, "Knockout Blow"), 1)).toBe(2);
    expect(points(pick(o.advantages, "Revitalizing Strike"), 1, 3)).toBe(3);
    expect(points(pick(o.advantages, "Revitalizing Strike"), 1)).toBe(1);
    expect(points(pick(o.restrictions, "Opening the Path"), 1)).toBe(2);
    expect(points(pick(o.restrictions, "Difficult Strike"), 3)).toBe(1);
    const exit = pick(opts("trick", { elementalGearbolt: 3 }).advantages, "Exit Wound Kata");
    expect(points(exit, 1, 2)).toBe(2);
  });

  it("follows the book's budget", () => {
    // Rocky (p. 261): Hammer 2 + Knockout 2 + First Damage ×2 = 6; Opening the Path 2 + Difficult 1 = 3; level 3.
    expect(budget({ advantages: 6, restrictions: 3, level: 3 })).toEqual({ ok: true, reason: "", missing: 0 });
    expect(budget({ advantages: 3, restrictions: 0, level: 3 })).toEqual({ ok: true, reason: "", missing: 0 });
    expect(budget({ advantages: 5, restrictions: 1, level: 3 })).toEqual({ ok: false, reason: "needRestrictions", missing: 1 });
    expect(budget({ advantages: 7, restrictions: 4, level: 3 })).toMatchObject({ ok: false, reason: "overCap" });
    expect(budget({ advantages: 1, restrictions: 0, level: 0 })).toMatchObject({ ok: false, reason: "noLevel" });
    expect(budget({ advantages: 0, restrictions: 0, level: 2 })).toMatchObject({ ok: false, reason: "empty" });
    // Commissar Drago (p. 273): 4 points, Gunslinger 3, one point of Restriction.
    expect(budget({ advantages: 4, restrictions: 1, level: 3 }).ok).toBe(true);
  });

  it("costs 50 XP per style point of Advantages added", () => {
    expect(attackCost({ points: 6, paid: 0 })).toBe(300);
    expect(attackCost({ points: 5, paid: 4 })).toBe(50);
    expect(attackCost({ points: 3, paid: 4 })).toBe(0);
  });

  it("totals an attack definition", () => {
    const attack = {
      kind: "special", action: "standardAttack",
      advantages: [{ ref: "ironHeart:hammerOfTheEmperor", count: 1 }, { ref: "settingSun:knockoutBlow", count: 1 }, { ref: "universal:firstDamage", count: 2 }],
      restrictions: [{ ref: "ironHeart:openingThePath", count: 1 }, { ref: "universal:difficultStrike", count: 1 }]
    };
    expect(attackTotals(attack, pack)).toMatchObject({ advantages: 6, restrictions: 3, missing: [] });
    expect(attackTotals({ ...attack, advantages: [{ ref: "ironHeart:gone", count: 1 }] }, pack).missing).toEqual(["ironHeart:gone"]);
  });
});

describe("usageCheck (pp. 261–279)", () => {
  const entries = (refs) => refs.map((ref) => ({ option: resolveRef(ref, pack), count: 1 }));
  const sword = { group: "Ordinary", weaponType: "melee", unarmed: false };
  const base = { weapon: sword, inCombat: true, round: 3, combatId: "c1", targetStatuses: [], hp: { value: 6, max: 6 }, kind: "special" };
  const state = { lastRound: 0, lastCombat: "", usedScene: false };
  const reasons = (result) => result.blocked.map((b) => b.reason);

  it("checks weapon group, weapon type and no weapon", () => {
    expect(reasons(usageCheck({ state }, { ...base, entries: entries(["desertWind:weaponSyrneth"]) }))).toEqual(["weapon"]);
    expect(usageCheck({ state }, { ...base, weapon: { group: "Syrneth", weaponType: "melee", unarmed: false }, entries: entries(["desertWind:weaponSyrneth"]) }).blocked).toEqual([]);
    expect(usageCheck({ state }, { ...base, weapon: { group: "", weaponType: "melee", unarmed: true }, entries: entries(["settingSun:weaponBrawl", "settingSun:eaglesClaw"]) }).blocked).toEqual([]);
    expect(reasons(usageCheck({ state }, { ...base, entries: entries(["settingSun:eaglesClaw"]) }))).toEqual(["weapon"]);
    const pistol = { group: "Bolter", weaponType: "pistol", unarmed: false };
    expect(usageCheck({ state }, { ...base, kind: "trick", weapon: pistol, entries: entries(["clayPigeon:ocelotsRoar"]) }).blocked).toEqual([]);
    expect(reasons(usageCheck({ state }, { ...base, kind: "trick", weapon: sword, entries: entries(["clayPigeon:ocelotsRoar"]) }))).toEqual(["weapon"]);
  });

  it("needs a melee weapon for a Special Attack", () => {
    const pistol = { group: "Bolter", weaponType: "pistol", unarmed: false };
    expect(reasons(usageCheck({ state }, { ...base, weapon: pistol, entries: [] }))).toEqual(["notMelee"]);
  });

  it("checks Difficult Strike, Last Resort, the target and the HP", () => {
    const diff = entries(["universal:difficultStrike"]);
    expect(reasons(usageCheck({ state: { ...state, lastRound: 2, lastCombat: "c1" } }, { ...base, entries: diff }))).toEqual(["cooldown"]);
    expect(usageCheck({ state: { ...state, lastRound: 1, lastCombat: "c1" } }, { ...base, entries: diff }).blocked).toEqual([]);
    expect(usageCheck({ state: { ...state, lastRound: 2, lastCombat: "c0" } }, { ...base, entries: diff }).blocked).toEqual([]);
    expect(reasons(usageCheck({ state: { ...state, usedScene: true } }, { ...base, entries: entries(["universal:lastResort"]) }))).toEqual(["perScene"]);
    expect(reasons(usageCheck({ state }, { ...base, entries: entries(["shadowHand:deathBlow"]) }))).toEqual(["target"]);
    expect(usageCheck({ state }, { ...base, targetStatuses: ["helpless"], entries: entries(["shadowHand:deathBlow"]) }).blocked).toEqual([]);
    const tin = { ...base, kind: "trick", weapon: { group: "Las", weaponType: "pistol", unarmed: false } };
    const blaze = [{ option: { name: "Blaze of Glory", automation: { requires: { hpHalf: true } } }, count: 1 }];
    expect(reasons(usageCheck({ state }, { ...tin, entries: blaze }))).toEqual(["hp"]);
    expect(usageCheck({ state }, { ...tin, hp: { value: 3, max: 6 }, entries: blaze }).blocked).toEqual([]);
    expect(usageCheck({ state }, { ...tin, entries: entries(["pointBlank:dragonsDance"]) }).reminders).toEqual(["Dragon's Dance"]);
  });
});

describe("attackModifiers (research R5)", () => {
  const mods = (refs) => attackModifiers(refs.map(([ref, count = 1, choice = 0]) => ({ option: resolveRef(ref, pack), count, choice })));
  it("adds attack, damage and Penetration, and zeroes the Pen with Non-Penetrating", () => {
    expect(mods([["universal:firstAccuracy", 2], ["universal:penetration", 1]])).toMatchObject({ attack: { rolled: 2, kept: 0 }, pen: 2, penZero: false });
    expect(mods([["universal:secondDamage", 1], ["universal:restrainedForce", 2], ["universal:nonPenetrating"]])).toMatchObject({ damage: { rolled: -2, kept: 1 }, penZero: true });
  });

  it("collects qualities, effects on hit and miss, self effects and the damage resolution", () => {
    const m = mods([["desertWind:burningBlade"], ["desertWind:blisteringFlourish"], ["ironHeart:openingThePath"], ["tigerClaw:deathFromAbove"],
      ["stoneDragon:fellingGiantsBlow"], ["stoneDragon:earthShatteringAttack", 2], ["settingSun:knockoutBlow", 2]]);
    expect(m.qualities).toEqual([{ key: "incendiary" }, { key: "blast", value: 4 }]);
    expect(m.onHit).toEqual([{ condition: "dazed", rounds: "perRaise" }, { fatigue: 2 }]);
    expect(m.onMiss).toEqual([{ condition: "prone" }]);
    expect(m.self).toEqual([{ changes: [{ key: "system.modifiers.combat.sd", value: -10 }], untilNextTurn: true }]);
    expect(m.resolve).toEqual({ resilienceMod: -2 });
  });

  it("keeps the skill test, the Strength rule, explosions and the text of what is not automated", () => {
    const m = mods([["desertWind:skillAthletics"], ["desertWind:emptyHand"], ["tigerClaw:bloodInTheWater"], ["desertWind:leapingFlame"],
      ["ironHeart:strikeOfPerfectClarity"]]);
    expect(m).toMatchObject({ test: "athletics", noStrength: true, explodeOn: 9, damagePerRaise: { rolled: 1 } });
    expect(m.texts.map((t) => t.name)).toEqual(["Leaping Flame"]);
    expect(mods([["elementalGearbolt:exitWoundKata", 1, 3]]).onHit).toEqual([{ hpLoss: 3 }]);
  });
});
