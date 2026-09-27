/**
 * Magic: Focus Power pools, casting strength, Psychic Phenomena, keywords, combos and spells learned
 * (spec 009, research R3/R4).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 226–230 (casting strength, keywords, duration, combos), p. 228 (learning spells),
 * pp. 231–232 (tables).
 */
import { MAGIC_SCHOOLS, MAX_PUSH } from "../config.mjs";

/**
 * Focus Power pool (p. 227): (school + characteristic) k characteristic. Fettered halves the rolled dice (rounded
 * up; kept never above rolled); Push adds to the school.
 * @param {{school: number, characteristic: number, strength: "fettered"|"unfettered"|"push", push?: number}} input
 * @returns {{rolled: number, kept: number}}
 */
export function castPool({ school, characteristic, strength, push = 0 }) {
  const c = Math.max(1, characteristic);
  if (strength === "fettered") {
    const rolled = Math.max(1, Math.ceil((school + c) / 2));
    return { rolled, kept: Math.min(c, rolled) };
  }
  const extra = strength === "push" ? Math.max(0, push) : 0;
  return { rolled: school + extra + c, kept: c };
}

/**
 * Most points a caster may Push: 3 with the Tested feat (Sanctioned), 4 without.
 * @param {boolean} tested
 */
export function maxPush(tested) {
  return tested ? MAX_PUSH.sanctioned : MAX_PUSH.unsanctioned;
}

/**
 * Is a Push value allowed?
 * @param {number} push
 * @param {boolean} tested
 */
export function validPush(push, tested) {
  return Number.isInteger(push) && push >= 1 && push <= maxPush(tested);
}

/**
 * Whether Psychic Phenomena are rolled and with which modifier (pp. 226–227, 230): never Fettered; Unfettered only
 * when a kept die exploded (+5 × spell level when Unsanctioned); Push always (+5 or +10 per point); combos +5 per spell.
 * @param {{strength: string, push?: number, tested: boolean, level: number, keptExploded: boolean, comboSize?: number}} input
 * @returns {{roll: boolean, mod: number}}
 */
export function phenomenaModifier({ strength, push = 0, tested, level, keptExploded, comboSize = 0 }) {
  const combo = comboSize > 1 ? 5 * comboSize : 0;
  if (strength === "fettered") return { roll: false, mod: 0 };
  if (strength === "push") return { roll: true, mod: (tested ? 5 : 10) * Math.max(0, push) + combo };
  if (!keptExploded) return { roll: false, mod: 0 };
  return { roll: true, mod: (tested ? 0 : 5 * level) + combo };
}

/**
 * TN of a spell: its printed number; "none" has no minimum; "mentalDefense" uses the target's Mental Defense.
 * @param {{tn: {value: number|null, special: string}}} spell
 * @param {{targetMd?: number|null, modifier?: number}} [options]
 * @returns {number|null}
 */
export function spellTn(spell, { targetMd = null, modifier = 0 } = {}) {
  const { value, special } = spell.tn;
  if (special === "none") return null;
  const base = special === "mentalDefense" ? targetMd : value;
  return base === null || base === undefined ? null : Math.max(0, base + modifier);
}

/**
 * Damage of a spell, scaling with the caster level.
 * @param {{damage: {rolled: number, kept: number, type: string, perLevelRolled?: number, perLevelKept?: number}}} spell
 * @param {{casterLevel: number}} options
 * @returns {{rolled: number, kept: number, type: string}|null}
 */
export function spellDamage(spell, { casterLevel }) {
  const d = spell.damage;
  if (!d || (!d.kept && !d.perLevelKept && !d.rolled && !d.perLevelRolled)) return null;
  return {
    rolled: d.rolled + (d.perLevelRolled ?? 0) * casterLevel,
    kept: d.kept + (d.perLevelKept ?? 0) * casterLevel,
    type: d.type
  };
}

/**
 * Value of a spell effect change: base + per raise, capped at a multiple of the caster level.
 * @param {{value: number, perRaise?: number, capLevelMultiplier?: number}} change
 * @param {{raises: number, casterLevel: number}} options
 */
export function perRaiseChange(change, { raises, casterLevel }) {
  const value = change.value + (change.perRaise ?? 0) * Math.max(0, raises);
  return change.capLevelMultiplier ? Math.min(value, change.capLevelMultiplier * casterLevel) : value;
}

/**
 * Keyword checks before casting (pp. 228–229): Somatic needs free hands (not grappled or restrained); Social not in
 * combat; Verbal, Focus and Material are reminders.
 * @param {{keywords: string[]}} spell
 * @param {{statuses: Set<string>|string[], inCombat: boolean}} context
 * @returns {{blocked: string[], warnings: string[]}}
 */
export function keywordCheck(spell, { statuses, inCombat }) {
  const has = (id) => (statuses instanceof Set ? statuses.has(id) : statuses.includes(id));
  const kw = new Set(spell.keywords);
  const blocked = [];
  if (kw.has("somatic") && (has("grappled") || has("restrained"))) blocked.push("somatic");
  if (kw.has("social") && inCombat) blocked.push("social");
  const warnings = ["verbal", "focus", "material"].filter((k) => kw.has(k));
  return { blocked, warnings };
}

/**
 * Spell Combo test (pp. 229–230): the lowest school and characteristic among the spells; TN = highest TN + 5 per
 * extra spell; never Fettered.
 * @param {{school: string, tn: {value: number|null}}[]} spells
 * @param {Record<string, number>} schools        school ratings
 * @param {Record<string, number>} characteristics characteristic values
 * @returns {{school: string, characteristic: string, rating: number, charValue: number, tn: number|null, fetteredAllowed: false}}
 */
export function comboTest(spells, schools, characteristics) {
  let best = null;
  for (const spell of spells) {
    const characteristic = MAGIC_SCHOOLS[spell.school].characteristic;
    const rating = schools[spell.school] ?? 0;
    const charValue = characteristics[characteristic] ?? 0;
    if (!best || rating + charValue < best.rating + best.charValue) best = { school: spell.school, characteristic, rating, charValue };
  }
  const tns = spells.map((s) => s.tn.value).filter((v) => Number.isFinite(v));
  const tn = tns.length ? Math.max(...tns) + 5 * (spells.length - 1) : null;
  return { ...best, tn, fetteredAllowed: false };
}

/**
 * Spell slots per school (p. 228): one spell per school rating, plus extras (Spell Book).
 * @param {{schools: Record<string, number>, spells: {school: string}[], extra?: Record<string, number>}} input
 * @returns {Record<string, {used: number, max: number}>}
 */
export function spellSlots({ schools, spells, extra = {} }) {
  const slots = Object.fromEntries(Object.keys(MAGIC_SCHOOLS).map((key) => [key, { used: 0, max: (schools[key] ?? 0) + (extra[key] ?? 0) }]));
  for (const spell of spells) if (slots[spell.school]) slots[spell.school].used += 1;
  return slots;
}

/**
 * Can a spell be learned? A free slot in its school and a level up to the school rating; not already known.
 * @param {{spell: {name: string, school: string, level: number}, schools: Record<string, number>,
 *   spells: {name: string, school: string}[], extra?: Record<string, number>}} input
 * @returns {{ok: boolean, reason: ""|"alreadyKnown"|"levelTooHigh"|"noSlot"}}
 */
export function canLearn({ spell, schools, spells, extra = {} }) {
  if (spells.some((s) => s.name === spell.name)) return { ok: false, reason: "alreadyKnown" };
  if (spell.level > (schools[spell.school] ?? 0)) return { ok: false, reason: "levelTooHigh" };
  const slot = spellSlots({ schools, spells, extra })[spell.school];
  if (slot.used >= slot.max) return { ok: false, reason: "noSlot" };
  return { ok: true, reason: "" };
}

/**
 * Row of a d100 table for a total; totals above the last range read the last row (spec assumption).
 * @param {{range: number[]}[]} results  sorted by range
 * @param {number} total
 */
export function tableRow(results, total) {
  const found = results.find((r) => r.range[0] <= total && total <= r.range[1]);
  if (found) return found;
  return total > results.at(-1).range[1] ? results.at(-1) : results[0];
}
