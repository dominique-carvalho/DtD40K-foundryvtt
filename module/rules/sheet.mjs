/**
 * Pure helpers for the hybrid character sheet (spec FR-010, FR-025, FR-027).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 */

/**
 * @typedef {object} Dot
 * @property {number} index        1-based position
 * @property {boolean} filled
 * @property {boolean} superhuman  the 6th dot (beyond the human maximum of 5)
 */

/**
 * Build the dot row for a characteristic or skill value.
 * @param {number} value
 * @param {number} [max=6]
 * @returns {Dot[]}
 */
export function buildDots(value, max = 6) {
  return Array.from({ length: max }, (_, i) => ({
    index: i + 1,
    filled: i < value,
    superhuman: i + 1 === 6
  }));
}

/**
 * Value resulting from clicking a dot: the clicked position, or one less when
 * clicking the current value (so a value can be lowered back to 0).
 * @param {number} current
 * @param {number} clicked
 * @returns {number}
 */
export function nextDotValue(current, clicked) {
  return Math.max(0, clicked === current ? current - 1 : clicked);
}

/**
 * Lowercase and strip diacritics for accent-insensitive matching.
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  return String(text ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/**
 * Filter skill entries by name query and/or trained status.
 * @template {{name: string, value: number}} T
 * @param {T[]} entries
 * @param {{query?: string, onlyTrained?: boolean}} [filters]
 * @returns {T[]}
 */
export function filterSkills(entries, { query = "", onlyTrained = false } = {}) {
  const needle = normalize(query).trim();
  return entries.filter((entry) => {
    if (onlyTrained && entry.value < 1) return false;
    return !needle || normalize(entry.name).includes(needle);
  });
}

/**
 * Parse a form value into an integer, or null when blank/invalid.
 * @param {unknown} value
 * @returns {number|null}
 */
function toIntOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/**
 * Normalize derived-value adjustments coming from the sheet form: a blank bonus
 * becomes 0 and a blank override becomes null, so one empty field never makes
 * Foundry reject the whole update.
 * @param {Record<string, {bonus?: unknown, override?: unknown}>} mods
 * @returns {Record<string, {bonus: number, override: number|null}>}
 */
export function sanitizeDerivedMods(mods) {
  return Object.fromEntries(
    Object.entries(mods ?? {}).map(([key, mod]) => [
      key,
      { bonus: toIntOrNull(mod?.bonus) ?? 0, override: toIntOrNull(mod?.override) }
    ])
  );
}
