import { describe, expect, it } from "vitest";
import {
  canLearn, castPool, comboTest, keywordCheck, maxPush, perRaiseChange, phenomenaModifier, spellDamage, spellSlots, spellTn,
  tableRow, validPush
} from "../../module/rules/magic.mjs";

const spell = (extra = {}) => ({ name: "Magic Missile", school: "evocation", level: 1, tn: { value: 15, special: "" }, keywords: [], ...extra });

describe("castPool (p. 227)", () => {
  it("rolls school + characteristic and keeps the characteristic", () => {
    expect(castPool({ school: 2, characteristic: 3, strength: "unfettered" })).toEqual({ rolled: 5, kept: 3 });
    expect(castPool({ school: 2, characteristic: 3, strength: "fettered" })).toEqual({ rolled: 3, kept: 3 });
    expect(castPool({ school: 2, characteristic: 3, strength: "push", push: 2 })).toEqual({ rolled: 7, kept: 3 });
    expect(castPool({ school: 0, characteristic: 1, strength: "fettered" })).toEqual({ rolled: 1, kept: 1 });
    expect(castPool({ school: 1, characteristic: 4, strength: "fettered" })).toEqual({ rolled: 3, kept: 3 });
  });

  it("limits Push to 3 with Tested and 4 without", () => {
    expect(maxPush(true)).toBe(3);
    expect(maxPush(false)).toBe(4);
    expect(validPush(4, true)).toBe(false);
    expect(validPush(4, false)).toBe(true);
    expect(validPush(0, false)).toBe(false);
  });
});

describe("phenomenaModifier (pp. 226–230)", () => {
  it("never rolls Fettered, and Unfettered only with a kept exploded die", () => {
    expect(phenomenaModifier({ strength: "fettered", tested: false, level: 3, keptExploded: true })).toEqual({ roll: false, mod: 0 });
    expect(phenomenaModifier({ strength: "unfettered", tested: false, level: 3, keptExploded: false })).toEqual({ roll: false, mod: 0 });
    expect(phenomenaModifier({ strength: "unfettered", tested: false, level: 3, keptExploded: true })).toEqual({ roll: true, mod: 15 });
    expect(phenomenaModifier({ strength: "unfettered", tested: true, level: 3, keptExploded: true })).toEqual({ roll: true, mod: 0 });
  });

  it("always rolls with Push, +5 or +10 per point, and +5 per combo spell", () => {
    expect(phenomenaModifier({ strength: "push", push: 2, tested: true, level: 1, keptExploded: false })).toEqual({ roll: true, mod: 10 });
    expect(phenomenaModifier({ strength: "push", push: 2, tested: false, level: 1, keptExploded: false })).toEqual({ roll: true, mod: 20 });
    expect(phenomenaModifier({ strength: "push", push: 1, tested: true, level: 1, keptExploded: false, comboSize: 2 })).toEqual({ roll: true, mod: 15 });
  });
});

describe("spell TN, damage and raises", () => {
  it("reads the TN", () => {
    expect(spellTn(spell())).toBe(15);
    expect(spellTn(spell({ tn: { value: null, special: "none" } }))).toBeNull();
    expect(spellTn(spell({ tn: { value: null, special: "mentalDefense" } }), { targetMd: 20 })).toBe(20);
    expect(spellTn(spell(), { modifier: -1 })).toBe(14);
  });

  it("scales damage with the caster level", () => {
    expect(spellDamage({ damage: { rolled: 2, kept: 1, type: "E" } }, { casterLevel: 3 })).toEqual({ rolled: 2, kept: 1, type: "E" });
    expect(spellDamage({ damage: { rolled: 3, kept: 2, type: "E", perLevelRolled: 2 } }, { casterLevel: 3 })).toEqual({ rolled: 9, kept: 2, type: "E" });
    expect(spellDamage({ damage: { rolled: 0, kept: 0, type: "" } }, { casterLevel: 3 })).toBeNull();
  });

  it("adds per-raise values up to the Level cap", () => {
    const aura = { value: 1, perRaise: 1, capLevelMultiplier: 3 };
    expect(perRaiseChange(aura, { raises: 2, casterLevel: 2 })).toBe(3);
    expect(perRaiseChange(aura, { raises: 9, casterLevel: 2 })).toBe(6);
  });
});

describe("keywordCheck (pp. 228–229)", () => {
  it("blocks Somatic when grappled and Social in combat, and reminds of Verbal, Focus, Material", () => {
    const s = spell({ keywords: ["somatic", "social", "verbal", "material"] });
    expect(keywordCheck(s, { statuses: ["grappled"], inCombat: true })).toEqual({ blocked: ["somatic", "social"], warnings: ["verbal", "material"] });
    expect(keywordCheck(s, { statuses: new Set(), inCombat: false })).toEqual({ blocked: [], warnings: ["verbal", "material"] });
  });
});

describe("comboTest (pp. 229–230)", () => {
  it("uses the lowest school and characteristic and adds 5 to the highest TN per extra spell", () => {
    const spells = [spell({ school: "evocation", tn: { value: 15 } }), spell({ school: "abjuration", tn: { value: 20 } })];
    const result = comboTest(spells, { evocation: 3, abjuration: 1 }, { cha: 3, wil: 2 });
    expect(result).toEqual({ school: "abjuration", characteristic: "wil", rating: 1, charValue: 2, tn: 25, fetteredAllowed: false });
  });
});

describe("spell slots (p. 228)", () => {
  const known = [spell()];
  it("gives one slot per school rating plus extras", () => {
    expect(spellSlots({ schools: { evocation: 2 }, spells: known }).evocation).toEqual({ used: 1, max: 2 });
    expect(spellSlots({ schools: { evocation: 1 }, spells: known, extra: { evocation: 1 } }).evocation).toEqual({ used: 1, max: 2 });
  });

  it("learns within the slots and the school rating", () => {
    expect(canLearn({ spell: spell({ name: "Other" }), schools: { evocation: 1 }, spells: known })).toEqual({ ok: false, reason: "noSlot" });
    expect(canLearn({ spell: spell({ name: "Other", level: 3 }), schools: { evocation: 2 }, spells: known })).toEqual({ ok: false, reason: "levelTooHigh" });
    expect(canLearn({ spell: spell(), schools: { evocation: 2 }, spells: known })).toEqual({ ok: false, reason: "alreadyKnown" });
    expect(canLearn({ spell: spell({ name: "Other", level: 2 }), schools: { evocation: 2 }, spells: known })).toEqual({ ok: true, reason: "" });
  });
});

describe("tableRow", () => {
  const results = [{ range: [1, 3] }, { range: [4, 74] }, { range: [75, 100] }];
  it("finds the row, the last one above the top", () => {
    expect(tableRow(results, 2)).toBe(results[0]);
    expect(tableRow(results, 75)).toBe(results[2]);
    expect(tableRow(results, 130)).toBe(results[2]);
  });
});
