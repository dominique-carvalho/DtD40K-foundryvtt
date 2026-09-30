/**
 * Applying damage to a target (spec 008, research R1).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 431–432 (attack steps four and five), p. 433 (cover), p. 436 (damage and Aura), p. 437
 * (Critical Damage), p. 321 (Tearing), p. 432 (unarmed Fatigue).
 */

/** Hit location (d10) → armor location of the 007 profile. */
const ARMOR_OF = {
  leftArm: "arms", rightArm: "arms", arms: "arms", leftLeg: "legs", rightLeg: "legs", legs: "legs",
  body: "body", gizzards: "gizzards", head: "head"
};

/**
 * Resolve damage against a target.
 * Cover first (its AP less the Pen), then the armor with the Pen left (spells: Aura instead of AP); the rest is
 * divided by Resilience (at least 1), rounding down, or up with Tearing. Wounds beyond the remaining HP become
 * Critical Damage; the critical row is the accumulated total, at most 5.
 * @param {object} input
 * @param {number} input.total           damage roll total
 * @param {number} [input.pen]
 * @param {string} input.location        hit location (leftArm, body, …)
 * @param {boolean} [input.magic]        spell damage: Aura instead of AP
 * @param {boolean} [input.tearing]
 * @param {boolean} [input.unarmed]      a wound also inflicts 1 Fatigue
 * @param {Record<string, number>} input.armor  AP by armor location (head, body, gizzards, arms, legs)
 * @param {number} [input.aura]
 * @param {number} input.resilience
 * @param {number} input.hp              current HP
 * @param {number} [input.critical]      accumulated Critical Damage
 * @param {{ap: number, locations: string[]}|null} [input.cover]
 * @param {boolean} [input.ignoreArmor]         Special Attacks (spec 010): no armor soak
 * @param {number} [input.armorMultiplier]      the armor counts this many times (Hollow Point)
 * @param {number} [input.resilienceMod]        added to the Resilience, at least 1 (Felling Giants Blow)
 * @param {number} [input.resilienceMultiplier] Resilience × this, rounding up (Castigating Blow, Demonic Weapon)
 * @param {boolean} [input.noCritical]          wounds beyond the HP are lost, not Critical Damage
 * @param {boolean} [input.direct]              the total is the wounds: no cover, armor, Aura or Resilience (falls, spec 018)
 * @param {number} [input.extraCritical]        Critical Damage added whatever the HP (fatal fall, spec 018)
 * @returns {{effective: number, wounds: number, hpLoss: number, criticalGain: number, critical: number,
 *   row: number, fatigue: number, coverHit: boolean, steps: {label: string, value: number}[]}}
 */
export function resolveDamage({
  total, pen = 0, location, magic = false, tearing = false, unarmed = false, armor, aura = 0, resilience, hp,
  critical = 0, cover = null, ignoreArmor = false, armorMultiplier = 1, resilienceMod = 0, resilienceMultiplier = 1,
  noCritical = false, direct = false, extraCritical = 0
}) {
  const steps = [{ label: "total", value: total }];
  if (direct) {
    const wounds = Math.max(0, total);
    const hpLoss = Math.min(wounds, Math.max(0, hp));
    const criticalGain = (noCritical ? 0 : wounds - hpLoss) + extraCritical;
    const newCritical = critical + criticalGain;
    return {
      effective: wounds, wounds, hpLoss, criticalGain, critical: newCritical, row: criticalGain > 0 ? Math.min(5, newCritical) : 0,
      fatigue: 0, coverHit: false, steps: [...steps, { label: "resilience", value: 1 }]
    };
  }
  const armorLocation = ARMOR_OF[location] ?? "body";
  let remaining = total;
  let penLeft = Math.max(0, pen);
  let coverHit = false;

  const covered = cover && cover.ap > 0 && (cover.locations ?? []).includes(armorLocation);
  if (covered && !magic) {
    const coverAp = Math.max(0, cover.ap - penLeft);
    penLeft = Math.max(0, penLeft - cover.ap);
    remaining -= coverAp;
    steps.push({ label: "cover", value: -coverAp });
    coverHit = remaining > 0;
  }

  const ap = ignoreArmor ? 0 : (armor?.[armorLocation] ?? 0) * armorMultiplier;
  const soak = magic ? Math.max(0, aura) : Math.max(0, ap - penLeft);
  remaining -= soak;
  steps.push({ label: magic ? "aura" : "armor", value: -soak });

  const effective = Math.max(0, remaining);
  const res = Math.max(1, Math.ceil((resilience + resilienceMod) * resilienceMultiplier));
  const wounds = effective > 0 ? (tearing ? Math.ceil(effective / res) : Math.floor(effective / res)) : 0;
  steps.push({ label: "resilience", value: res });

  const hpLoss = Math.min(wounds, Math.max(0, hp));
  const criticalGain = noCritical ? 0 : wounds - hpLoss;
  const newCritical = critical + criticalGain;
  return {
    effective,
    wounds,
    hpLoss,
    criticalGain,
    critical: newCritical,
    row: criticalGain > 0 ? Math.min(5, newCritical) : 0,
    fatigue: unarmed && hpLoss > 0 ? 1 : 0,
    coverHit,
    steps
  };
}
