/**
 * Wound states, rest and Fatigue (spec 008, research R8).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a p. 437 (healing and wound states), p. 443 (Fatigue).
 */

/**
 * Wound state (p. 437): Lightly Wounded while HP lost ≤ Willpower, Heavily Wounded above, Critically Wounded
 * with any Critical Damage.
 * @param {{hpLost: number, wil: number, critical: number}} input
 * @returns {"none"|"light"|"heavy"|"critical"}
 */
export function woundState({ hpLost, wil, critical }) {
  if (critical > 0) return "critical";
  if (hpLost <= 0) return "none";
  return hpLost <= wil ? "light" : "heavy";
}

/**
 * Natural healing (p. 437): Lightly Wounded 1 HP a day (Con HP with a full day of bed rest); Heavily Wounded
 * 1 HP a week (Con HP with a full week of rest); Critically Wounded only with rest and medical attention,
 * 1 Critical Damage a week.
 * @param {{state: string, period: "day"|"week", count?: number, full?: boolean, medical?: boolean, con: number}} input
 * @returns {{hp: number, critical: number}}  HP and Critical Damage removed
 */
export function rest({ state, period, count = 1, full = false, medical = false, con }) {
  const n = Math.max(0, count);
  if (state === "critical") return { hp: 0, critical: period === "week" && full && medical ? n : 0 };
  if (state === "light") {
    const perDay = full ? con : 1;
    return { hp: (period === "week" ? 7 : 1) * perDay * n, critical: 0 };
  }
  if (state === "heavy") return { hp: period === "week" ? (full ? con : 1) * n : 0, critical: 0 };
  return { hp: 0, critical: 0 };
}

/**
 * Fatigue above Constitution knocks the character out for 10 − Con hours and resets Fatigue to Con (p. 443).
 * @param {{fatigue: number, con: number}} input
 * @returns {{unconscious: boolean, fatigue: number, hours: number}}
 */
export function fatigueCheck({ fatigue, con, max = con }) {
  // The maximum is Constitution, raised by Sand (p. 207, spec 018); knocked out for 10 − Constitution hours.
  if (fatigue <= max) return { unconscious: false, fatigue, hours: 0 };
  return { unconscious: true, fatigue: max, hours: Math.max(0, 10 - con) };
}
