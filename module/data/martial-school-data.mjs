import { MARTIAL_ENTRY_TYPES, MARTIAL_SCHOOLS, SKILLS } from "../config.mjs";

const { ArrayField, BooleanField, HTMLField, NumberField, ObjectField, SchemaField, StringField } = foundry.data.fields;

const text = () => new StringField({ required: true, blank: true });

/**
 * Data model for the `martialSchool` Item subtype: a Sword School or a Gun Kata (spec 010, research R1;
 * pp. 262–279). Schema: specs/010-sword-schools/data-model.md.
 */
export class MartialSchoolData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
      }),
      key: new StringField({ required: true, choices: Object.keys(MARTIAL_SCHOOLS), initial: "desertWind" }),
      kind: new StringField({ required: true, choices: ["sword", "gunKata"], initial: "sword" }),
      keySkill: new StringField({ required: true, choices: Object.keys(SKILLS), initial: "athletics" }),
      // Weapon group of the Apprentice Restriction (Sword Schools; groups of spec 007), "" for Gun Kata.
      weaponGroup: text(),
      summary: text(),
      entries: new ArrayField(new SchemaField({
        // Stable slug: Special Attacks reference entries as "<school>:<id>".
        id: new StringField({ required: true, blank: false }),
        rank: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 5 }),
        type: new StringField({ required: true, choices: MARTIAL_ENTRY_TYPES, initial: "advantage" }),
        name: new StringField({ required: true, blank: false }),
        // Style points: Advantages positive, Restrictions negative; null for actions and Masteries.
        cost: new NumberField({ required: true, nullable: true, integer: true, initial: null }),
        // "*" in the book: bought several times, each time for the cost.
        perPoint: new BooleanField({ initial: false }),
        // Costs to choose from (Revitalizing Strike 1/3); [0] for "X" (Exit Wound Kata: X points).
        variableCost: new ArrayField(new NumberField({ required: true, nullable: false, integer: true })),
        effect: text(),
        // Automatable parts (research R3–R5); free-form, read by rules/martial.mjs.
        automation: new ObjectField()
      }))
    };
  }
}
