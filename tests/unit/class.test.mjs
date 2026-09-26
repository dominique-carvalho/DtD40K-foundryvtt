import { describe, expect, it } from "vitest";
import {
  buildCompletionEffects, characterLevel, checkClassEntry, classProgress, completionSkillOptions, matchesListFeat
} from "../../module/rules/class.mjs";

const f = (name, subcategory = "", mandatory = true, orGroup = "") => ({ name, subcategory, mandatory, orGroup });
const owned = (name, subcategory = "") => ({ name: subcategory ? `${name} (${subcategory})` : name, system: { selection: { subcategory } } });

/** Class system data (ClassData subset). */
const cls = (name, { level = 1, feats = [], skills = [], prereqFeats = [], schools = [], text = "", status = "current", completion = {} } = {}) => ({
  name,
  system: {
    level,
    feats,
    prerequisites: { skills, feats: prereqFeats, schools, text },
    status,
    completion: { automation: "none", value: 0, skillGroup: "any", grants: [], ...completion }
  }
});

const swordsman = cls("Swordsman", {
  feats: [f("Quick Draw"), f("Armor Proficiency", "Any", false), f("Hardy"), f("Fast Reflexes"), f("Power Attack"), f("Weapon Proficiency", "Any", false)],
  skills: [{ keys: ["weaponry"], value: 2 }, { keys: ["athletics"], value: 1 }]
});

/** Every skill defaults to 0. */
const skills = (values = {}) => new Proxy({}, { get: (_, key) => ({ value: values[key] ?? 0 }) });

describe("matchesListFeat (p. 106)", () => {
  it("matches by base name, ignoring case", () => {
    expect(matchesListFeat(f("Fan the Hammer"), owned("Fan The Hammer"))).toBe(true);
    expect(matchesListFeat(f("Quick Draw"), owned("Hardy"))).toBe(false);
  });

  it("accepts any sub-category for (Any) or none, and requires a fixed one", () => {
    expect(matchesListFeat(f("Weapon Proficiency", "Any"), owned("Weapon Proficiency", "Basic"))).toBe(true);
    expect(matchesListFeat(f("Peer", "Religious Organization"), owned("Peer", "Nobility"))).toBe(false);
    expect(matchesListFeat(f("Peer", "Religious Organization"), owned("Peer", "Religious Organization"))).toBe(true);
  });
});

describe("classProgress (p. 106)", () => {
  it("counts the mandatory feats and completes with the last one", () => {
    const half = classProgress(swordsman.system, [owned("Quick Draw"), owned("Hardy")]);
    expect(half).toMatchObject({ required: 4, done: 2, complete: false });
    expect(half.entries.filter((e) => e.mandatory && !e.owned).map((e) => e.name)).toEqual(["Fast Reflexes", "Power Attack"]);
    const full = classProgress(swordsman.system, ["Quick Draw", "Hardy", "Fast Reflexes", "Power Attack"].map((n) => owned(n)));
    expect(full).toMatchObject({ required: 4, done: 4, complete: true });
  });

  it("counts a mandatory A-or-B choice once and blocks the other alternative", () => {
    const nighthawk = { feats: [f("Sneak Attack"), f("Far Shot", "", true, "or1"), f("Furious Assault", "", true, "or1")] };
    const progress = classProgress(nighthawk, [owned("Sneak Attack"), owned("Far Shot")]);
    expect(progress).toMatchObject({ required: 2, done: 2, complete: true });
    expect(progress.entries.find((e) => e.name === "Furious Assault")).toMatchObject({ owned: false, blocked: true });
    expect(classProgress(nighthawk, [owned("Sneak Attack")])).toMatchObject({ required: 2, done: 1, complete: false });
  });

  it("does not count optional choices", () => {
    const fighter = { feats: [f("Fearless"), f("Sound Constitution", "", false, "or1"), f("Cleave", "", false, "or1")] };
    expect(classProgress(fighter, [owned("Fearless")])).toMatchObject({ required: 1, done: 1, complete: true });
  });

  it("treats a class with no mandatory feat as complete (Peasant)", () => {
    expect(classProgress({ feats: [f("Luck", "", false)] }, [])).toMatchObject({ required: 0, complete: true });
  });
});

describe("checkClassEntry (FR-004)", () => {
  const base = { level: 1, classes: [], skills: skills({ weaponry: 2, athletics: 1 }), feats: [] };

  it("accepts a class the character qualifies for", () => {
    expect(checkClassEntry({ ...base, cls: swordsman })).toEqual({ errors: [], warnings: [] });
  });

  it("refuses a class more than one Level above", () => {
    expect(checkClassEntry({ ...base, cls: cls("Rager", { level: 3 }) }).errors).toContainEqual({ type: "levelTooHigh", level: 3, max: 2 });
  });

  it("lists missing skills and feats", () => {
    const result = checkClassEntry({ ...base, skills: skills({ weaponry: 1, athletics: 1 }), cls: swordsman });
    expect(result.errors).toContainEqual({ type: "missingSkills", missing: [{ keys: ["weaponry"], value: 2 }] });
    const fighter = cls("Fighter", { level: 1, prereqFeats: ["Swift Attack", "Peer (Law Enforcement)"] });
    expect(checkClassEntry({ ...base, cls: fighter, feats: [owned("Peer", "Law Enforcement")] }).errors)
      .toContainEqual({ type: "missingFeats", missing: ["Swift Attack"] });
  });

  it("accepts either skill of an A-or-B prerequisite", () => {
    const sellSteel = cls("Sell-Steel", { skills: [{ keys: ["weaponry", "ballistics"], value: 2 }] });
    expect(checkClassEntry({ ...base, skills: skills({ ballistics: 2 }), cls: sellSteel }).errors).toEqual([]);
  });

  it("requires the current class to be completed and refuses a class already taken", () => {
    const current = cls("Swordsman", { status: "current" });
    expect(checkClassEntry({ ...base, classes: [current], cls: cls("Myrmidon", { level: 2 }) }).errors).toContainEqual({ type: "currentIncomplete", name: "Swordsman" });
    const done = cls("Swordsman", { status: "completed" });
    expect(checkClassEntry({ ...base, classes: [done], cls: swordsman }).errors).toContainEqual({ type: "alreadyTaken" });
  });

  it("warns about school and free-text prerequisites", () => {
    const sorcerer = cls("Sorcerer", { schools: [{ name: "any Magic School", value: 3 }], text: "see book" });
    expect(checkClassEntry({ ...base, cls: sorcerer }).warnings).toEqual([
      { type: "schools", schools: ["any Magic School 3"] },
      { type: "text", text: "see book" }
    ]);
  });
});

describe("characterLevel (p. 106)", () => {
  it("is the highest class Level, or the stored Level without classes", () => {
    expect(characterLevel([1, 2, 4].map((level) => cls("x", { level })), 1)).toBe(4);
    expect(characterLevel([], 3)).toBe(3);
  });
});

describe("buildCompletionEffects and completionSkillOptions (FR-009)", () => {
  const changes = (completion, selection = { skill: "", specialty: "" }) =>
    buildCompletionEffects({ automation: "none", value: 0, skillGroup: "any", ...completion, selection }).flatMap((e) => e.changes);

  it("adds the numeric bonuses to the character modifiers", () => {
    expect(changes({ automation: "hpMax", value: 2 })).toEqual([{ key: "system.modifiers.hpMax", mode: 2, value: "2" }]);
    expect(changes({ automation: "initiative", value: 1 })).toEqual([{ key: "system.modifiers.initiative", mode: 2, value: "1" }]);
    expect(changes({ automation: "resolveMax", value: 1 })).toEqual([{ key: "system.modifiers.resolveMax", mode: 2, value: "1" }]);
    expect(changes({ automation: "staticDefense", value: 1 })).toEqual([{ key: "system.modifiers.staticDefense", mode: 2, value: "1" }]);
  });

  it("adds a specialty or a skill dot from the choice", () => {
    expect(changes({ automation: "specialty" }, { skill: "charm", specialty: "Nobles" }))
      .toEqual([{ key: "system.skills.charm.specialties", mode: 2, value: "Nobles" }]);
    expect(changes({ automation: "skillDot" }, { skill: "performer", specialty: "" }))
      .toEqual([{ key: "system.skills.performer.value", mode: 2, value: "1" }]);
    expect(changes({ automation: "none" })).toEqual([]);
  });

  it("offers the right skills for the choice", () => {
    expect(completionSkillOptions({ automation: "specialty", skillGroup: "any" }, skills(), 1)).toHaveLength(27);
    const social = completionSkillOptions({ automation: "specialty", skillGroup: "social" }, skills(), 1);
    expect(social).toContain("charm");
    expect(social).not.toContain("pilot");
    const bard = completionSkillOptions({ automation: "skillDot" }, skills({ performer: 2, charm: 1 }), 2);
    expect(bard).toContain("charm");
    expect(bard).not.toContain("performer");
  });
});
