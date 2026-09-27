/**
 * Alignment Checks, Devotion, Degeneration and changing alignment (spec 011, research R5).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 284–286; specs/011-backgrounds-alignment/contracts/rules-api.md.
 */

/** Highest Devotion the sheet allows (the book gives none). */
export const MAX_DEVOTION = 10;

/**
 * Alignment Check (p. 284): one die (d10) plus bonuses; meeting or beating the Devotion passes.
 * @param {{d10: number, bonus: number, devotion: number}} input
 * @returns {{total: number, pass: boolean}}
 */
export function alignmentCheck({ d10, bonus, devotion }) {
  const total = d10 + bonus;
  return { total, pass: total >= devotion };
}

/**
 * A failed check (pp. 284–285): one Devotion point is lost for good; at 6 or less a second check against the new
 * score decides the Degeneration; at 0 the character leaves play.
 * @param {number} devotion
 * @returns {{devotion: number, second: boolean, outOfPlay: boolean}}
 */
export function afterFailure(devotion) {
  const next = Math.max(0, devotion - 1);
  return { devotion: next, second: next > 0 && next <= 6, outOfPlay: next === 0 };
}

/**
 * Raising Devotion (p. 285): on a pass one point comes back, curing the Degeneration written at the point left.
 * @param {{pass: boolean, devotion: number}} input
 * @returns {{devotion: number, cures: number|null}}
 */
export function recover({ pass, devotion }) {
  if (!pass || devotion >= MAX_DEVOTION) return { devotion, cures: null };
  return { devotion: devotion + 1, cures: devotion };
}

/**
 * Changing alignment, once (p. 286): same pantheon −2 Devotion (at least 1); another pantheon Devotion 4 and a
 * Degeneration written at 7.
 * @param {{fromPantheon: string, toPantheon: string, devotion: number, changes: number}} input
 * @returns {{devotion: number, degenerationAt: number|null, refused: boolean}}
 */
export function changeAlignment({ fromPantheon, toPantheon, devotion, changes }) {
  if (changes >= 1) return { devotion, degenerationAt: null, refused: true };
  if (fromPantheon === toPantheon) return { devotion: Math.max(1, devotion - 2), degenerationAt: null, refused: false };
  return { devotion: 4, degenerationAt: 7, refused: false };
}

/**
 * The Degeneration row of a 1d100 roll; null when the character already has it (roll again, p. 285).
 * @param {{range: number[], flags: object}[]} results
 * @param {number} roll
 * @param {string[]} owned  names of the Degenerations the character has
 */
export function degenerationRow(results, roll, owned) {
  const row = results.find((r) => roll >= r.range[0] && roll <= r.range[1]) ?? null;
  if (!row) return null;
  return owned.includes(row.flags?.dtd40k?.name) ? null : row;
}
