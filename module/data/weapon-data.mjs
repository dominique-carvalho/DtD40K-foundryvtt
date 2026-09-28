import { DAMAGE_TYPES, WEAPON_PROFICIENCIES, WEAPON_QUALITIES, WEAPON_TYPES } from "../config.mjs";
import { count, equipmentFields } from "./equipment-fields.mjs";

const { ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * Data model for the `weapon` Item subtype (spec 007, research R1; profile columns p. 318).
 * Schema: specs/007-equipment/data-model.md.
 */
export class WeaponData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      ...equipmentFields(),
      weaponType: new StringField({ required: true, choices: WEAPON_TYPES, initial: "melee" }),
      // Melee weapons that may also be thrown (Knife, Shortspear).
      thrown: new BooleanField({ initial: false }),
      group: new StringField({ required: true, blank: true, trim: true }),
      proficiencies: new ArrayField(new StringField({ required: true, choices: WEAPON_PROFICIENCIES })),
      damage: new SchemaField({
        rolled: count(0),
        kept: count(0),
        type: new StringField({ required: true, blank: true, initial: "", choices: ["", ...DAMAGE_TYPES] }),
        // Flat bonus of vehicle weapons, e.g. 4k2+10 (spec 013).
        bonus: new NumberField({ required: true, nullable: false, integer: true, initial: 0 })
      }),
      pen: count(0),
      rof: new SchemaField({
        single: new BooleanField({ initial: true }),
        auto: count(0)
      }),
      range: new SchemaField({
        value: count(0),
        // Grenades: Strength × 3 metres.
        strMultiplier: count(0)
      }),
      clip: count(0),
      reload: new StringField({ required: true, blank: true }),
      qualities: new ArrayField(new SchemaField({
        key: new StringField({ required: true, choices: Object.keys(WEAPON_QUALITIES) }),
        value: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 0 })
      })),
      // Launchers: damage comes from a grenade or missile carried by the character.
      ammoGroup: new StringField({ required: true, blank: true }),
      // Custom weapons (spec 015): the build that made the profile, the approval/crafting state and the notes of the
      // effects kept as text. An empty status is an ordinary or finished weapon.
      custom: new SchemaField({
        build: new SchemaField({
          family: new StringField({ required: true, blank: true, initial: "", choices: ["", "ranged", "melee"] }),
          template: new StringField({ required: true, blank: true }),
          type: new StringField({ required: true, blank: true }),
          damageType: new StringField({ required: true, blank: true }),
          mods: new ArrayField(new StringField({ required: true, blank: false }))
        }),
        status: new StringField({ required: true, blank: true, initial: "", choices: ["", "pending", "crafting"] }),
        crafting: new SchemaField({
          materials: new BooleanField({ initial: false }),
          crafted: new BooleanField({ initial: false }),
          attempts: count(0)
        }),
        notes: new ArrayField(new StringField({ required: true, blank: false }))
      }),
      // Vehicle-mounted weapons (spec 013, p. 377): scale, slots and VP cost.
      vehicle: new SchemaField({
        scale: new StringField({ required: true, blank: true, initial: "", choices: ["", "Vhcl", "Hybrid"] }),
        slots: count(0),
        cost: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        // Times Macronized / Miniaturized (p. 375), applied to cost and slots by rules/vehicle.mjs.
        macronized: count(0),
        miniaturized: count(0)
      })
    };
  }
}
