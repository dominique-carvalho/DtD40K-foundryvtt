import { describe, expect, it } from "vitest";
import { CHARACTERISTICS, SKILLS } from "../../module/config.mjs";
import {
  assignPriorities, canReach, checkDots, creationChecklist, creationSpend, creationXp, languagesHint, ratingCaps, specialtyCheck,
  xpDots
} from "../../module/rules/creation.mjs";

const zero = (defs, base) => Object.fromEntries(Object.keys(defs).map((key) => [key, base]));
const buy = (kind, key, from, to, cost = 50) => ({ type: "purchase", kind, key, from, to, cost });

// Traya Psine Kaos, the example of pp. 18–19 (research R10): stored (base) values, race bonuses are effects.
const traya = {
  characteristics: { ...zero(CHARACTERISTICS, 1), str: 4, dex: 2, con: 3, cha: 1, fel: 2, cmp: 2, int: 1, wis: 2, wil: 4 },
  skills: {
    ...zero(SKILLS, 0),
    arcana: 1, commonLore: 1, perception: 1, techUse: 1,
    acrobatics: 2, athletics: 2, ballistics: 1, brawl: 4,
    animalKen: 2, charm: 1, scrutiny: 3
  },
  // Brawl 3 → 4 bought with XP; feats and assets do not touch the ratings.
  log: [buy("skill", "brawl", 3, 4), { type: "purchase", kind: "feat", key: "", from: 0, to: 0, cost: 100 }, { type: "award", kind: "", key: "", from: 0, to: 0, cost: 100 }]
};

describe("xpDots", () => {
  it("counts the dots bought for one rating", () => {
    expect(xpDots(traya.log, "skill", "brawl")).toBe(1);
    expect(xpDots(traya.log, "skill", "charm")).toBe(0);
    expect(xpDots(traya.log, "characteristic", "brawl")).toBe(0);
  });
});

describe("creationSpend (pp. 13–14)", () => {
  it("counts the characteristic dots of the example by group", () => {
    expect(creationSpend("characteristic", traya.characteristics, traya.log).byGroup).toEqual({ physical: 6, social: 2, mental: 4 });
  });

  it("counts the skill dots of the example without the XP dot", () => {
    const spend = creationSpend("skill", traya.skills, traya.log);
    expect(spend.byGroup).toEqual({ mental: 4, physical: 8, social: 6 });
    expect(spend.byKey.brawl).toBe(3);
  });
});

describe("assignPriorities", () => {
  it("fits the example exactly", () => {
    const chars = assignPriorities("characteristic", { physical: 6, social: 2, mental: 4 });
    expect(chars.fits).toBe(true);
    expect(chars.unspent).toBe(0);
    expect(chars.groups.map((g) => [g.key, g.budget])).toEqual([["physical", 6], ["mental", 4], ["social", 2]]);
    const skills = assignPriorities("skill", { mental: 4, physical: 8, social: 6 });
    expect(skills.fits).toBe(true);
    expect(skills.groups.map((g) => [g.key, g.budget])).toEqual([["physical", 8], ["social", 6], ["mental", 4]]);
  });

  it("refuses a group above the highest budget", () => {
    expect(assignPriorities("characteristic", { physical: 7, social: 0, mental: 0 }).fits).toBe(false);
  });

  it("fits a tie and reports what is left", () => {
    const result = assignPriorities("characteristic", { physical: 4, social: 4, mental: 0 });
    expect(result.fits).toBe(true);
    expect(result.unspent).toBe(4);
  });

  it("refuses two groups above the second budget", () => {
    expect(assignPriorities("characteristic", { physical: 5, social: 5, mental: 0 }).fits).toBe(false);
  });
});

describe("checkDots", () => {
  const fresh = { characteristics: zero(CHARACTERISTICS, 1), skills: zero(SKILLS, 0) };

  it("refuses a characteristic above 4 and a skill above 3 from creation dots", () => {
    expect(checkDots({ kind: "characteristic", key: "str", to: 5, source: { ...fresh.characteristics, str: 4 }, log: [] }))
      .toEqual({ allowed: false, reason: "stepMax" });
    expect(checkDots({ kind: "skill", key: "brawl", to: 4, source: { ...fresh.skills, brawl: 3 }, log: [] }))
      .toEqual({ allowed: false, reason: "stepMax" });
  });

  it("lets a rating with XP dots go past the step cap", () => {
    expect(checkDots({ kind: "skill", key: "brawl", to: 4, source: traya.skills, log: traya.log }).allowed).toBe(true);
  });

  it("refuses a dot past the budgets", () => {
    expect(checkDots({ kind: "characteristic", key: "dex", to: 3, source: traya.characteristics, log: [] }))
      .toEqual({ allowed: false, reason: "budget" });
  });

  it("allows lowering and dots within the budgets", () => {
    expect(checkDots({ kind: "characteristic", key: "str", to: 3, source: traya.characteristics, log: [] }).allowed).toBe(true);
    expect(checkDots({ kind: "skill", key: "drive", to: 1, source: fresh.skills, log: [] }).allowed).toBe(true);
  });
});

describe("ratingCaps (pp. 22, 68, 76, 84, 213)", () => {
  it("caps at 5 without an exception", () => {
    expect(ratingCaps({ exaltation: null, feats: [] })).toEqual({ characteristic: { max: 5, limit: 0 }, skill: { max: 5, limit: 0 } });
  });

  it("lets three skills of an Atlantean reach 6, nine with the Mark of Slaanesh", () => {
    expect(ratingCaps({ exaltation: { name: "Atlantean", powerStat: 1 }, feats: [] }).skill).toEqual({ max: 6, limit: 3 });
    expect(ratingCaps({ exaltation: { name: "Atlantean", powerStat: 1 }, feats: ["Mark of Slaanesh"] }).skill).toEqual({ max: 6, limit: 9 });
  });

  it("needs the rank of the power for Daemonhost and Paragon", () => {
    expect(ratingCaps({ exaltation: { name: "Daemonhost", powerStat: 1 }, feats: [] }).characteristic.max).toBe(5);
    expect(ratingCaps({ exaltation: { name: "Daemonhost", powerStat: 2 }, feats: [] }).characteristic).toEqual({ max: 6, limit: Infinity });
    const paragon = ratingCaps({ exaltation: { name: "Paragon", powerStat: 2 }, feats: [] });
    expect(paragon.characteristic.max).toBe(6);
    expect(paragon.skill).toEqual({ max: 6, limit: Infinity });
  });
});

describe("canReach", () => {
  const none = { max: 5, limit: 0 };
  it("refuses 6 without an exception", () => {
    expect(canReach({ to: 6, cap: none, atSix: 0 })).toEqual({ allowed: false, reason: "atMax" });
    expect(canReach({ to: 5, cap: none, atSix: 0 }).allowed).toBe(true);
  });

  it("refuses a sixth-dot rating past the limit", () => {
    expect(canReach({ to: 6, cap: { max: 6, limit: 3 }, atSix: 3 })).toEqual({ allowed: false, reason: "sixLimit" });
    expect(canReach({ to: 6, cap: { max: 6, limit: 3 }, atSix: 2 }).allowed).toBe(true);
  });
});

describe("specialtyCheck (p. 23)", () => {
  const ratings = (skill = {}, characteristic = {}) => ({
    characteristic: { ...zero(CHARACTERISTICS, 1), ...characteristic }, skill: { ...zero(SKILLS, 0), ...skill }
  });
  const lists = (skill = {}, characteristic = {}) => ({ characteristic, skill });

  it("asks for one specialty at 4 dots, characteristics included", () => {
    const result = specialtyCheck({ ratings: ratings({ brawl: 4 }, { con: 4 }), specialties: lists() });
    expect(result.missing).toEqual([{ kind: "characteristic", key: "con" }, { kind: "skill", key: "brawl" }]);
    expect(specialtyCheck({ ratings: ratings({ brawl: 4 }), specialties: lists({ brawl: ["Grapple"] }) }).missing).toEqual([]);
  });

  it("flags a specialty on a rating below 4", () => {
    expect(specialtyCheck({ ratings: ratings({ charm: 3 }), specialties: lists({ charm: ["Nobles"] }) }).excess)
      .toEqual([{ kind: "skill", key: "charm", count: 1 }]);
  });

  it("counts Expanded Knowledge, Education and the Atlantean", () => {
    const knowledge = { ratings: ratings(), specialties: lists({ arcana: ["Runes"], perception: ["Sight"] }), extras: { expandedKnowledge: true } };
    expect(specialtyCheck(knowledge).excess).toEqual([{ kind: "skill", key: "perception", count: 1 }]);
    const lores = lists({ academicLore: ["History"], commonLore: ["Hive"], forbiddenLore: ["Daemons"] });
    expect(specialtyCheck({ ratings: ratings(), specialties: lores, extras: { education: 2 } }).excess)
      .toEqual([{ kind: "skill", key: "forbiddenLore", count: 1 }]);
    const syrneth = lists({ pilot: ["Syrneth"], drive: ["Syrneth"] });
    expect(specialtyCheck({ ratings: ratings(), specialties: syrneth, extras: { atlantean: 3 } }).excess).toEqual([]);
  });
});

describe("creationXp and languagesHint", () => {
  it("shows the XP of the example (p. 18)", () => {
    expect(creationXp({ total: 800, spent: 750, available: 50, hindranceXp: 200 }, []))
      .toEqual({ total: 800, spent: 750, available: 50, hindranceXp: 200, awards: 0 });
    expect(creationXp({ total: 900, spent: 0, available: 900, hindranceXp: 0 }, [{ type: "award", cost: 300 }]).awards).toBe(300);
  });

  it("counts the languages (p. 24)", () => {
    expect(languagesHint(1)).toBe(2);
    expect(languagesHint(4)).toBe(4);
  });
});

describe("creationChecklist", () => {
  const done = { groups: [{ spent: 6 }, { spent: 4 }, { spent: 2 }], fits: true, unspent: 0 };
  const none = { groups: [{ spent: 0 }, { spent: 0 }, { spent: 0 }], fits: true, unspent: 12 };
  const slots = { rare: { used: 1, max: 1 }, uncommon: { used: 1, max: 1 }, common: { used: 2, max: 2 }, veryCommon: { used: 2, max: 2 } };
  const finished = {
    race: true, exaltation: true, classes: [{ level: 1, current: true }], deity: true, devotion: 6,
    characteristics: done, skills: done, backgroundDots: 7, xp: { available: 50, awards: 0 },
    specialties: { missing: [], excess: [] }, slots, int: 1
  };
  const status = (steps) => Object.fromEntries(steps.map((s) => [s.key, s.status]));

  it("marks the finished example as done", () => {
    const steps = creationChecklist(finished);
    expect(Object.values(status(steps)).every((s) => s === "done")).toBe(true);
    expect(steps.find((s) => s.key === "languages").data.count).toBe(2);
  });

  it("marks the steps of a fresh character as pending", () => {
    const fresh = {
      ...finished, exaltation: false, classes: [], deity: false, characteristics: none, skills: none, backgroundDots: 0,
      xp: { available: 600, awards: 0 }, slots: { rare: { used: 0, max: 1 } }
    };
    const result = status(creationChecklist(fresh));
    expect(result.exaltation).toBeUndefined();
    expect(result).toMatchObject({
      race: "done", class: "pending", alignment: "pending", characteristics: "pending", skills: "pending",
      backgrounds: "pending", equipment: "pending"
    });
  });

  it("warns about unspent dots, a Level 2 class and a changed Devotion", () => {
    const result = status(creationChecklist({
      ...finished, characteristics: { ...done, unspent: 2 }, classes: [{ level: 2, current: true }], devotion: 4
    }));
    expect(result).toMatchObject({ characteristics: "warning", class: "warning", alignment: "warning" });
  });
});
