import { describe, expect, it } from "vitest";
import { CHARACTERISTICS } from "../../module/config.mjs";
import {
  ADD, OVERRIDE, buildRaceEffects, capValue, characteristicOptions, defaultChoice, needsChoice, remainingUses,
  usesPerScene, validateRaceChoice
} from "../../module/rules/race.mjs";

/** Minimal race data, as stored in RaceData. */
const race = ({ options = [], any = false, skills = [], choose = 0, size = 4, automation = "none" } = {}) => ({
  characteristicBonus: { options, any },
  skillBonus: { skills, choose },
  size,
  power: { automation }
});

const ELDARIN = race({ options: ["wis", "int"], skills: ["academicLore", "arcana"], size: 3, automation: "usesPerScene" });
const HUMAN = race({ any: true, choose: 2, size: 4, automation: "heroicHeritage" });
const ORK = race({ options: ["str", "wil"], skills: ["intimidation", "scrutiny"], size: 5 });

const byId = (effects) => Object.fromEntries(effects.map((effect) => [effect.racial, effect]));

describe("characteristicOptions", () => {
  it("returns all 9 characteristics for 'any' (Human)", () => {
    expect(characteristicOptions(HUMAN)).toEqual(Object.keys(CHARACTERISTICS));
  });

  it("returns the listed options otherwise", () => {
    expect(characteristicOptions(ELDARIN)).toEqual(["wis", "int"]);
  });
});

describe("needsChoice", () => {
  it("is true with two characteristic options", () => {
    expect(needsChoice(ELDARIN)).toBe(true);
  });

  it("is true when skills must be chosen (Human)", () => {
    expect(needsChoice(HUMAN)).toBe(true);
  });

  it("is false with a single option and no skills to choose", () => {
    expect(needsChoice(race({ options: ["str"] }))).toBe(false);
  });
});

describe("defaultChoice", () => {
  it("picks the first option and no skills", () => {
    expect(defaultChoice(ELDARIN)).toEqual({ characteristic: "wis", skills: [] });
  });
});

describe("validateRaceChoice (FR-009)", () => {
  it("accepts a valid choice", () => {
    expect(validateRaceChoice(ELDARIN, { characteristic: "int", skills: [] })).toEqual({ valid: true });
    expect(validateRaceChoice(HUMAN, { characteristic: "cha", skills: ["pilot", "command"] })).toEqual({ valid: true });
  });

  it("rejects a characteristic outside the options", () => {
    expect(validateRaceChoice(ORK, { characteristic: "int", skills: [] })).toEqual({ valid: false, error: "characteristic" });
  });

  it("rejects the wrong number of skills", () => {
    expect(validateRaceChoice(HUMAN, { characteristic: "cha", skills: ["pilot"] })).toEqual({ valid: false, error: "skillCount" });
    expect(validateRaceChoice(ELDARIN, { characteristic: "wis", skills: ["pilot"] })).toEqual({ valid: false, error: "skillCount" });
  });

  it("rejects repeated skills or skills already granted", () => {
    expect(validateRaceChoice(HUMAN, { characteristic: "cha", skills: ["pilot", "pilot"] }))
      .toEqual({ valid: false, error: "skillDuplicate" });
    const mixed = race({ options: ["str"], skills: ["pilot"], choose: 1 });
    expect(validateRaceChoice(mixed, { characteristic: "str", skills: ["pilot"] }))
      .toEqual({ valid: false, error: "skillDuplicate" });
  });

  it("rejects unknown skill keys", () => {
    expect(validateRaceChoice(HUMAN, { characteristic: "cha", skills: ["pilot", "juggling"] }))
      .toEqual({ valid: false, error: "skillUnknown" });
  });
});

describe("buildRaceEffects (research R1/R2)", () => {
  it("builds size, characteristic and skill effects for Eldarin + Wisdom", () => {
    const effects = buildRaceEffects(ELDARIN, { characteristic: "wis", skills: [] });
    expect(effects.map((effect) => effect.racial)).toEqual(["size", "characteristic", "skill.academicLore", "skill.arcana"]);
    const e = byId(effects);
    expect(e.size.changes).toEqual([{ key: "system.size", mode: OVERRIDE, value: "3" }]);
    expect(e.characteristic.changes).toEqual([{ key: "system.characteristics.wis.value", mode: ADD, value: "1" }]);
    expect(e["skill.arcana"].changes).toEqual([{ key: "system.skills.arcana.value", mode: ADD, value: "1" }]);
    expect(e.characteristic.label).toEqual({ type: "characteristic", key: "wis" });
    expect(e["skill.arcana"].label).toEqual({ type: "skill", key: "arcana" });
  });

  it("adds the chosen skills for Human", () => {
    const effects = buildRaceEffects(HUMAN, { characteristic: "cha", skills: ["pilot", "command"] });
    const e = byId(effects);
    expect(e.size.changes[0].value).toBe("4");
    expect(e.characteristic.changes[0].key).toBe("system.characteristics.cha.value");
    expect(e).toHaveProperty(["skill.pilot"]);
    expect(e).toHaveProperty(["skill.command"]);
  });

  it("adds no power effect for text-only or per-scene powers", () => {
    expect(byId(buildRaceEffects(ELDARIN, { characteristic: "wis", skills: [] }))).not.toHaveProperty("power");
    expect(byId(buildRaceEffects(ORK, { characteristic: "str", skills: [] }))).not.toHaveProperty("power");
  });

  it("uses mode values matching CONST.ACTIVE_EFFECT_MODES (v13)", () => {
    expect(ADD).toBe(2);
    expect(OVERRIDE).toBe(5);
  });

  it("throws on an invalid choice", () => {
    expect(() => buildRaceEffects(ORK, { characteristic: "int", skills: [] })).toThrow(/characteristic/);
  });
});

describe("capValue (FR-015)", () => {
  it("caps at 6", () => {
    expect(capValue(7)).toEqual({ value: 6, capped: true });
    expect(capValue(5)).toEqual({ value: 5, capped: false });
    expect(capValue(6)).toEqual({ value: 6, capped: false });
  });
});

describe("usesPerScene (FR-003, research R5)", () => {
  it("grants 1/2/3 uses at Level 1/3/5", () => {
    const table = { 0: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 10: 3 };
    for (const [level, uses] of Object.entries(table)) expect(usesPerScene(Number(level))).toBe(uses);
  });

  it("never reports negative remaining uses", () => {
    expect(remainingUses(1, 1)).toBe(0);
    expect(remainingUses(1, 5)).toBe(0);
    expect(remainingUses(5, 1)).toBe(2);
  });
});

describe("buildRaceEffects — automated powers (FR-016)", () => {
  const power = (automation, extra = {}) =>
    byId(buildRaceEffects(race({ options: ["dex"], automation, ...extra }), { characteristic: "dex", skills: [] })).power;

  it("Human Heroic Heritage adds 1 to maximum Hero Points", () => {
    expect(power("heroicHeritage").changes).toEqual([{ key: "system.heroPoints.max", mode: ADD, value: "1" }]);
  });

  it("Halfling Shifty switches the Static Defense formula", () => {
    expect(power("shifty").changes)
      .toEqual([{ key: "system.modifiers.staticDefenseFormula", mode: OVERRIDE, value: "shifty" }]);
  });

  it("Squat Toughness adds 1 to Resilience", () => {
    expect(power("squatToughness").changes).toEqual([{ key: "system.modifiers.resilience", mode: ADD, value: "1" }]);
  });
});
