/**
 * Derived character values.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: docs/analise-dtd.md §3; DtD 1.6 p. 14 and character sheet summary p. 17.
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
 * @returns {DerivedValues}
 */
export function computeDerived({ characteristics, size, level }, derivedMods = {}) {
  const c = (key) => characteristics[key]?.value ?? 0;

  const base = {
    staticDefense: 10 + 3 * c("dex") + 3 * c("wis") - 2 * size,
    // Decision (spec clarification): 2×(Con + Wil), book pp. 14/17.
    hpMax: 2 * (c("con") + c("wil")),
    mentalDefense: 5 + 5 * c("cmp"),
    resolveMax: c("wil") + c("cmp"),
    speed: c("str") + c("dex"),
    resilience: Math.ceil((size + level) / 2) + 1
  };

  const result = Object.fromEntries(
    Object.entries(base).map(([key, value]) => [key, applyMod(value, derivedMods[key])])
  );
  result.resilience = Math.max(1, result.resilience);
  return /** @type {DerivedValues} */ (result);
}
