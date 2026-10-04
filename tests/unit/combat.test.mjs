import { describe, expect, it } from "vitest";
import { ACTION_SUBTYPES, ACTION_TYPES, STATUS_EFFECTS } from "../../module/config.mjs";
import { canUse, emptyTurn, resetForRound, spend, usesDelay } from "../../module/rules/turn.mjs";
import {
  combatFlags, defendedSd, dodgeModifiers, multipleAttackPenalty, parryPool, reactionsMax, situationModifiers, stillHits
} from "../../module/rules/defense.mjs";
import { fatigueCheck, rest, woundState } from "../../module/rules/healing.mjs";
import { refuteBonus, resolveRecovery, socialOutcome } from "../../module/rules/social.mjs";
import { fearTn, insanityThresholds, shockRoll, traumaTn } from "../../module/rules/mental.mjs";
import { COMBAT_ACTIONS, compareInitiative, initiativeDie } from "../../module/rules/combat-actions.mjs";

const act = (key) => COMBAT_ACTIONS.find((a) => a.key === key);

describe("turn (pp. 421, 424)", () => {
  it("allows one Full Action or two different Half Actions", () => {
    let state = emptyTurn(1);
    expect(canUse(state, act("standardAttack"), { reactionsMax: 1 }).ok).toBe(true);
    state = spend(state, act("standardAttack"));
    expect(canUse(state, act("standardAttack"), { reactionsMax: 1 })).toEqual({ ok: false, reason: "halfRepeated" });
    expect(canUse(state, act("allOutAttack"), { reactionsMax: 1 })).toEqual({ ok: false, reason: "noHalfLeft" });
    state = spend(state, act("shift"));
    expect(canUse(state, act("ready"), { reactionsMax: 1 })).toEqual({ ok: false, reason: "noHalfLeft" });
    const full = spend(emptyTurn(1), act("allOutAttack"));
    expect(canUse(full, act("shift"), { reactionsMax: 1 })).toEqual({ ok: false, reason: "fullUsed" });
  });

  it("allows each Free Action once and reactions up to the maximum", () => {
    let state = spend(emptyTurn(1), act("dropProne"));
    expect(canUse(state, act("dropProne"), { reactionsMax: 1 })).toEqual({ ok: false, reason: "freeRepeated" });
    state = spend(state, act("dodge"));
    expect(canUse(state, act("parry"), { reactionsMax: 1 })).toEqual({ ok: false, reason: "noReaction" });
    expect(canUse(state, act("parry"), { reactionsMax: 3 }).ok).toBe(true);
  });

  it("treats Varies as a Half Action unless chosen and resets on a new round", () => {
    const state = spend(emptyTurn(1), act("aim"), { as: "full" });
    expect(state.full).toBe(true);
    expect(spend(emptyTurn(1), act("reload")).halves).toEqual(["reload"]);
    expect(resetForRound(state, 2)).toEqual(emptyTurn(2));
    expect(resetForRound(state, 1).full).toBe(true);
  });
});

describe("defense (pp. 425–436)", () => {
  it("adds half the Dodge or Parry total to Static Defense", () => {
    expect(defendedSd(14, 18)).toBe(23);
    expect(stillHits({ attackTotal: 22, sd: 23 })).toBe(false);
    expect(stillHits({ attackTotal: 28, sd: 23 })).toBe(true);
    expect(parryPool({ skill: 3, level: 2, proficient: true })).toEqual({ rolled: 5, kept: 3 });
    expect(dodgeModifiers({ prone: true, difficultTerrain: true })).toEqual({ rolled: -3, kept: 0 });
  });

  it("counts reactions from effects", () => {
    expect(reactionsMax([])).toBe(1);
    expect(reactionsMax(["fullDefense"], 2)).toBe(3);
    expect(reactionsMax(["allOutAttack"], 2)).toBe(0);
    expect(reactionsMax(new Set(["stunned"]))).toBe(0);
  });

  it("reads conditions", () => {
    expect(combatFlags(["stunned"])).toMatchObject({ cannotAct: true, grantsAdvantage: true, noDodge: true });
    expect(combatFlags(["blinded"]).autoFailBallistics).toBe(true);
    expect(combatFlags(["prone"])).toMatchObject({ grantsAdvantage: false, grantsAdvantageMelee: true });
  });

  it("applies situational modifiers", () => {
    expect(situationModifiers({ melee: true, advantage: true, gangUp: 3 })).toMatchObject({ rolled: 3, freeRaises: 1 });
    expect(situationModifiers({ melee: false, targetRan: true, intoMelee: true })).toMatchObject({ rolled: -2, requiredRaises: 2 });
    expect(situationModifiers({ melee: false, intoMelee: true, advantage: true }).requiredRaises).toBe(0);
    expect(situationModifiers({ melee: true, targetProne: true }).freeRaises).toBe(1);
    expect(situationModifiers({ melee: false, targetProne: true }).requiredRaises).toBe(1);
    expect(situationModifiers({ melee: true, calledShot: true, allOut: true }).rolled).toBe(0);
    expect(situationModifiers({ melee: true, charge: true, terrain: "difficult" }).rolled).toBe(0);
  });

  it("computes the two-weapon penalty", () => {
    expect(multipleAttackPenalty({ twoWeapons: true })).toBe(3);
    expect(multipleAttackPenalty({ twoWeapons: true, ambidextrous: true })).toBe(2);
    expect(multipleAttackPenalty({ twoWeapons: true, twoWeaponFighting: true })).toBe(1);
    expect(multipleAttackPenalty({ twoWeapons: true, ambidextrous: true, twoWeaponFighting: true })).toBe(0);
    expect(multipleAttackPenalty({ twoWeapons: false })).toBe(0);
  });
});

describe("healing and Fatigue (pp. 437, 443)", () => {
  it("classifies wounds", () => {
    expect(woundState({ hpLost: 0, wil: 3, critical: 0 })).toBe("none");
    expect(woundState({ hpLost: 3, wil: 3, critical: 0 })).toBe("light");
    expect(woundState({ hpLost: 4, wil: 3, critical: 0 })).toBe("heavy");
    expect(woundState({ hpLost: 4, wil: 3, critical: 1 })).toBe("critical");
  });

  it("heals by rest", () => {
    expect(rest({ state: "light", period: "day", con: 3 })).toEqual({ hp: 1, critical: 0 });
    expect(rest({ state: "light", period: "day", full: true, con: 3 })).toEqual({ hp: 3, critical: 0 });
    expect(rest({ state: "heavy", period: "day", con: 3 })).toEqual({ hp: 0, critical: 0 });
    expect(rest({ state: "heavy", period: "week", full: true, con: 3 })).toEqual({ hp: 3, critical: 0 });
    expect(rest({ state: "critical", period: "week", full: true, medical: true, con: 3 })).toEqual({ hp: 0, critical: 1 });
    expect(rest({ state: "critical", period: "week", full: true, con: 3 })).toEqual({ hp: 0, critical: 0 });
  });

  it("knocks out above Constitution", () => {
    expect(fatigueCheck({ fatigue: 3, con: 3 })).toEqual({ unconscious: false, fatigue: 3, hours: 0 });
    expect(fatigueCheck({ fatigue: 4, con: 3 })).toEqual({ unconscious: true, fatigue: 3, hours: 7 });
  });
});

describe("social, Fear and Insanity (pp. 446–452)", () => {
  it("drains at most 4 Resolve per scene", () => {
    expect(socialOutcome({ drained: 3, resolve: 2 })).toEqual({ canSpend: true, jaded: false });
    expect(socialOutcome({ drained: 4, resolve: 2 })).toEqual({ canSpend: false, jaded: true });
    expect(socialOutcome({ drained: 0, resolve: 0 }).canSpend).toBe(false);
    expect(refuteBonus(16)).toBe(8);
    expect(resolveRecovery({ success: true, raises: 2 })).toBe(3);
    expect(resolveRecovery({ success: false, raises: 0 })).toBe(0);
  });

  it("gives the Fear TN, Shock roll and Trauma TN", () => {
    expect([1, 2, 3, 4, 5].map(fearTn)).toEqual([15, 20, 25, 30, 35]);
    expect(shockRoll({ d10: 7, checks: 2 })).toBe(9);
    expect(traumaTn(10)).toBe(12);
    expect(traumaTn(24)).toBe(14);
  });

  it("finds the Insanity thresholds", () => {
    expect(insanityThresholds(9, 10)).toEqual({ traumaTests: 1, derangements: 0, removed: false });
    expect(insanityThresholds(19, 20)).toEqual({ traumaTests: 1, derangements: 1, removed: false });
    expect(insanityThresholds(95, 100)).toEqual({ traumaTests: 1, derangements: 1, removed: true });
    expect(insanityThresholds(12, 15)).toEqual({ traumaTests: 0, derangements: 0, removed: false });
  });
});

describe("combat actions and initiative (pp. 422–430)", () => {
  it("lists the 43 actions (38 of spec 008, 4 of the grapple in spec 017, Phase of spec 022) with valid keys, types and subtypes", () => {
    expect(COMBAT_ACTIONS).toHaveLength(43);
    expect(new Set(COMBAT_ACTIONS.map((a) => a.key)).size).toBe(43);
    const statuses = STATUS_EFFECTS.map((s) => s.id);
    for (const a of COMBAT_ACTIONS) {
      expect(ACTION_TYPES).toContain(a.type);
      for (const s of a.subtypes) expect(ACTION_SUBTYPES).toContain(s);
      if (a.automation.effect) expect(statuses).toContain(a.automation.effect);
      expect(a.summary.length).toBeGreaterThan(10);
    }
    expect(act("dodge")).toMatchObject({ type: "reaction", automation: { reaction: "dodge" } });
    expect(act("fullDefense").automation.effect).toBe("fullDefense");
  });

  it("orders initiative by result, die, then Dexterity", () => {
    expect(initiativeDie({ initiative: 12, dex: 3, cmp: 2 })).toBe(7);
    const a = { initiative: 12, die: 7, dex: 3 };
    const b = { initiative: 12, die: 5, dex: 5 };
    expect(compareInitiative(a, b)).toBeLessThan(0);
    expect(compareInitiative({ ...b, die: 7 }, a)).toBeLessThan(0);
    expect(compareInitiative(a, { ...a })).toBe(0);
    expect(compareInitiative({ initiative: null, die: 0, dex: 0 }, a)).toBeGreaterThan(0);
  });
});

describe("Delay (spec 017, p. 426)", () => {
  const attack = { key: "standardAttack", type: "half" };
  it("pays a Half Action outside the character's turn", () => {
    expect(usesDelay({ delay: { round: 2 }, ownTurn: false, action: attack })).toBe(true);
    expect(usesDelay({ delay: { round: 2 }, ownTurn: false, action: { key: "reload", type: "varies" } })).toBe(true);
  });

  it("does nothing on his own turn, for Full Actions or without a held action", () => {
    expect(usesDelay({ delay: { round: 2 }, ownTurn: true, action: attack })).toBe(false);
    expect(usesDelay({ delay: { round: 2 }, ownTurn: false, action: { key: "charge", type: "full" } })).toBe(false);
    expect(usesDelay({ delay: null, ownTurn: false, action: attack })).toBe(false);
  });
});
