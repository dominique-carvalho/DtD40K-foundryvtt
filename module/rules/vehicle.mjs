/**
 * Vehicles: build costs, slots and budget, Static Defense and movement, Momentum, Control Tests and the Out of
 * Control table, ramming, Evasive Maneuvers, vehicle critical damage, Jury Rig, repairs and chases
 * (spec 013, research R3).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 358–380; specs/013-vehicles/contracts/rules-api.md.
 */
import { VEHICLE_BUDGETS, VEHICLE_COSTS } from "../config.mjs";

const clampMomentum = (n, max = 10) => Math.max(0, Math.min(max, n));
const row = (from, to, key, effect, mechanics = {}) => ({ range: [from, to], key, effect, mechanics });

/** Out of Control (d10, p. 359); effects in our own words. */
export const OUT_OF_CONTROL = [
  row(1, 4, "straightEdge", "Nothing happens; the vehicle carries on."),
  row(5, 7, "swerve", "Veers off in a random direction and cannot turn any further this turn.", { randomTurn: true }),
  row(8, 9, "wildStallion", "Veers randomly, then runs straight ahead up to its current top speed.", { randomTurn: true, straight: true }),
  row(10, 10, "turnOver", "Rolls or capsizes: loses HP equal to its Momentum, ends on its back, Momentum 0.", { momentum: 0, hpLoss: "momentum", flipped: true })
];

/** Vehicle critical damage (d10, p. 363), rolled every 5 wounds in a scene. */
export const VEHICLE_CRIT = [
  row(1, 1, "paint", "Only the paint job suffers."),
  row(2, 3, "stall", "The engine stalls: the vehicle only gets a Half Action.", { stalled: true }),
  row(4, 5, "system", "A weapon, feature or utility system goes offline until a Jury Rig or a full repair (never a control system).", { disable: true }),
  row(6, 7, "halt", "Dead stop: Momentum 0 and no movement for one round.", { momentum: 0, immobileRounds: 1 }),
  row(8, 8, "lockup", "Every system locks up: no actions for one round.", { lockedRounds: 1 }),
  row(9, 9, "pilot", "The pilot is hurt by a surge or a shot through the cockpit: 1k1 wounds.", { pilotWounds: "1k1" }),
  row(10, 10, "explosion", "Core, fuel or ammunition is hit: after one round it explodes (10k5+30 X, Blast 10), killing everyone inside, unless a Jury Rig stops it.", { explodeRounds: 1, damage: { rolled: 10, kept: 5, flat: 30, type: "X" }, blast: 10 })
];

const lookup = (table, d10) => table.find((r) => d10 >= r.range[0] && d10 <= r.range[1]) ?? table.at(-1);

/**
 * VP of the base stats (p. 364).
 * @param {{maneuver: number, acceleration: number, speed: number, size: number}} stats
 */
export function baseCost({ maneuver, acceleration, speed, size }) {
  const at = (table, n) => table[Math.max(0, Math.min(table.length - 1, n))] ?? 0;
  return at(VEHICLE_COSTS.maneuver, maneuver) + at(VEHICLE_COSTS.acceleration, acceleration) + at(VEHICLE_COSTS.speed, speed)
    + at(VEHICLE_COSTS.size, size);
}

/**
 * VP of one component line × its quantity, after Macronized (half the cost, rounding up, per application) and
 * Miniaturized (double the cost per application), p. 375. Costs may be negative (Lightweight frames, Flawed).
 * @param {{cost: number|null, quantity?: number, automation?: {macronized?: number, miniaturized?: number}}} c
 */
export function componentCost(c) {
  let cost = c.cost ?? 0;
  for (let i = 0; i < (c.automation?.macronized ?? 0); i++) cost = Math.ceil(cost / 2);
  cost *= 2 ** (c.automation?.miniaturized ?? 0);
  return cost * Math.max(1, c.quantity ?? 1);
}

/**
 * Equipment slots of one component line × its quantity: Macronized doubles them, Miniaturized halves them
 * (rounding up), p. 375. Drivetrain, frame and armor use none; the Cockpit comes with the frame.
 * @param {{slots: number|null, quantity?: number, automation?: object}} c
 */
export function componentSlots(c) {
  let slots = c.slots ?? 0;
  slots *= 2 ** (c.automation?.macronized ?? 0);
  for (let i = 0; i < (c.automation?.miniaturized ?? 0); i++) slots = Math.ceil(slots / 2);
  return slots * Math.max(1, c.quantity ?? 1);
}

/**
 * Total VP: base stats plus every component line.
 * @param {object} stats
 * @param {object[]} components
 */
export function vehicleCost(stats, components) {
  return baseCost(stats) + components.reduce((sum, c) => sum + componentCost(c), 0);
}

/** Equipment slots used by the component lines. */
export function slotsUsed(components) {
  return components.reduce((sum, c) => sum + componentSlots(c), 0);
}

/** VP of a budget tier (p. 364). */
export const budgetVp = (tier) => VEHICLE_BUDGETS[tier] ?? 0;

/**
 * Static Defense (p. 359): 10 − 2 × Size, plus 2 × Speed and 2 × Maneuver while Momentum is above 0.
 * @param {{size: number, speed: number, maneuver: number, momentum: number}} input
 */
export function staticDefense({ size, speed, maneuver, momentum }) {
  return 10 - 2 * size + (momentum > 0 ? 2 * speed + 2 * maneuver : 0);
}

/** Top move in metres: Speed × Drive Rating × Momentum (p. 359). */
export const moveRange = ({ speed, driveRating, momentum }) => speed * driveRating * momentum;

/**
 * Move (p. 360): Momentum up or down by at most 1; the cap is 10 plus any XL Engine rating (p. 373).
 * @param {{momentum: number, delta: number, max?: number}} input
 */
export function moveMomentum({ momentum, delta, max = 10 }) {
  return clampMomentum(momentum + Math.max(-1, Math.min(1, delta)), max);
}

/**
 * Punch It (p. 360): Boost adds 1 + Acceleration; Drift changes Momentum by at most 1.
 * @param {{momentum: number, acceleration: number, mode: "boost"|"drift", delta?: number, max?: number}} input
 */
export function punchIt({ momentum, acceleration, mode, delta = 0, max = 10 }) {
  if (mode === "boost") return clampMomentum(momentum + 1 + acceleration, max);
  return moveMomentum({ momentum, delta, max });
}

/** Control Test TN: 5 × Momentum (p. 359). */
export const controlTn = (momentum) => 5 * momentum;

/** Row of the Out of Control table. */
export const outOfControl = (d10) => lookup(OUT_OF_CONTROL, d10);

/**
 * Ramming Speed (p. 361): XkY+Z with X = half the Size (max 10), Y = Momentum, Z = Speed.
 * @param {{size: number, momentum: number, speed: number}} input
 */
export function ramming({ size, momentum, speed }) {
  return { rolled: Math.min(10, Math.floor(size / 2)), kept: momentum, flat: speed };
}

/** Evasive Maneuvers (p. 361): half the piloting test is added to the Static Defense. */
export const evasiveBonus = (total) => Math.floor(total / 2);

/**
 * Critical rolls for wounds taken in a scene: one per 5 wounds (p. 363).
 * @param {number} before  wounds already taken in the scene
 * @param {number} added
 */
export function critCount(before, added) {
  return Math.floor((before + Math.max(0, added)) / 5) - Math.floor(before / 5);
}

/** Row of the vehicle critical table. */
export const vehicleCrit = (d10) => lookup(VEHICLE_CRIT, d10);

/** Jury Rig (p. 361): one temporary HP plus one per raise. */
export const juryRigHp = (raises) => 1 + Math.max(0, raises);

/** Repair TN of the Chief Engineer (p. 363): Size + HP lost. */
export const repairTn = ({ size, hpLost }) => size + hpLost;

/**
 * Days of a repair cycle (p. 363): Size days, halved on a success and again per raise (at least 1).
 * @param {{size: number, success: boolean, raises: number}} input
 */
export function repairDays({ size, success, raises }) {
  if (!success) return size;
  return Math.max(1, Math.ceil(size / 2 ** (1 + Math.max(0, raises))));
}

/**
 * HP regained at the end of the cycle: 1k1 per dedicated dot of Wealth, Followers or Backing plus the Chief
 * Engineer's Crafts (p. 363), rolled as that many 1k1.
 * @param {{dots: number, crafts: number}} input
 */
export function repairDice({ dots, crafts }) {
  const n = Math.max(0, dots) + Math.max(0, crafts);
  return { rolled: n, kept: n };
}

/**
 * Chase modifiers (p. 362): a well-handled obstacle gives two raises; the same skill as last round costs two checks.
 * @param {{obstacle: boolean, repeated: boolean}} input
 */
export function chaseModifiers({ obstacle, repeated }) {
  return { freeRaises: obstacle ? 2 : 0, checks: repeated ? 2 : 0 };
}

/**
 * The racer who pulls ahead this round: the single highest total; a tie moves nobody.
 * @param {number[]} totals
 * @returns {number} index, or −1
 */
export function chaseLeader(totals) {
  if (!totals.length) return -1;
  const best = Math.max(...totals);
  return totals.filter((t) => t === best).length === 1 ? totals.indexOf(best) : -1;
}
