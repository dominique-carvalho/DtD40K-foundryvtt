import { CUSTOMIZATION, OFFICER_POSTS, SHIP_DEPARTMENTS } from "../config.mjs";
import {
  bpSpent, consoleBonuses, critModifier, crewAvailable, customHull, initiativeBonus, shipBudget, shipStats, slotUsage,
  staticDefense, SHIP_CRIT
} from "../rules/ship.mjs";

const { ArrayField, BooleanField, HTMLField, NumberField, ObjectField, SchemaField, StringField } = foundry.data.fields;

const int = (initial = 0, min = 0, max) => new NumberField({ required: true, nullable: false, integer: true, initial, min, max });
const TYPED = ["arcana", "command", "engineering", "tactical"];

/**
 * Data model for the `ship` Actor subtype (spec 014, research R2; pp. 386–415). The hull and the installed components
 * give the stats; the combat state keeps Crew committed this round, the shield, Hull and lasting criticals.
 * Schema: specs/014-ships/data-model.md.
 */
export class ShipData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      budget: new SchemaField({ holdings: int(1, 0, 5) }),
      custom: new SchemaField({
        upgrades: new SchemaField(Object.fromEntries(Object.keys(CUSTOMIZATION).map((k) => [k, int(0)]))),
        nonUniversal: new SchemaField(Object.fromEntries(TYPED.map((t) => [t, int(0)])))
      }),
      hull: new SchemaField({ value: int(40), temp: int(0) }),
      crew: new SchemaField({
        // Lost to criticals, encounters or boarding until Recruit Crew; temporary from Triage (spent first).
        lost: int(0), temp: int(0),
        // Committed this round (reset when the round changes) and flying as fighters.
        committed: int(0), committedRound: int(0), deployed: int(0)
      }),
      shield: new SchemaField({
        value: int(0), disruption: int(0), collapsed: new BooleanField({ initial: false }),
        layers: new ArrayField(new SchemaField({ value: int(0), disruption: int(0) }))
      }),
      state: new SchemaField({
        destroyed: new BooleanField({ initial: false }),
        // Lasting Crit Chart effects and the TN to clear each with an Emergency Repair.
        crits: new ArrayField(new SchemaField({ key: new StringField({ required: true, blank: false }), tn: int(15) })),
        // Components knocked out by criticals or Target Subsystem.
        disabled: new ArrayField(new StringField({ required: true, blank: false })),
        suppliesUsed: new BooleanField({ initial: false }),
        // Effects of this round's actions (Brace, Picard Speech, Micromanage, Overcharge, Augury, Silent Running…).
        round: new ObjectField()
      }),
      // Vehicles carried aboard (spec 013), by uuid.
      hangar: new ArrayField(new StringField({ required: true, blank: false })),
      printed: new SchemaField({ cost: new NumberField({ required: true, nullable: true, integer: true, initial: null }) }),
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
    const parts = items.filter((i) => i.type === "shipComponent").map((i) => ({ id: i.id, name: i.name, ...i.system }));
    const hullItem = parts.find((p) => p.category === "hull" || p.category === "customHull") ?? null;
    const isCustom = hullItem?.category === "customHull";
    const empty = { class: "", crew: 0, hullStrength: 0, maneuverability: 0, acceleration: 0, speed: 0, sensors: 0,
      consoles: { arcana: 0, command: 0, engineering: 0, tactical: 0, universal: 0, nonUniversal: 0 }, weapons: { forward: 0, rear: 0 }, customizationPoints: 0 };
    const base = hullItem ? structuredClone(hullItem.hull) : empty;
    const custom = isCustom ? customHull(base, this.custom.upgrades) : null;
    const hullFields = custom ? custom.stats : base;
    const active = parts.filter((p) => !this.state.disabled.includes(p.id));
    const bonuses = consoleBonuses(active.filter((p) => p.category === "console"));
    const critKeys = this.state.crits.map((c) => c.key);
    this.stats = shipStats(hullFields, bonuses, critKeys);
    this.bonuses = bonuses;
    this.custom.cp = custom ? { spent: custom.cpSpent, max: custom.cpMax } : null;
    this.isCustom = isCustom;

    this.derived = { staticDefense: staticDefense(this.stats), resilience: 0, speed: this.stats.speed };
    this.initiativeBonus = initiativeBonus(this.stats);

    const round = globalThis.game?.combat?.started ? game.combat.round : 0;
    const committed = this.crew.committedRound === round ? this.crew.committed : 0;
    this.crew.max = Math.max(0, this.stats.crew - this.crew.lost);
    this.crew.available = crewAvailable({ max: this.crew.max, temp: this.crew.temp, committed, deployed: this.crew.deployed });

    const shield = active.find((p) => p.category === "shield") ?? null;
    this.shield.type = shield?.shield.type ?? "";
    this.shield.max = shield ? shield.shield.capacity + (bonuses.shieldCapacityBonus ?? 0) : 0;
    this.shield.regen = shield?.shield.regen ?? 0;
    this.shield.layerCount = shield?.shield.type === "multiphasic" ? shield.shield.layers + (bonuses.multiphasicExtraLayers ?? 0) : 0;
    this.hull.max = this.stats.hullStrength;

    this.bp = { spent: bpSpent(parts), budget: shipBudget(this.budget.holdings) };
    this.slots = slotUsage(this.stats, parts, isCustom ? this.custom.nonUniversal : {});

    // Bridge officers by department: the post item and the actor holding it.
    this.officers = Object.fromEntries(Object.entries(SHIP_DEPARTMENTS).map(([dept, def]) => {
      const item = parts.find((p) => p.category === "officer" && p.officer.post === def.post);
      return [dept, item ? { itemId: item.id, name: item.name, actorUuid: item.officer.actorUuid, skill: def.skill } : null];
    }));
    this.posts = parts.filter((p) => p.category === "officer").map((p) => p.officer.post);

    const blocks = new Set(critKeys.flatMap((k) => SHIP_CRIT.find((r) => r.key === k)?.mechanics.blocks ?? []));
    this.blocked = Object.fromEntries(["command", "overcharge", "adjustHeading", "evasiveManoeuvers", "weapons", "manoeuver"].map((k) => [k, blocks.has(k)]));
    this.critModifier = critModifier({ crits: critKeys, bonuses });

    const primaries = Object.entries(OFFICER_POSTS).filter(([, d]) => d.rank === "primary").map(([k]) => k);
    this.warnings = [
      !hullItem && "noHull",
      this.bp.spent > this.bp.budget && "overBudget",
      ...this.slots.warnings,
      ...(custom?.warnings.map((w) => `custom.${w.kind}`) ?? []),
      primaries.some((p) => !this.posts.includes(p)) && "missingOfficers",
      this.printed.cost !== null && this.printed.cost !== this.bp.spent && "printedCost"
    ].filter(Boolean);
    this.warnings = [...new Set(this.warnings)];
  }

  /** Roll data for the initiative formula. @override */
  getRollData() {
    return { initiativeBonus: this.initiativeBonus };
  }
}
