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
        type: new StringField({ required: true, blank: true, initial: "", choices: ["", ...DAMAGE_TYPES] })
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
      ammoGroup: new StringField({ required: true, blank: true })
    };
  }
}
