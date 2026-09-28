import { fighterDamage } from "../rules/ship.mjs";

const { NumberField, StringField } = foundry.data.fields;

/** Fightercraft profile (p. 407): every craft has Static Defense 25, 1 Hull, Speed 10 and weapons of range 5. */
export const FIGHTER_PROFILE = { staticDefense: 25, hull: 1, speed: 10, range: 5 };

/**
 * Data model for the `squadron` Actor subtype (spec 014, research R7): up to 10 fightercraft launched from a ship's
 * Fighter Bay, crewed by its Crew; each hit downs one craft.
 */
export class SquadronData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      count: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 10 }),
      shipUuid: new StringField({ required: true, blank: true })
    };
  }

  /** @override */
  prepareDerivedData() {
    this.profile = FIGHTER_PROFILE;
    this.derived = { staticDefense: FIGHTER_PROFILE.staticDefense, speed: FIGHTER_PROFILE.speed };
    this.damage = fighterDamage(this.count);
  }
}
