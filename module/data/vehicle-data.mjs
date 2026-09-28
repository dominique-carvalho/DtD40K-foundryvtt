import { VEHICLE_BUDGETS, VEHICLE_CREW_ROLES } from "../config.mjs";
import { ARMOR_LOCATIONS } from "../rules/equipment.mjs";
import { armStrength, budgetVp, moveRange, slotsUsed, staticDefense, vehicleCost } from "../rules/vehicle.mjs";

const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

const int = (initial, min, max) => new NumberField({ required: true, nullable: false, integer: true, initial, min, max });

/**
 * Data model for the `vehicle` Actor subtype (spec 013, research R2; pp. 358–380). The vehicle exposes the paths the
 * combat of spec 008 reads (armor.locations, derived.resilience, derived.staticDefense, hp); HP and Resilience come
 * from the frame, AP from the armor, Drive Rating and control skill from the active drivetrain.
 * Schema: specs/013-vehicles/data-model.md.
 */
export class VehicleData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      size: int(8, 1, 30),
      speed: int(4, 1, 15),
      acceleration: int(0, 0, 5),
      maneuver: int(0, 0, 10),
      // Up to 10, or more with an XL Engine (p. 373); the derived maxMomentum caps it.
      momentum: int(0, 0, 15),
      budget: new SchemaField({ tier: new StringField({ required: true, choices: Object.keys(VEHICLE_BUDGETS), initial: "uncommon" }) }),
      hp: new SchemaField({ value: int(10, 0), temp: int(0, 0) }),
      activeDrive: new StringField({ required: true, blank: true }),
      crew: new ArrayField(new SchemaField({
        role: new StringField({ required: true, choices: VEHICLE_CREW_ROLES, initial: "passenger" }),
        actorUuid: new StringField({ required: true, blank: false }),
        weaponIds: new ArrayField(new StringField({ required: true, blank: false }))
      })),
      state: new SchemaField({
        flipped: new BooleanField({ initial: false }),
        destroyed: new BooleanField({ initial: false }),
        sceneWounds: int(0, 0),
        juryRigUsed: new BooleanField({ initial: false }),
        stalled: new BooleanField({ initial: false }),
        // Combat round through which the vehicle takes no actions / cannot move (critical 8 and 6–7); 0 = none.
        lockedUntil: int(0, 0),
        immobileUntil: int(0, 0),
        // Ids of components or weapons knocked offline (critical 4–5).
        disabled: new ArrayField(new StringField({ required: true, blank: false })),
        // Round in which a hit core explodes unless Jury Rigged (critical 10); 0 = none.
        explodeRound: int(0, 0),
        // Combat round of the last Move or Punch It (Momentum drops to 0 without one).
        lastMoveRound: int(0, 0)
      }),
      // Values printed for the example vehicles (the book's VP and slots do not always add up).
      printed: new SchemaField({ vp: new StringField({ required: true, blank: true }), slots: new StringField({ required: true, blank: true }) }),
      description: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
      })
    };
  }

  /** @override */
  prepareDerivedData() {
    const items = this.parent?.items ?? [];
    const components = items.filter((i) => i.type === "vehicleComponent").map((i) => ({ id: i.id, name: i.name, ...i.system }));
    const weapons = items.filter((i) => i.type === "weapon").map((i) => {
      const v = i.system.vehicle ?? {};
      return { cost: v.cost ?? 0, slots: v.slots ?? 0, quantity: 1, automation: { macronized: v.macronized ?? 0, miniaturized: v.miniaturized ?? 0 } };
    });
    const sum = (key) => components.reduce((n, c) => n + (Number(c.automation?.[key]) || 0) * Math.max(1, c.quantity ?? 1), 0);
    const frame = components.find((c) => c.category === "frame");
    const armor = components.find((c) => c.category === "armor");
    const drives = components.filter((c) => c.category === "drivetrain");
    const drive = drives.find((d) => d.id === this.activeDrive) ?? drives[0] ?? null;

    this.hp.max = frame?.frame.hp ?? 0;
    const ap = armor?.armor.ap ?? 0;
    this.armor = { locations: Object.fromEntries(ARMOR_LOCATIONS.map((loc) => [loc, ap])), ap };
    // Living Vehicle adds 1 to the Drive Rating of a Walker Drive (p. 374).
    const rating = drive ? drive.drive.rating + (drive.automation?.key === "walker" ? sum("walkerDriveRatingBonus") : 0) : 0;
    this.drive = drive
      ? { id: drive.id, name: drive.name, rating, controlSkill: drive.drive.controlSkill || "drive", minMomentum: drive.drive.minMomentum, flying: drive.drive.flying, automation: drive.automation ?? {} }
      : { id: "", name: "", rating: 0, controlSkill: "drive", minMomentum: 0, flying: false, automation: {} };
    this.maxMomentum = Math.min(15, 10 + sum("maxMomentumBonus"));
    this.derived = {
      staticDefense: staticDefense({ size: this.size, speed: this.speed, maneuver: this.maneuver, momentum: this.momentum }),
      resilience: frame?.frame.resilience ?? 1,
      speed: this.speed,
      mentalDefense: 0
    };
    // The Apply damage of spec 008 reads Aura here; vehicle armor gives no protection against spells, only the
    // Hexagrammatic Wards do (pp. 366, 371).
    this.modifiers = { combat: { aura: Math.max(0, ...components.map((c) => Number(c.automation?.aura) || 0)), sd: 0 } };
    this.strength = armStrength(components);
    this.critical = { value: 0 };
    this.move = moveRange({ speed: this.speed, driveRating: this.drive.rating, momentum: this.momentum });
    const stats = { maneuver: this.maneuver, acceleration: this.acceleration, speed: this.speed, size: this.size };
    // Metal Giant (Battleship Drive): 2 slots per Size, lost with a second drivetrain (p. 366).
    const perSize = drives.length === 1 && drives[0].automation?.slotsPerSize ? drives[0].automation.slotsPerSize : 1;
    this.slots = { used: slotsUsed([...components, ...weapons]), max: this.size * perSize };
    this.vp = { cost: vehicleCost(stats, [...components, ...weapons]), budget: budgetVp(this.budget.tier) };
    this.warnings = {
      overBudget: this.vp.cost > this.vp.budget,
      overSlots: this.slots.used > this.slots.max,
      noFrame: !frame,
      noDrive: !drive
    };
  }
}
