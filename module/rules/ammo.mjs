/**
 * Ammunition (spec 019): which weapons count rounds, the Reload values of the packs, rounds spent by each attack mode and
 * the steps of a reload.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 318, 424, 426–430; specs/019-ammunition/contracts/rules-api.md.
 */

/**
 * Whether a weapon counts rounds (research R1): ranged, with a clip, not thrown, and not a launcher (launchers spend the
 * grenade or missile carried).
 * @param {{weaponType: string, thrown: boolean, clip: number, ammoGroup?: string}|null} weapon
 * @returns {boolean}
 */
export function tracksAmmo(weapon) {
  if (!weapon) return false;
  return weapon.weaponType !== "melee" && !weapon.thrown && (weapon.clip ?? 0) > 0 && !weapon.ammoGroup;
}

/**
 * Reload value of a weapon (p. 318): "Half", "Full", "N Full" (also written "NFull"), "Free"; "-" or empty for none.
 * @param {string} text
 * @returns {{type: "free"|"half"|"full"|"none", actions: number}}
 */
export function parseReload(text) {
  const value = String(text ?? "").trim().toLowerCase();
  if (value === "free") return { type: "free", actions: 1 };
  if (value === "half") return { type: "half", actions: 1 };
  const full = value.match(/^(\d*)\s*full$/);
  if (full) return { type: "full", actions: Number(full[1] || 1) };
  return { type: "none", actions: 0 };
}

/**
 * Rounds an attack asks for (pp. 318, 426): one single shot, the full-auto ROF for a burst.
 * @param {{mode: "single"|"auto", rof: number}} input
 */
export const roundsFor = ({ mode, rof }) => (mode === "auto" ? rof : 1);

/**
 * Rounds spent by an attack (research R2): a burst with fewer rounds than the ROF fires those left, and they become the
 * ROF; an empty clip refuses.
 * @param {{current: number, mode: "single"|"auto", rof: number}} input
 * @returns {{allowed: boolean, spent: number, left: number, effectiveRof: number}}
 */
export function spendRounds({ current, mode, rof }) {
  if (current <= 0) return { allowed: false, spent: 0, left: 0, effectiveRof: 0 };
  const spent = Math.min(current, roundsFor({ mode, rof }));
  return { allowed: true, spent, left: current - spent, effectiveRof: mode === "auto" ? spent : rof };
}

/**
 * One Reload action (research R4): a spare clip is needed; the clip fills on the last of the weapon's actions.
 * @param {{progress: number, actions: number, spare: number}} input
 * @returns {{allowed: boolean, reason: ""|"noSpare"|"noReload", progress: number, done: boolean}}
 */
export function reloadStep({ progress, actions, spare }) {
  if (actions <= 0) return { allowed: false, reason: "noReload", progress, done: false };
  if (spare <= 0) return { allowed: false, reason: "noSpare", progress, done: false };
  const next = progress + 1;
  return next >= actions ? { allowed: true, reason: "", progress: 0, done: true } : { allowed: true, reason: "", progress: next, done: false };
}
