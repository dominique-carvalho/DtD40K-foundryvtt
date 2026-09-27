import { PANTHEONS } from "../config.mjs";

const { ArrayField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

const text = () => new StringField({ required: true, blank: true });

/**
 * Data model for the `deity` Item subtype: a god or a pantheon-wide cult (spec 011, research R1; pp. 287–312).
 * On a character, the embedded deity is its alignment. Schema: specs/011-backgrounds-alignment/data-model.md.
 */
export class DeityData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
      }),
      key: text(),
      pantheon: new StringField({ required: true, choices: Object.keys(PANTHEONS), initial: "ruinousPowers" }),
      summary: text(),
      commandments: new ArrayField(new StringField({ required: true, blank: false })),
      keywords: new ArrayField(new StringField({ required: true, blank: false })),
      directivesTitle: text(),
      directives: new ArrayField(new StringField({ required: true, blank: false })),
      cults: new ArrayField(new SchemaField({
        name: new StringField({ required: true, blank: false }),
        summary: text()
      }))
    };
  }
}
