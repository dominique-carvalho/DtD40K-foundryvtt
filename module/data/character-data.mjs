import { CHARACTERISTICS, DERIVED_KEYS, SKILLS } from "../config.mjs";
import { computeDerived } from "../rules/derived.mjs";
import { capValue } from "../rules/race.mjs";

const { ArrayField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * Integer field helper.
 * @param {number} initial
 * @param {{min?: number, max?: number}} [range]
 */
const integer = (initial, { min, max } = {}) =>
  new NumberField({ required: true, nullable: false, integer: true, initial, min, max });

/** List of free-text specialties (items must not be blank). */
const specialties = () => new ArrayField(new StringField({ required: true, blank: false, trim: true }));

/**
 * Data model for the `character` Actor subtype.
 * Schema: specs/001-system-foundation/data-model.md.
 */
export class CharacterData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    const characteristics = Object.fromEntries(
      Object.keys(CHARACTERISTICS).map((key) => [
        key,
        new SchemaField({ value: integer(1, { min: 0, max: 6 }), specialties: specialties() })
      ])
    );

    const skills = Object.fromEntries(
      Object.keys(SKILLS).map((key) => [
        key,
        new SchemaField({ value: integer(0, { min: 0, max: 6 }), specialties: specialties() })
      ])
    );

    const derivedMods = Object.fromEntries(
      DERIVED_KEYS.map((key) => [
        key,
        new SchemaField({
          bonus: integer(0),
          override: new NumberField({ required: true, nullable: true, integer: true, initial: null })
        })
      ])
    );

    return {
      characteristics: new SchemaField(characteristics),
      skills: new SchemaField(skills),
      size: integer(4, { min: 1, max: 10 }),
      level: integer(1, { min: 1, max: 10 }),
      hp: new SchemaField({ value: integer(0, { min: 0 }) }),
      resolve: new SchemaField({ value: integer(0, { min: 0 }) }),
      fatigue: new SchemaField({ value: integer(0, { min: 0 }) }),
      heroPoints: new SchemaField({
        value: integer(2, { min: 0 }),
        max: integer(2, { min: 0 })
      }),
      devotion: new SchemaField({ value: integer(6, { min: 0, max: 10 }) }),
      derivedMods: new SchemaField(derivedMods),
      // Targets of racial power effects only — never rendered as sheet inputs (spec 002, research R3/R4).
      modifiers: new SchemaField({
        staticDefenseFormula: new StringField({ required: true, choices: ["standard", "shifty"], initial: "standard" }),
        resilience: integer(0)
      }),
      biography: new HTMLField({ required: true, blank: true })
    };
  }

  /**
   * Derived values are recomputed on every data preparation and never persisted.
   * @override
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.#capRatings();
    const derived = computeDerived(this, this.derivedMods, this.modifiers);
    this.derived = {
      staticDefense: derived.staticDefense,
      mentalDefense: derived.mentalDefense,
      speed: derived.speed,
      resilience: derived.resilience
    };
    this.hp.max = derived.hpMax;
    this.resolve.max = derived.resolveMax;
    this.fatigue.max = derived.fatigueMax;
  }

  /**
   * Racial Active Effects are added without schema bounds (research R2), so cap
   * every characteristic and skill at 6 before deriving anything (spec 002, FR-015).
   * `capped` records which ratings lost part of a bonus, for the sheet.
   */
  #capRatings() {
    this.capped = {};
    for (const group of ["characteristics", "skills"]) {
      for (const [key, data] of Object.entries(this[group])) {
        const { value, capped } = capValue(data.value);
        data.value = value;
        if (capped) this.capped[`${group}.${key}`] = true;
      }
    }
  }
}
