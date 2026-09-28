import { CONSOLE_TYPES, HULL_CLASSES, OFFICER_POSTS, SHIELD_TYPES, SHIP_CATEGORIES, SHIP_WEAPON_TYPES } from "../config.mjs";

const { HTMLField, NumberField, ObjectField, SchemaField, StringField } = foundry.data.fields;

const int = (initial = 0, { min, max, nullable = false } = {}) => new NumberField({ required: true, nullable, integer: true, initial, min, max });
const choice = (choices, initial) => new StringField({ required: true, blank: true, choices: ["", ...choices], initial });
const pool = () => new SchemaField({ rolled: int(0, { min: 0 }), kept: int(0, { min: 0 }) });

/**
 * Data model for the `shipComponent` Item subtype (spec 014, research R1; pp. 387–398): standard and custom hulls,
 * officers, consoles, shields, weapon patterns and types, the Torpedo Tube and torpedoes.
 * Schema: specs/014-ships/data-model.md.
 */
export class ShipComponentData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
      }),
      category: new StringField({ required: true, choices: SHIP_CATEGORIES, initial: "console" }),
      // Build Points; torpedoes buy a set of 5 warheads.
      cost: int(0),
      quantity: int(1, { min: 1 }),
      hull: new SchemaField({
        class: choice(HULL_CLASSES, ""),
        crew: int(0, { min: 0 }),
        hullStrength: int(0, { min: 0 }),
        maneuverability: int(0),
        acceleration: int(0),
        speed: int(0, { min: 0 }),
        sensors: int(0),
        consoles: new SchemaField({
          arcana: int(0, { min: 0 }), command: int(0, { min: 0 }), engineering: int(0, { min: 0 }), tactical: int(0, { min: 0 }),
          universal: int(0, { min: 0 }),
          // Custom frames: slots the owner assigns to the four typed consoles.
          nonUniversal: int(0, { min: 0 })
        }),
        weapons: new SchemaField({ forward: int(0, { min: 0 }), rear: int(0, { min: 0 }) }),
        customizationPoints: int(0, { min: 0 })
      }),
      officer: new SchemaField({
        post: choice(Object.keys(OFFICER_POSTS), ""),
        // Character or NPC holding the post; empty = an NPC officer who keeps 4 dice.
        actorUuid: new StringField({ required: true, blank: true })
      }),
      console: new SchemaField({ type: choice(CONSOLE_TYPES, "") }),
      shield: new SchemaField({
        type: choice(SHIELD_TYPES, ""),
        mark: int(1, { min: 1, max: 4 }),
        capacity: int(0, { min: 0 }),
        regen: int(0, { min: 0 }),
        // Multiphasic shields: layers of the listed capacity.
        layers: int(1, { min: 1 })
      }),
      weapon: new SchemaField({
        pattern: new StringField({ required: true, blank: true }),
        kind: choice(["lance", "array"], ""),
        dam: pool(),
        dis: int(0),
        acc: int(0),
        crit: int(0),
        range: int(0, { min: 0 }),
        arc: choice(["fixed", "flexible", "omni"], ""),
        typeKey: choice(Object.keys(SHIP_WEAPON_TYPES), "las"),
        mount: choice(["forward", "rear"], "forward")
      }),
      weaponType: new SchemaField({ key: choice(Object.keys(SHIP_WEAPON_TYPES), "") }),
      torpedo: new SchemaField({
        dam: pool(), dis: int(0), acc: int(0), crit: int(0), range: int(0, { min: 0 }),
        arc: choice(["fixed", "flexible", "omni"], "")
      }),
      tube: new SchemaField({ mount: choice(["forward", "rear"], "forward"), capacity: int(5, { min: 0 }) }),
      effect: new StringField({ required: true, blank: true }),
      automation: new ObjectField()
    };
  }
}
