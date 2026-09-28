import { describe, expect, it } from "vitest";
import {
  RAM_DAMAGE, SHIP_ACTIONS, SHIP_CRIT, WARP_ENCOUNTERS, WARP_PERILOUS, WARP_VOYAGE,
  boardingLoss, boardingRange, bombardScatter, bpSpent, commitCrew, consoleBonuses, critModifier, critRow, crewAvailable,
  customHull, emergencyRepair, fieldRepair, fighterDamage, fighterPool, initiativeBonus, multiphasicHit, multiphasicRegen,
  ramDamage, shieldHit, shieldRegen, shipBudget, shipPool, shipStats, slotUsage, staticDefense, warpCourse,
  warpEncounter, warpEncounterModifier, warpPerilous, warpSteer, warpVoyage, weaponProfile
} from "../../module/rules/ship.mjs";

const hull = (over = {}) => ({
  class: "escort", crew: 12, hullStrength: 40, maneuverability: 0, acceleration: 0, speed: 6, sensors: 0,
  consoles: { arcana: 0, command: 0, engineering: 0, tactical: 0, universal: 2, nonUniversal: 0 },
  weapons: { forward: 1, rear: 1 }, customizationPoints: 0, ...over
});
const LANCE = { pattern: "Lance", kind: "lance", dam: { rolled: 7, kept: 3 }, dis: 4, acc: 5, crit: 2, range: 10, arc: "flexible", cost: 10 };
const ARRAY = { pattern: "Array", kind: "array", dam: { rolled: 3, kept: 2 }, dis: 2, acc: 10, crit: 0, range: 10, arc: "flexible", cost: 10 };
const TURRET = { pattern: "Turret", kind: "array", dam: { rolled: 2, kept: 1 }, dis: 1, acc: 0, crit: -1, range: 5, arc: "omni", cost: 10 };
const HEAVY_LANCE = { pattern: "Heavy Lance", kind: "lance", dam: { rolled: 8, kept: 4 }, dis: 5, acc: 0, crit: 4, range: 20, arc: "fixed", cost: 15 };

describe("budget, defense and initiative (pp. 386–387, 403)", () => {
  it("gives the BP of the Holdings", () => {
    expect([shipBudget(1), shipBudget(5), shipBudget(0), shipBudget(6)]).toEqual([50, 250, 0, 250]);
  });

  it("derives Static Defense and the initiative bonus", () => {
    expect(staticDefense({ maneuverability: 5, acceleration: 10 })).toBe(25);
    expect(staticDefense({ maneuverability: -5, acceleration: -5 })).toBe(0);
    expect(initiativeBonus({ sensors: 10, acceleration: 5 })).toBe(15);
  });
});

describe("custom hulls (pp. 392–393)", () => {
  const destroyer = hull({ class: "destroyer", crew: 16, hullStrength: 55, speed: 8, weapons: { forward: 2, rear: 2 },
    consoles: { arcana: 0, command: 0, engineering: 0, tactical: 0, universal: 2, nonUniversal: 4 }, customizationPoints: 11 });

  it("adds the purchases to the base and counts the CP", () => {
    const r = customHull(destroyer, { hullStrength: 2, forwardWeapon: 1 });
    expect(r.stats.hullStrength).toBe(65);
    expect(r.stats.weapons.forward).toBe(3);
    expect([r.cpSpent, r.cpMax]).toEqual([6, 11]);
    expect(r.warnings).toEqual([]);
  });

  it("warns above the Upgrade Limit, the Total Limit and the CP", () => {
    expect(customHull(hull({ customizationPoints: 10 }), { hullStrength: 7 }).warnings.map((w) => w.kind)).toContain("upgradeLimit");
    const battleship = hull({ class: "battleship", crew: 24, hullStrength: 90, weapons: { forward: 3, rear: 3 }, customizationPoints: 8 });
    expect(customHull(battleship, { forwardWeapon: 2, crew: 1 }).warnings).toEqual(expect.arrayContaining([{ key: "forwardWeapon", kind: "totalLimit" }, { key: "cp", kind: "cp" }]));
  });
});

describe("consoles and final stats (pp. 399–402)", () => {
  it("sums numeric console bonuses by quantity", () => {
    expect(consoleBonuses([{ automation: { hullStrengthBonus: 10, stackable: true }, quantity: 2 }]).hullStrengthBonus).toBe(20);
    expect(consoleBonuses([{ automation: { speedBonus: 2, accelerationBonus: 5 } }])).toMatchObject({ speedBonus: 2, accelerationBonus: 5 });
    expect(consoleBonuses([{ automation: { sensors: 5, sensorsMode: "text" } }]).sensors).toBe(5);
  });

  it("applies consoles and criticals to the hull", () => {
    const essex = hull({ class: "cruiser", crew: 20, hullStrength: 75, maneuverability: -5, sensors: 5 });
    expect(shipStats(essex, consoleBonuses([{ automation: { hullStrengthBonus: 10 }, quantity: 2 }]), []).hullStrength).toBe(95);
    expect(shipStats(essex, {}, ["sensorsDamaged"]).sensors).toBe(-15);
    expect(shipStats(essex, { crewBonus: 2, maneuverabilityBonus: 5 }, []).crew).toBe(22);
  });
});

describe("BP and slots", () => {
  it("adds hull, shield, weapons (by profile), officers and torpedo sets", () => {
    const parts = [
      { category: "hull", cost: 10 }, { category: "shield", cost: 5 },
      { category: "weapon", weapon: { ...LANCE, typeKey: "las" } },
      ...Array.from({ length: 5 }, () => ({ category: "officer", cost: 5 }))
    ];
    expect(bpSpent(parts)).toBe(50);
    expect(bpSpent([{ category: "weapon", weapon: { ...LANCE, typeKey: "plasma" } }])).toBe(15);
    expect(bpSpent([{ category: "torpedo", cost: 10, quantity: 7 }])).toBe(20);
    expect(bpSpent([{ category: "console", cost: 5, quantity: 2 }])).toBe(10);
  });

  it("fills typed console slots, then universal ones, and counts weapon mounts", () => {
    const h = hull({ consoles: { arcana: 0, command: 0, engineering: 0, tactical: 1, universal: 1, nonUniversal: 0 }, weapons: { forward: 2, rear: 1 } });
    const r = slotUsage(h, [{ category: "console", console: { type: "tactical" } }, { category: "console", console: { type: "tactical" } }], {});
    expect(r.consoles.tactical).toEqual({ used: 1, max: 1 });
    expect(r.consoles.universal).toEqual({ used: 1, max: 1 });
    expect(r.warnings).toEqual([]);
    const over = slotUsage(h, Array.from({ length: 3 }, () => ({ category: "console", console: { type: "tactical" } })), {});
    expect(over.warnings).toContain("consoles");
    const guns = slotUsage(h, [{ category: "weapon", weapon: { mount: "forward" } }, { category: "torpedoTube", tube: { mount: "rear" } }, { category: "weapon", weapon: { mount: "rear" } }], {});
    expect(guns.weapons).toEqual({ forward: { used: 1, max: 2 }, rear: { used: 2, max: 1 } });
    expect(guns.warnings).toContain("rearWeapons");
  });

  it("uses the chosen split of a custom hull's non-universal slots", () => {
    const base = hull({ consoles: { arcana: 0, command: 0, engineering: 0, tactical: 0, universal: 2, nonUniversal: 4 } });
    const r = slotUsage(base, [{ category: "console", console: { type: "arcana" } }], { arcana: 2, tactical: 2 });
    expect(r.consoles.arcana).toEqual({ used: 1, max: 2 });
  });
});

describe("weapon profiles (p. 397)", () => {
  it("combines a pattern with a weapon type", () => {
    expect(weaponProfile(LANCE, "plasma")).toMatchObject({ dam: { rolled: 9, kept: 3 }, dis: 4, acc: 0, crit: 2, range: 10, cost: 15 });
    expect(weaponProfile(TURRET, "melta")).toMatchObject({ dam: { rolled: 3, kept: 1 }, dis: 0, acc: 0, crit: -1, range: 2, cost: 5 });
    expect(weaponProfile(ARRAY, "positron")).toMatchObject({ dam: { rolled: 2, kept: 2 }, dis: 4, acc: 5, crit: 1, range: 20, cost: 15 });
    expect(weaponProfile(HEAVY_LANCE, "plasma")).toMatchObject({ dam: { rolled: 10, kept: 4 }, dis: 5, acc: -5, crit: 4, range: 20, cost: 20 });
    expect(weaponProfile(LANCE, "las")).toMatchObject({ dam: { rolled: 7, kept: 3 }, cost: 10 });
  });
});

describe("Crew and dice pools (p. 403)", () => {
  it("rolls committed Crew and keeps the officer's dots", () => {
    expect(shipPool({ crew: 8, kept: 3, stat: 5 })).toEqual({ rolled: 8, kept: 3, flat: 5 });
    expect(shipPool({ crew: 4, kept: 0, stat: 0 })).toEqual({ rolled: 4, kept: 1, flat: 0 });
    expect(shipPool({ crew: 12, kept: 4, stat: 0 }).rolled).toBe(10);
  });

  it("tracks the Crew left this round, temporary Crew first", () => {
    expect(crewAvailable({ max: 16, temp: 0, committed: 8, deployed: 0 })).toBe(8);
    expect(crewAvailable({ max: 16, temp: 2, committed: 10, deployed: 6 })).toBe(2);
    expect(commitCrew({ temp: 2, committed: 0 }, 3)).toEqual({ temp: 0, committed: 1 });
  });
});

describe("shields (pp. 407–408)", () => {
  it("takes damage first, adds Disruption and collapses at 0 losing the excess", () => {
    expect(shieldHit({ value: 75, disruption: 0, collapsed: false, damage: 20, dis: 4 })).toEqual({ value: 55, disruption: 4, collapsed: false, toHull: 0 });
    expect(shieldHit({ value: 10, disruption: 4, collapsed: false, damage: 25, dis: 4 })).toEqual({ value: 0, disruption: 4, collapsed: true, toHull: 0 });
    expect(shieldHit({ value: 0, disruption: 4, collapsed: true, damage: 30, dis: 4 })).toMatchObject({ toHull: 30 });
  });

  it("regenerates less the Disruption, never when collapsed", () => {
    expect(shieldRegen({ value: 55, max: 75, regen: 10, disruption: 4, collapsed: false })).toBe(61);
    expect(shieldRegen({ value: 0, max: 75, regen: 10, disruption: 0, collapsed: true })).toBe(0);
    expect(shieldRegen({ value: 74, max: 75, regen: 10, disruption: 0, collapsed: false })).toBe(75);
  });

  it("layers a Multiphasic shield", () => {
    const layers = Array.from({ length: 4 }, () => ({ value: 20, disruption: 0 }));
    const hit = multiphasicHit(layers, 25, 3);
    expect(hit.layers[0]).toEqual({ value: 0, disruption: 0 });
    expect(hit.layers[1]).toEqual({ value: 20, disruption: 0 });
    expect(hit.toHull).toBe(0);
    const again = multiphasicHit(hit.layers, 5, 3);
    expect(again.layers[1]).toEqual({ value: 15, disruption: 3 });
    expect(multiphasicRegen(again.layers, 20, 5)[1]).toEqual({ value: 17, disruption: 3 });
    const gone = multiphasicHit([{ value: 0, disruption: 0 }], 12, 3);
    expect(gone.toHull).toBe(12);
  });
});

describe("criticals, ramming and boarding (pp. 404–409)", () => {
  it("has the 14 rows of the Crit Chart", () => {
    expect(SHIP_CRIT).toHaveLength(14);
    expect(critRow(-2).key).toBe("armorScuffing");
    expect(critRow(0).key).toBe("armorScuffing");
    expect(critRow(5).key).toBe("ventingPlasma");
    expect(critRow(13).key).toBe("secondaryExplosion");
    expect(critRow(15).key).toBe("secondaryExplosion");
    expect(critRow(11).mechanics).toMatchObject({ critModifier: 2, repairTn: 25 });
  });

  it("sums the crit modifiers", () => {
    expect(critModifier({ crits: ["hullBreached"], bonuses: { critModifier: -3 }, braced: 0 })).toBe(-1);
    expect(critModifier({ crits: [], bonuses: {}, braced: 2 })).toBe(-2);
  });

  it("rams by hull class", () => {
    expect(RAM_DAMAGE.destroyer).toEqual({ rolled: 3, kept: 3 });
    expect(ramDamage("destroyer", { speed: 9 })).toEqual({ rolled: 3, kept: 3, flat: 9, crit: 3, targetCrit: 3, selfDamage: true });
    expect(ramDamage("destroyer", { prow: true })).toEqual({ rolled: 4, kept: 4, flat: 0, crit: 3, targetCrit: 5, selfDamage: false });
  });

  it("resolves boarding losses and range", () => {
    expect([boardingLoss({ committed: 10, checks: 2 }), boardingLoss({ committed: 6, checks: 0 }), boardingLoss({ committed: 10, checks: 9 })]).toEqual([7, 3, 10]);
    expect(boardingRange({})).toBe(1);
    expect(boardingRange({ assaultShuttles: true })).toBe(3);
    expect(boardingRange({ teleportarium: true, targetShielded: false })).toBe(5);
    expect(boardingRange({ teleportarium: true, targetShielded: true })).toBe(1);
  });
});

describe("fighters, Warp, bombardment and repairs (pp. 405–413)", () => {
  it("builds the squadron pools", () => {
    expect(fighterPool({ count: 6, ballistics: 3 })).toEqual({ rolled: 6, kept: 3 });
    expect(fighterDamage(6)).toEqual({ rolled: 3, kept: 3 });
    expect(fighterDamage(1)).toEqual({ rolled: 1, kept: 1 });
  });

  it("gives the voyage table and the step results", () => {
    expect(Object.keys(WARP_VOYAGE)).toHaveLength(5);
    expect(warpVoyage("moderate")).toMatchObject({ tn: 20, warpTime: "1d10 days", realTime: "1d10 weeks" });
    expect(warpCourse({ success: false, raises: 0 })).toBe(-10);
    expect(warpCourse({ success: true, raises: 2 })).toBe(10);
    expect(warpSteer({ outcome: { success: true, raises: 2, checks: 0 }, relay: true })).toEqual({ encounters: 1, timeDivisor: 2, encounterModifier: 0, offCourse: false, timeMultiplier: 1 });
    expect(warpSteer({ outcome: { success: false, raises: 0, checks: 2 }, relay: false })).toEqual({ encounters: 1, timeDivisor: 1, encounterModifier: 2, offCourse: true, timeMultiplier: 2 });
  });

  it("rolls encounters with modifiers", () => {
    expect(warpEncounterModifier({ chaplain: true, warpsbane: true })).toBe(-3);
    expect(warpEncounterModifier({ ancientHelm: true, failed: true })).toBe(4);
    expect(WARP_ENCOUNTERS).toHaveLength(10);
    expect(WARP_PERILOUS).toHaveLength(5);
    expect(warpEncounter(1).key).toBe("allsWell");
    expect(warpEncounter(7).key).toBe("theVanishing");
    expect(warpEncounter(12).key).toBe("perilous");
    expect(warpPerilous(5).key).toBe("webInTheWay");
  });

  it("scatters a bombardment and restores Hull", () => {
    expect(bombardScatter(0)).toEqual({ rolled: 1, kept: 1 });
    expect(bombardScatter(2)).toEqual({ rolled: 3, kept: 1 });
    expect(fieldRepair(0)).toEqual({ rolled: 1, kept: 1 });
    expect(fieldRepair(1)).toEqual({ rolled: 2, kept: 2 });
    expect(emergencyRepair(0)).toBe(1);
    expect(emergencyRepair(2)).toBe(2);
  });
});

describe("ship actions (pp. 404–406)", () => {
  it("lists the 23 actions by department", () => {
    expect(SHIP_ACTIONS).toHaveLength(23);
    const count = (d) => SHIP_ACTIONS.filter((a) => a.department === d).length;
    expect([count("command"), count("manoeuver"), count("tactical"), count("engineering"), count("arcana")]).toEqual([4, 5, 5, 4, 5]);
    const adjust = SHIP_ACTIONS.find((a) => a.key === "adjustHeading");
    expect(adjust).toMatchObject({ skill: "pilot", stat: "maneuverability", tn: 25, crew: true });
    expect(SHIP_ACTIONS.find((a) => a.key === "evasiveManoeuvers").timing).toBe("reaction");
    expect(SHIP_ACTIONS.find((a) => a.key === "braceForImpact").crew).toBe(false);
  });
});
