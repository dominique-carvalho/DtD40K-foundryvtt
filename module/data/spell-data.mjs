import { CHARACTERISTICS, MAGIC_SCHOOLS, SPELL_ACTIONS, SPELL_DURATIONS, SPELL_KEYWORDS } from "../config.mjs";

const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

const int = (initial = 0, { min, max } = {}) => new NumberField({ required: true, nullable: false, integer: true, initial, min, max });
const text = () => new StringField({ required: true, blank: true });

/**
 * Data model for the `spell` Item subtype (spec 009, research R1; stat blocks pp. 233–259).
 * Schema: specs/009-magic/data-model.md.
 */
export class SpellData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
      }),
      school: new StringField({ required: true, choices: Object.keys(MAGIC_SCHOOLS), initial: "abjuration" }),
      level: int(1, { min: 1, max: 5 }),
      // "none": no minimum TN; "mentalDefense": the target's Mental Defense (Detect Thoughts).
      tn: new SchemaField({
        value: new NumberField({ required: true, nullable: true, integer: true, initial: 15, min: 0 }),
        special: new StringField({ required: true, blank: true, initial: "", choices: ["", "none", "mentalDefense"] })
      }),
      action: new StringField({ required: true, choices: SPELL_ACTIONS, initial: "half" }),
      keywords: new ArrayField(new StringField({ required: true, choices: SPELL_KEYWORDS })),
      range: text(),
      target: text(),
      area: text(),
      duration: new SchemaField({
        type: new StringField({ required: true, choices: SPELL_DURATIONS, initial: "instant" }),
        value: int(0, { min: 0 }),
        perLevel: new BooleanField({ initial: false }),
        // (E): the description says how it is used up (p. 229).
        expendable: new BooleanField({ initial: false }),
        concentration: new StringField({ required: true, blank: true, initial: "", choices: ["", "half", "reaction"] }),
        text: text()
      }),
      damage: new SchemaField({
        rolled: int(0, { min: 0 }),
        kept: int(0, { min: 0 }),
        type: new StringField({ required: true, blank: true, initial: "", choices: ["", "E", "X", "R", "I"] }),
        perLevelRolled: int(0, { min: 0 }),
        perLevelKept: int(0, { min: 0 })
      }),
      // Damage the book gives only in words (Prismatic Ray, Energy Grasp…).
      damageText: text(),
      // Resistance: Arcana + this characteristic against the casting total (p. 229).
      save: new StringField({ required: true, blank: true, initial: "", choices: ["", ...Object.keys(CHARACTERISTICS)] }),
      effect: text(),
      perRaise: text(),
      automation: new SchemaField({
        target: new StringField({ required: true, blank: true, initial: "", choices: ["", "self", "target"] }),
        changes: new ArrayField(new SchemaField({
          key: new StringField({ required: true, blank: false }),
          value: int(0),
          perRaise: int(0),
          perLevel: int(0),
          capLevelMultiplier: int(0, { min: 0 })
        })),
        statuses: new ArrayField(new StringField({ required: true, blank: false }))
      }),
      // School rating when the character learned it (on the character).
      learnedAt: int(0, { min: 0 })
    };
  }
}
