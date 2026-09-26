import { ASSET_GROUPS, CHARACTERISTICS, FEAT_AUTOMATION, FEAT_CATEGORIES, FEAT_REQUIREMENT_TYPES, SKILLS } from "../config.mjs";
import { grantField } from "./fields.mjs";

const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

const text = () => new StringField({ required: true, blank: true });
const integer = (initial) => new NumberField({ required: true, nullable: false, integer: true, initial, min: 0 });

/**
 * Data model for the `feat` Item subtype: class feats, racial feats, assets, hindrances and
 * Exalted Assets (spec 004 research R1, spec 005 research R1). `group` keeps its 004 meaning
 * (Exalted Asset group); `featGroup` is the feat group whose sub-category is picked (p. 174).
 * Schema: specs/005-feats-assets-hindrances/data-model.md.
 */
export class FeatData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      category: new StringField({ required: true, choices: FEAT_CATEGORIES, initial: "feat" }),
      description: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
      }),
      xpCost: integer(100),
      // Hindrances give XP instead of costing it (p. 179).
      xpGranted: integer(0),
      group: new StringField({ required: true, blank: true, initial: "", choices: ["", ...ASSET_GROUPS] }),
      prerequisites: new SchemaField({
        exaltation: text(),
        race: text(),
        deity: text()
      }),
      repeatable: new BooleanField({ initial: false }),
      featGroup: new SchemaField({
        enabled: new BooleanField({ initial: false }),
        options: new ArrayField(new StringField({ required: true, blank: false, trim: true }))
      }),
      requires: new ArrayField(
        new SchemaField({
          type: new StringField({ required: true, choices: FEAT_REQUIREMENT_TYPES, initial: "feat" }),
          name: new StringField({ required: true, blank: false, trim: true })
        })
      ),
      automation: new StringField({ required: true, choices: FEAT_AUTOMATION, initial: "none" }),
      grants: new ArrayField(grantField()),
      // Choices made on the character (empty in the compendium).
      selection: new SchemaField({
        subcategory: text(),
        characteristic: new StringField({ required: true, blank: true, initial: "", choices: ["", ...Object.keys(CHARACTERISTICS)] }),
        characteristic2: new StringField({ required: true, blank: true, initial: "", choices: ["", ...Object.keys(CHARACTERISTICS)] }),
        skill: new StringField({ required: true, blank: true, initial: "", choices: ["", ...Object.keys(SKILLS)] }),
        specialty: text()
      })
    };
  }
}
