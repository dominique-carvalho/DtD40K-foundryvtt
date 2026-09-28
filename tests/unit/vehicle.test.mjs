import { describe, expect, it } from "vitest";
import {
  OUT_OF_CONTROL, VEHICLE_CRIT, baseCost, componentCost, componentSlots, budgetVp, chaseLeader, chaseModifiers, controlTn, critCount, evasiveBonus,
  juryRigHp, moveMomentum, moveRange, outOfControl, punchIt, ramming, repairDays, repairDice, repairTn, slotsUsed,
  staticDefense, vehicleCost, vehicleCrit
} from "../../module/rules/vehicle.mjs";

const car = { maneuver: 0, acceleration: 1, speed: 4, size: 8 };
const comp = (category, cost, slots, quantity = 1) => ({ category, cost, slots, quantity });
const carParts = [comp("drivetrain", 5, null), comp("frame", 15, null), comp("armor", 6, 0), comp("accommodation", 0, 1, 4), comp("accommodation", 0, 1, 4), comp("control", null, null)];

describe("costs, slots and budget (p. 364)", () => {
  it("prices the base stats and the components", () => {
    expect(baseCost(car)).toBe(24);
    expect(vehicleCost(car, carParts)).toBe(50);
    expect(vehicleCost(car, [...carParts, comp("modification", -10, null, 2)])).toBe(30);
    expect(slotsUsed(carParts)).toBe(8);
    expect(budgetVp("uncommon")).toBe(50);
    expect(budgetVp("holdings5")).toBe(450);
  });
});

describe("Static Defense and movement (p. 359)", () => {
  it("adds Speed and Maneuver only while moving", () => {
    expect(staticDefense({ size: 8, speed: 4, maneuver: 0, momentum: 0 })).toBe(-6);
    expect(staticDefense({ size: 8, speed: 4, maneuver: 0, momentum: 1 })).toBe(2);
    expect(staticDefense({ size: 14, speed: 4, maneuver: 2, momentum: 3 })).toBe(-6);
  });

  it("moves Speed × Drive Rating × Momentum", () => {
    expect(moveRange({ speed: 4, driveRating: 5, momentum: 10 })).toBe(200);
    expect(moveRange({ speed: 4, driveRating: 5, momentum: 0 })).toBe(0);
  });

  it("changes Momentum within 0–10", () => {
    expect(moveMomentum({ momentum: 2, delta: 1 })).toBe(3);
    expect(moveMomentum({ momentum: 10, delta: 1 })).toBe(10);
    expect(moveMomentum({ momentum: 0, delta: -1 })).toBe(0);
    expect(moveMomentum({ momentum: 5, delta: 3 })).toBe(6);
    expect(moveMomentum({ momentum: 10, delta: 1, max: 12 })).toBe(11);
    expect(punchIt({ momentum: 9, acceleration: 5, mode: "boost", max: 15 })).toBe(15);
    expect(punchIt({ momentum: 2, acceleration: 2, mode: "boost" })).toBe(5);
    expect(punchIt({ momentum: 9, acceleration: 3, mode: "boost" })).toBe(10);
    expect(punchIt({ momentum: 5, acceleration: 2, mode: "drift", delta: -1 })).toBe(4);
  });
});

describe("Control Tests, Out of Control and ramming (pp. 359–361)", () => {
  it("uses TN 5 × Momentum and the d10 table", () => {
    expect(controlTn(3)).toBe(15);
    expect(outOfControl(4).key).toBe("straightEdge");
    expect(outOfControl(7).key).toBe("swerve");
    expect(outOfControl(9).key).toBe("wildStallion");
    expect(outOfControl(10)).toMatchObject({ key: "turnOver", mechanics: { momentum: 0, hpLoss: "momentum", flipped: true } });
    expect(OUT_OF_CONTROL).toHaveLength(4);
  });

  it("rams for half Size (max 10) k Momentum + Speed", () => {
    expect(ramming({ size: 14, momentum: 3, speed: 4 })).toEqual({ rolled: 7, kept: 3, flat: 4 });
    expect(ramming({ size: 30, momentum: 2, speed: 1 })).toEqual({ rolled: 10, kept: 2, flat: 1 });
  });

  it("adds half the Evasive Maneuvers test to the Static Defense", () => {
    expect(evasiveBonus(17)).toBe(8);
  });
});

describe("vehicle critical damage (p. 363)", () => {
  it("rolls once per 5 wounds taken in the scene", () => {
    expect(critCount(3, 2)).toBe(1);
    expect(critCount(4, 7)).toBe(2);
    expect(critCount(0, 4)).toBe(0);
    expect(critCount(5, 4)).toBe(0);
  });

  it("reads the d10 table", () => {
    expect(VEHICLE_CRIT).toHaveLength(7);
    expect(vehicleCrit(1).key).toBe("paint");
    expect(vehicleCrit(3)).toMatchObject({ key: "stall", mechanics: { stalled: true } });
    expect(vehicleCrit(7)).toMatchObject({ key: "halt", mechanics: { momentum: 0 } });
    expect(vehicleCrit(9)).toMatchObject({ key: "pilot", mechanics: { pilotWounds: "1k1" } });
    expect(vehicleCrit(10).key).toBe("explosion");
  });
});

describe("Jury Rig and repairs (pp. 361, 363)", () => {
  it("gives one temporary HP plus one per raise", () => {
    expect(juryRigHp(0)).toBe(1);
    expect(juryRigHp(2)).toBe(3);
  });

  it("takes Size days, halved on a success and per raise", () => {
    expect(repairTn({ size: 8, hpLost: 6 })).toBe(14);
    expect(repairDays({ size: 8, success: true, raises: 2 })).toBe(1);
    expect(repairDays({ size: 8, success: false, raises: 0 })).toBe(8);
    expect(repairDays({ size: 30, success: true, raises: 1 })).toBe(8);
    expect(repairDice({ dots: 2, crafts: 3 })).toEqual({ rolled: 5, kept: 5 });
  });
});

describe("chases (p. 362)", () => {
  it("gives two raises for a well-handled obstacle and two checks for a repeated skill", () => {
    expect(chaseModifiers({ obstacle: true, repeated: false })).toEqual({ freeRaises: 2, checks: 0 });
    expect(chaseModifiers({ obstacle: false, repeated: true })).toEqual({ freeRaises: 0, checks: 2 });
    expect(chaseModifiers({ obstacle: true, repeated: true })).toEqual({ freeRaises: 2, checks: 2 });
  });

  it("finds the single highest result (a tie moves nobody)", () => {
    expect(chaseLeader([18, 25, 12])).toBe(1);
    expect(chaseLeader([20, 20])).toBe(-1);
    expect(chaseLeader([])).toBe(-1);
  });
});

describe("Macronized and Miniaturized components (p. 375)", () => {
  it("halves the cost and doubles the slots per Macronized, the reverse per Miniaturized", () => {
    const sensors = { cost: 15, slots: 2, quantity: 1, automation: { macronized: 1 } };
    expect(componentCost(sensors)).toBe(8);
    expect(componentSlots(sensors)).toBe(4);
    const xl = { cost: 10, slots: 2, quantity: 1, automation: { miniaturized: 1 } };
    expect(componentCost(xl)).toBe(20);
    expect(componentSlots(xl)).toBe(1);
    expect(componentCost({ cost: 10, slots: 3, automation: { macronized: 2 } })).toBe(3);
    expect(componentSlots({ cost: 10, slots: 3, automation: { macronized: 2 } })).toBe(12);
    expect(componentCost({ cost: 5, slots: 1, quantity: 3 })).toBe(15);
    expect(slotsUsed([xl, sensors])).toBe(5);
    expect(vehicleCost({ maneuver: 0, acceleration: 0, speed: 1, size: 1 }, [xl, sensors])).toBe(6 + 28);
  });
});
