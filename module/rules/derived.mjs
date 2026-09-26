/**
 * Derived character values.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a p. 17 (same formulas as the 1.6, pp. 14/17); docs/analise-dtd.md §3.
 */

/**
 * @typedef {object} DerivedMod
 * @property {number} bonus            added to the base value
 * @property {number|null} override    replaces the value when not null
 */

/**
 * @typedef {object} DerivedValues
 * @property {number} staticDefense
 * @property {number} hpMax
 * @property {number} mentalDefense
 * @property {number} resolveMax
 * @property {number} speed
 * @property {number} resilience
 * @property {number} fatigueMax
 */

/**
 * Apply bonus and override to a base value.
 * @param {number} base
 * @param {DerivedMod} [mod]
 * @returns {number}
 */
function applyMod(base, mod) {
  const override = mod?.override;
  if (override !== null && override !== undefined && override !== "") return Number(override);
  return base + (Number(mod?.bonus) || 0);
}

/**
 * Compute all derived values of a character.
 * @param {{characteristics: Record<string, {value: number}>, size: number, level: number}} source
 * @param {Record<string, DerivedMod>} [derivedMods]
 * @param {{staticDefenseFormula?: "standard"|"shifty", resilience?: number, hpMax?: number, staticDefenseSize?: boolean,
 *   staticDefense?: number, staticDefenseCharacteristic?: "dex"|"con", resolveMax?: number, mentalDefense?: number,
 *   fatigueMax?: number}} [modifiers]
 *   racial power, exaltation, asset and feat modifiers (spec 002 FR-016, spec 004 FR-025, spec 005 FR-011),
 *   applied before the GM bonus/override
 * @returns {DerivedValues}
 */
export function computeDerived({ characteristics, size, level }, derivedMods = {}, modifiers = {}) {
  const c = (key) => characteristics[key]?.value ?? 0;
  const { staticDefenseFormula = "standard", resilience = 0, hpMax = 0, staticDefenseSize = true } = modifiers;
  const bonus = (key) => Number(modifiers[key]) || 0;
  // No One Tougher (7.7a p. 204): Constitution replaces Dexterity in Static Defense.
  const agility = c(modifiers.staticDefenseCharacteristic === "con" ? "con" : "dex");
  // Elusive (7.7a p. 218): Size no longer lowers Static Defense.
  const sizePenalty = staticDefenseSize ? 2 * size : 0;

  const base = {
    // Halfling "Shifty" (DtD 7.7a p. 45): 10 + 6×Dex − 2×Size instead of Dex + Wis.
    // Halfling Agility (p. 202) adds to it.
    staticDefense: (staticDefenseFormula === "shifty"
      ? 10 + 6 * agility - sizePenalty
      : 10 + 3 * agility + 3 * c("wis") - sizePenalty) + bonus("staticDefense"),
    // Decision (spec clarification): 2×(Con + Wil), book pp. 14/17.
    // Sloth and the Earth Blood Quickening add to maximum HP (spec 004).
    hpMax: 2 * (c("con") + c("wil")) + (Number(hpMax) || 0),
    // Farsighted (p. 204) adds to Mental Defense; Discipline and Farsighted to Resolve.
    mentalDefense: 5 + 5 * c("cmp") + bonus("mentalDefense"),
    resolveMax: c("wil") + c("cmp") + bonus("resolveMax"),
    speed: c("str") + c("dex"),
    // Squat Toughness (7.7a p. 55) adds to Resilience.
    resilience: Math.ceil((size + level) / 2) + 1 + (Number(resilience) || 0),
    // Max Fatigue = Constitution (DtD 7.7a p. 17).
    // Sand (p. 207) raises it.
    fatigueMax: c("con") + bonus("fatigueMax")
  };

  const result = Object.fromEntries(
    Object.entries(base).map(([key, value]) => [key, applyMod(value, derivedMods[key])])
  );
  result.resilience = Math.max(1, result.resilience);
  return /** @type {DerivedValues} */ (result);
}
