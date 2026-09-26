import { describe, expect, it } from "vitest";
import {
  activeGrants, buildFeatEffects, characteristicOptions, fullName, grantPlan, lowestCharacteristics, needsFeatSelection,
  releasePlan, validateFeatAdd, validateFeatSelection
} from "../../module/rules/feat.mjs";

/** Minimal feat system data (FeatData subset). */
const system = ({ category = "feat", race = "", repeatable = false, group = false, options = [], requires = [], automation = "none", grants = [] } = {}) => ({
  category,
  prerequisites: { exaltation: "", race, deity: "" },
  repeatable,
  featGroup: { enabled: group, options },
  requires,
  automation,
  grants,
  selection: { subcategory: "", characteristic: "", characteristic2: "", skill: "", specialty: "" }
});

const feat = (name, opts = {}, flags = {}) => ({ name, system: system(opts), flags: { dtd40k: flags } });
const sel = (values = {}) => ({ subcategory: "", characteristic: "", characteristic2: "", skill: "", specialty: "", ...values });

/** Every characteristic defaults to 2. */
const chars = (values = {}) => {
  const keys = ["str", "dex", "con", "cha", "fel", "cmp", "int", "wis", "wil"];
  return Object.fromEntries(keys.map((k) => [k, { value: values[k] ?? 2 }]));
};

const halfling = { name: "Halfling", system: { power: { name: "Shifty" } } };
const elf = { name: "Elf", system: { power: { name: "Elven Accuracy" } } };

const peer = feat("Peer", { group: true, repeatable: true, options: ["Nobility", "Underworld"] });
const soundConstitution = feat("Sound Constitution", { automation: "soundConstitution" });
const hindrance = (name) => feat(name, { category: "hindrance" });

describe("fullName (p. 174)", () => {
  it("appends the sub-category of a feat group", () => {
    expect(fullName({ name: "Peer", system: { selection: sel({ subcategory: "Nobility" }) } })).toBe("Peer (Nobility)");
    expect(fullName({ name: "Sound Constitution", system: { selection: sel() } })).toBe("Sound Constitution");
  });

  it("does not repeat a sub-category already in the item name", () => {
    expect(fullName({ name: "Peer (Nobility)", system: { selection: sel({ subcategory: "Nobility" }) } })).toBe("Peer (Nobility)");
  });
});

describe("needsFeatSelection and validateFeatSelection", () => {
  it("asks what each automation needs", () => {
    expect(needsFeatSelection(peer.system)).toMatchObject({ subcategory: true, characteristic: false });
    expect(needsFeatSelection(system({ automation: "veteran" }))).toMatchObject({ characteristic: true, skill: true });
    expect(needsFeatSelection(system({ automation: "beneficialMutation" }))).toMatchObject({ characteristic: true, characteristic2: true });
    expect(needsFeatSelection(system({ automation: "skillFocus", group: true }))).toMatchObject({ subcategory: false, skill: true, specialty: true });
    expect(needsFeatSelection(soundConstitution.system)).toEqual({
      subcategory: false, characteristic: false, characteristic2: false, skill: false, specialty: false
    });
  });

  it("requires a sub-category for feat groups", () => {
    expect(validateFeatSelection(peer.system, sel(), { characteristics: chars() })).toEqual({ valid: false, error: "noSubcategory" });
    expect(validateFeatSelection(peer.system, sel({ subcategory: "Clan Jade Falcon" }), { characteristics: chars() })).toEqual({ valid: true });
  });

  it("checks characteristics, skills and specialties", () => {
    const ctx = { characteristics: chars({ str: 1, con: 1 }) };
    const mettle = system({ automation: "madeOfMettle" });
    expect(validateFeatSelection(mettle, sel({ characteristic: "dex" }), ctx)).toEqual({ valid: false, error: "characteristic" });
    expect(validateFeatSelection(mettle, sel({ characteristic: "con" }), ctx)).toEqual({ valid: true });
    const mutation = system({ automation: "beneficialMutation" });
    expect(validateFeatSelection(mutation, sel({ characteristic: "str", characteristic2: "str" }), ctx))
      .toEqual({ valid: false, error: "characteristic2" });
    const veteran = system({ automation: "veteran" });
    expect(validateFeatSelection(veteran, sel({ characteristic: "wis", skill: "flying" }), ctx)).toEqual({ valid: false, error: "skill" });
    const focus = system({ automation: "skillFocus" });
    expect(validateFeatSelection(focus, sel({ skill: "pilot", specialty: " " }), ctx)).toEqual({ valid: false, error: "specialty" });
    expect(validateFeatSelection(focus, sel({ skill: "pilot", specialty: "Starships" }), ctx)).toEqual({ valid: true });
  });
});

describe("validateFeatAdd (FR-008, research R3)", () => {
  const add = (item, selection, owned = [], race = halfling) => validateFeatAdd({ feat: item, selection, owned, race });

  it("refuses a second copy of a non-repeatable feat", () => {
    expect(add(soundConstitution, sel(), [soundConstitution]).errors).toEqual(["notRepeatable"]);
  });

  it("refuses the same sub-category twice but accepts another one", () => {
    const owned = [{ ...peer, name: "Peer (Nobility)", system: { ...peer.system, selection: sel({ subcategory: "Nobility" }) } }];
    expect(add(peer, sel({ subcategory: "Nobility" }), owned).errors).toEqual(["duplicate"]);
    expect(add(peer, sel({ subcategory: "Underworld" }), owned).errors).toEqual([]);
  });

  it("checks the race of racial feats", () => {
    const boss = feat("I'm Da Boss!", { category: "racialFeat", race: "Ork" });
    expect(add(boss, sel()).errors).toEqual(["wrongRace"]);
    expect(add(boss, sel(), [], null).errors).toEqual(["noRace"]);
    expect(add(feat("Halfling Agility", { category: "racialFeat", race: "Halfling" }), sel()).errors).toEqual([]);
  });

  it("limits hindrances to two (p. 179)", () => {
    expect(add(hindrance("Loco"), sel(), [hindrance("Wanted"), hindrance("Kid")]).errors).toEqual(["hindranceLimit"]);
    expect(add(hindrance("Loco"), sel(), [hindrance("Wanted")]).errors).toEqual([]);
  });

  it("warns about missing dependencies without refusing", () => {
    const battleRage = feat("Battle Rage", { requires: [{ type: "feat", name: "Frenzy" }] });
    expect(add(battleRage, sel())).toMatchObject({ errors: [], warnings: [{ type: "missingDependency", names: ["Frenzy"] }] });
    expect(add(battleRage, sel(), [feat("Frenzy")]).warnings).toEqual([]);
    const precision = feat("Elven Precision", { category: "racialFeat", race: "Elf", requires: [{ type: "racePower", name: "Elven Accuracy" }] });
    expect(add(precision, sel(), [], elf).warnings).toEqual([]);
  });

  it("adds the creation-only notice to assets and hindrances", () => {
    expect(add(feat("Brave", { category: "asset" }), sel()).notices).toEqual([{ type: "creationOnly" }]);
    expect(add(feat("Sturdy", { category: "asset", automation: "sturdy" }), sel()).notices)
      .toEqual([{ type: "creationOnly" }, { type: "extraHindrances", count: 2 }]);
    expect(add(feat("Veteran o' the Wheel", { category: "asset", automation: "veteran" }), sel()).notices)
      .toEqual([{ type: "creationOnly" }, { type: "extraHindrances", count: 1 }]);
    expect(add(soundConstitution, sel()).notices).toEqual([]);
  });

  it("counts a granted copy as present", () => {
    const granted = feat("Jaded", {}, { grantedBy: ["race1"] });
    expect(add(feat("Jaded"), sel(), [granted]).errors).toEqual(["notRepeatable"]);
  });
});

describe("lowestCharacteristics and characteristicOptions", () => {
  it("returns every characteristic tied at the lowest value", () => {
    expect(lowestCharacteristics(chars({ str: 1, con: 1 }))).toEqual(["str", "con"]);
    expect(lowestCharacteristics(chars({ wis: 1 }))).toEqual(["wis"]);
  });

  it("limits Made of Mettle and Beneficial Mutation to the lowest, Veteran to any", () => {
    expect(characteristicOptions(system({ automation: "madeOfMettle" }), chars({ str: 1 }))).toEqual(["str"]);
    expect(characteristicOptions(system({ automation: "veteran" }), chars({ str: 1 }))).toHaveLength(9);
  });
});

describe("buildFeatEffects (research R4)", () => {
  const changes = (automation, selection = sel()) => buildFeatEffects(system({ automation }), selection).flatMap((e) => e.changes);

  it("builds the simple always-on modifiers", () => {
    expect(changes("soundConstitution")).toEqual([{ key: "system.modifiers.hpMax", mode: 2, value: "1" }]);
    expect(changes("discipline")).toEqual([{ key: "system.modifiers.resolveMax", mode: 2, value: "1" }]);
    expect(changes("paranoia")).toEqual([{ key: "system.modifiers.initiative", mode: 2, value: "2" }]);
    expect(changes("farsighted")).toEqual([
      { key: "system.modifiers.resolveMax", mode: 2, value: "3" },
      { key: "system.modifiers.mentalDefense", mode: 2, value: "5" }
    ]);
    expect(changes("halflingAgility")).toEqual([{ key: "system.modifiers.staticDefense", mode: 2, value: "4" }]);
    expect(changes("noOneTougher")).toEqual([{ key: "system.modifiers.staticDefenseCharacteristic", mode: 5, value: "con" }]);
    expect(changes("sturdy")).toEqual([{ key: "system.modifiers.resilience", mode: 2, value: "1" }]);
    expect(changes("sand")).toEqual([{ key: "system.modifiers.fatigueMax", mode: 2, value: "2" }]);
    expect(changes("nineLives")).toEqual([{ key: "system.heroPoints.max", mode: 2, value: "1" }]);
  });

  it("builds Matron with the Size change after the racial override", () => {
    expect(changes("matron")).toEqual([
      { key: "system.characteristics.str.value", mode: 2, value: "1" },
      { key: "system.characteristics.dex.value", mode: 2, value: "-1" },
      { key: "system.characteristics.fel.value", mode: 2, value: "-1" },
      { key: "system.size", mode: 2, value: "2", priority: 60 }
    ]);
  });

  it("uses the choices of Made of Mettle, Beneficial Mutation and Veteran", () => {
    expect(changes("madeOfMettle", sel({ characteristic: "con" }))).toEqual([{ key: "system.characteristics.con.value", mode: 2, value: "1" }]);
    expect(changes("beneficialMutation", sel({ characteristic: "con", characteristic2: "dex" }))).toEqual([
      { key: "system.characteristics.con.value", mode: 2, value: "2" },
      { key: "system.characteristics.dex.value", mode: 2, value: "-1" }
    ]);
    expect(changes("veteran", sel({ characteristic: "wis", skill: "stealth" }))).toEqual([
      { key: "system.characteristics.wis.value", mode: 2, value: "1" },
      { key: "system.skills.stealth.value", mode: 2, value: "1" }
    ]);
  });

  it("adds specialties through effects", () => {
    expect(changes("skillFocus", sel({ skill: "pilot", specialty: "Starships" })))
      .toEqual([{ key: "system.skills.pilot.specialties", mode: 2, value: "Starships" }]);
    expect(changes("noisyCricket")).toEqual([{ key: "system.skills.acrobatics.specialties", mode: 2, value: "Jumping" }]);
  });

  it("delegates Exalted Asset automations and ignores text-only feats", () => {
    expect(changes("actionHero")).toEqual([{ key: "system.heroPoints.max", mode: 2, value: "1" }]);
    expect(buildFeatEffects(system(), sel())).toEqual([]);
  });

  it("tags each effect with its automation", () => {
    expect(buildFeatEffects(system({ automation: "sand" }), sel())[0].feat).toBe("sand");
  });
});

describe("grants (research R7)", () => {
  const owned = (name, grantedBy = [], purchased = false, id = name) => ({ id, name, flags: { dtd40k: { grantedBy, purchased } } });

  it("creates what is missing and attaches what the character already has", () => {
    const grants = [{ name: "Jaded", subcategory: "", choose: false }, { name: "Fearless", subcategory: "", choose: false }];
    expect(grantPlan(grants, [owned("Jaded", [], true, "j1")], "race1")).toEqual({
      create: [{ name: "Fearless", subcategory: "", choose: false }],
      attach: ["j1"]
    });
  });

  it("matches sub-categories by full name", () => {
    const grants = [{ name: "Peer", subcategory: "Ventrue", choose: false }];
    expect(grantPlan(grants, [owned("Peer (Ventrue)", [], true, "p1")], "a1")).toEqual({ create: [], attach: ["p1"] });
    expect(grantPlan(grants, [owned("Peer (Nobility)", [], true, "p2")], "a1").create).toHaveLength(1);
  });

  it("never attaches the same origin twice", () => {
    const grants = [{ name: "Jaded", subcategory: "", choose: false }];
    expect(grantPlan(grants, [owned("Jaded", ["race1"], false, "j1")], "race1")).toEqual({ create: [], attach: [] });
  });

  it("releases an origin, removing only orphan granted feats", () => {
    const items = [
      owned("Armor Proficiency (Light)", ["race1", "ex1"], false, "a"),
      owned("Jaded", ["race1"], true, "b"),
      owned("Fearless", ["race1"], false, "c"),
      owned("Brave", [], true, "d")
    ];
    expect(releasePlan(items, "race1")).toEqual({
      update: [{ id: "a", grantedBy: ["ex1"] }, { id: "b", grantedBy: [] }],
      remove: ["c"]
    });
  });

  it("grants exaltation feats from the Power Stat rank", () => {
    const grants = [{ name: "Armor Proficiency", subcategory: "Light", choose: false, rank: 1 }, { name: "X", subcategory: "", choose: false, rank: 3 }];
    expect(activeGrants({ grants }, 1).map((g) => g.name)).toEqual(["Armor Proficiency"]);
    expect(activeGrants({ grants }, 3)).toHaveLength(2);
  });
});
