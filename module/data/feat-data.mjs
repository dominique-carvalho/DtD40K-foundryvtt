import { ASSET_AUTOMATION, ASSET_GROUPS, FEAT_CATEGORIES } from "../config.mjs";

const { HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

const text = () => new StringField({ required: true, blank: true });

/**
 * Data model for the `feat` Item subtype. Only the `exaltedAsset` category exists so far;
 * the feats feature adds the others (spec 004, research R1).
 * Schema: specs/004-exaltation-compendium/data-model.md.
 */
export class FeatData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      category: new StringField({ required: true, choices: FEAT_CATEGORIES, initial: "exaltedAsset" }),
      description: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
      }),
      xpCost: new NumberField({ required: true, nullable: false, integer: true, initial: 100, min: 0 }),
      group: new StringField({ required: true, blank: true, initial: "", choices: ["", ...ASSET_GROUPS] }),
      prerequisites: new SchemaField({
        exaltation: text(),
        race: text(),
        deity: text()
      }),
      automation: new StringField({ required: true, choices: ASSET_AUTOMATION, initial: "none" })
    };
  }
}
