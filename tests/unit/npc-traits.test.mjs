import { describe, expect, it } from "vitest";
import {
  abilityActive, abilityOutcome, applyForm, inArea, darknessModifier, distance3d, flyingFall, incorporealBlocks, minionActionCost, minionCanAttack,
  npcSpeeds, outOfRange
} from "../../module/rules/npc-traits.mjs";
import { situationModifiers } from "../../module/rules/defense.mjs";
import { npcFeatNames } from "../../module/rules/feat.mjs";

const t = (key, value = "") => ({ key, value });

describe("npcSpeeds (pp. 520–522, research R1)", () => {
  it("keeps a printed speed and multiplies a calculated one", () => {
    expect(npcSpeeds({ speed: 16, fixed: true, traits: [t("quadruped")] }).walk).toBe(16);
    expect(npcSpeeds({ speed: 8, fixed: false, traits: [t("quadruped")] }).walk).toBe(16);
    expect(npcSpeeds({ speed: 8, fixed: false, traits: [t("crawler")] }).walk).toBe(4);
  });

  it("flies at the Flyer value, or twice the speed without one", () => {
    expect(npcSpeeds({ speed: 9, fixed: true, traits: [t("flyer", "22")] }).fly).toBe(22);
    expect(npcSpeeds({ speed: 6, fixed: true, traits: [t("flyer")] }).fly).toBe(12);
    expect(npcSpeeds({ speed: 6, fixed: true, traits: [] }).fly).toBe(0);
  });

  it("swims at twice the speed when Amphibious", () => {
    expect(npcSpeeds({ speed: 6, fixed: true, traits: [t("amphibious")] }).swim).toBe(12);
    expect(npcSpeeds({ speed: 6, fixed: true, traits: [] }).swim).toBe(0);
  });
});

describe("darkness and distance (p. 433, research R4)", () => {
  it("adds 5 to the target's defense in darkness unless the attacker has Dark Sight", () => {
    expect(darknessModifier({ darkness: true, attackerDarkSight: false })).toBe(5);
    expect(darknessModifier({ darkness: true, attackerDarkSight: true })).toBe(0);
    expect(darknessModifier({ darkness: false, attackerDarkSight: false })).toBe(0);
    expect(situationModifiers({ melee: true, darkness: true }).tn).toBe(5);
    expect(situationModifiers({ melee: true, darkness: true, attackerDarkSight: true }).tn).toBe(0);
  });

  it("measures with elevation", () => {
    expect(distance3d({ planar: 3, elevation: 4 })).toBe(5);
    expect(distance3d({ planar: 10, elevation: 0 })).toBe(10);
  });

  it("flags out-of-range attacks", () => {
    expect(outOfRange({ distance: 3, melee: true, reach: 2 })).toBe("reach");
    expect(outOfRange({ distance: 2, melee: true, reach: 2 })).toBe("");
    expect(outOfRange({ distance: 130, melee: false, range: 30 })).toBe("beyond");
    expect(outOfRange({ distance: 120, melee: false, range: 30 })).toBe("long");
    expect(outOfRange({ distance: 70, melee: false, range: 30 })).toBe("long");
    expect(outOfRange({ distance: 20, melee: false, range: 30 })).toBe("");
  });
});

describe("incorporeal (Phasing, research R6)", () => {
  it("blocks mundane weapons only", () => {
    expect(incorporealBlocks({ incorporeal: true, magic: false, qualities: [] })).toBe(true);
    expect(incorporealBlocks({ incorporeal: true, magic: false, qualities: ["powerField"] })).toBe(false);
    expect(incorporealBlocks({ incorporeal: true, magic: true, qualities: [] })).toBe(false);
    expect(incorporealBlocks({ incorporeal: true, spell: true })).toBe(false);
    expect(incorporealBlocks({ incorporeal: false, magic: false, qualities: [] })).toBe(false);
  });
});

describe("minion squad actions (research R9)", () => {
  it("costs and distances", () => {
    expect(minionActionCost({ action: "moveHalf", threatRating: 3 })).toEqual({ type: "half", distance: 3 });
    expect(minionActionCost({ action: "moveFull", threatRating: 3 })).toEqual({ type: "full", distance: 6 });
    expect(minionActionCost({ action: "run", threatRating: 3 })).toEqual({ type: "full", distance: 18 });
    expect(minionActionCost({ action: "attack", threatRating: 3 })).toEqual({ type: "half", distance: 0 });
  });

  it("attacks once per turn", () => {
    expect(minionCanAttack({ attacksThisTurn: 0 })).toBe(true);
    expect(minionCanAttack({ attacksThisTurn: 1 })).toBe(false);
  });
});

describe("abilities, forms and flight (research R5, R8, R11)", () => {
  it("applies the failure effect only on a failed save", () => {
    const onFail = { condition: "stunned", rounds: 1, fatigue: 0, damage: null };
    expect(abilityOutcome({ save: { success: false }, onFail })).toEqual({ condition: "stunned", rounds: 1, fatigue: 0, damage: null });
    expect(abilityOutcome({ save: { success: true }, onFail })).toBeNull();
  });

  it("overlays a form on the base values", () => {
    const base = { characteristics: { str: 4, con: 4, dex: 3 }, size: 4, derived: { staticDefense: 16, hpMax: 12, speed: 7, resilience: 6 }, armor: [], traits: [t("resourceStat", "Rage 10")] };
    const form = { characteristics: { str: 7, con: 7 }, size: 5, derived: { staticDefense: null, hpMax: 18, speed: 9, resilience: null }, armor: [{ name: "Hide", ap: 2, locations: ["all"] }], traits: [t("regeneration", "1")] };
    const out = applyForm({ base, form });
    expect(out.characteristics).toEqual({ str: 7, con: 7, dex: 3 });
    expect(out.size).toBe(5);
    expect(out.derived).toEqual({ staticDefense: 16, hpMax: 18, speed: 9, resilience: 6 });
    expect(out.armor).toHaveLength(1);
    expect(out.traits.map((x) => x.key)).toEqual(["resourceStat", "regeneration"]);
    expect(applyForm({ base, form: null })).toEqual(base);
  });

  it("offers a fall to a flying token that is stunned, unconscious or prone", () => {
    expect(flyingFall({ elevation: 10, status: "stunned" })).toBe(true);
    expect(flyingFall({ elevation: 10, status: "unconscious" })).toBe(true);
    expect(flyingFall({ elevation: 0, status: "stunned" })).toBe(false);
    expect(flyingFall({ elevation: 10, status: "bloodLoss" })).toBe(false);
  });
});

describe("ability areas and forms (research R8, R11)", () => {
  const origin = { x: 0, y: 0 };
  it("finds points in a cone, a blast and a line", () => {
    expect(inArea({ shape: "cone", origin, direction: 0, distance: 10, point: { x: 8, y: 2 } })).toBe(true);
    expect(inArea({ shape: "cone", origin, direction: 0, distance: 10, point: { x: 2, y: 8 } })).toBe(false);
    expect(inArea({ shape: "blast", origin, distance: 5, point: { x: 3, y: 4 } })).toBe(true);
    expect(inArea({ shape: "blast", origin, distance: 5, point: { x: 4, y: 4 } })).toBe(false);
    expect(inArea({ shape: "line", origin, direction: 0, distance: 10, width: 2, point: { x: 9, y: 0.9 } })).toBe(true);
    expect(inArea({ shape: "line", origin, direction: 0, distance: 10, width: 2, point: { x: 9, y: 1.5 } })).toBe(false);
    expect(inArea({ shape: "line", origin, direction: 0, distance: 10, width: 2, point: { x: -1, y: 0 } })).toBe(false);
  });

  it("keeps form abilities for the active form only", () => {
    const npc = { activeForm: "fire", forms: [{ id: "fire", abilities: ["Fire"] }, { id: "air", abilities: ["Air"] }] };
    expect(abilityActive(npc, { name: "Fire" })).toBe(true);
    expect(abilityActive(npc, { name: "Air" })).toBe(false);
    expect(abilityActive(npc, { name: "Mind Blast" })).toBe(true);
  });
});

describe("npcFeatNames (research R10)", () => {
  it("normalizes counts and keeps both the full and the base name", () => {
    expect(npcFeatNames(["Sound Constitution ×2", "Weapon Proficiency (Gauss)", "Swift Attack"]))
      .toEqual(["Sound Constitution", "Weapon Proficiency (Gauss)", "Weapon Proficiency", "Swift Attack"]);
  });
});
