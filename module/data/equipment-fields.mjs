import { CRAFTSMANSHIP, MATERIALS, RARITIES, STARTING_SLOTS } from "../config.mjs";

const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

/** Non-negative integer field. */
export const count = (initial = 0) => new NumberField({ required: true, nullable: false, integer: true, initial, min: 0 });

/**
 * Fields shared by the `weapon`, `armor` and `gear` Item subtypes (spec 007, research R1).
 * Schema: specs/007-equipment/data-model.md ("Campos comuns").
 * @returns {Record<string, foundry.data.fields.DataField>}
 */
export function equipmentFields() {
  return {
    description: new HTMLField({ required: true, blank: true }),
    source: new SchemaField({
      book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
      page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
    }),
    rarity: new StringField({ required: true, choices: Object.keys(RARITIES), initial: "common" }),
    quantity: count(1),
    craftsmanship: new StringField({ required: true, choices: Object.keys(CRAFTSMANSHIP), initial: "common" }),
    // Wielded weapon, worn armor, installed cybernetic, gear in use.
    equipped: new BooleanField({ initial: false }),
    material: new StringField({ required: true, blank: true, initial: "", choices: ["", ...Object.keys(MATERIALS)] }),
    // Picked as starting equipment at character creation (p. 16).
    startingSlot: new StringField({ required: true, blank: true, initial: "", choices: ["", ...Object.keys(STARTING_SLOTS)] }),
    // Other names used in the book's descriptions (e.g. Hand Webber for Web Pistol).
    names: new ArrayField(new StringField({ required: true, blank: false, trim: true }))
  };
}
