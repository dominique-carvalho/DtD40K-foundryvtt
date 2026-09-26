import { CHARACTERISTICS, CLASS_COMPLETION, CLASS_STATUS, SKILLS } from "../config.mjs";
import { grantField } from "./fields.mjs";

const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

const text = () => new StringField({ required: true, blank: true });
const name = () => new StringField({ required: true, blank: false, trim: true });
const integer = (initial, { min, max } = {}) => new NumberField({ required: true, nullable: false, integer: true, initial, min, max });
const keys = (choices) => new ArrayField(new StringField({ required: true, blank: false, choices }));

const characteristicKeys = Object.keys(CHARACTERISTICS);
const skillKeys = Object.keys(SKILLS);

/**
 * Data model for the `class` Item subtype: the book data of a class (DtD 7.7a pp. 111–172) and its
 * state on the character that took it (current or completed, and the completion bonus choice).
 * Schema: specs/006-classes-xp/data-model.md.
 */
export class ClassData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
      }),
      level: integer(1, { min: 1, max: 5 }),
      track: text(),
      prerequisites: new SchemaField({
        // Several keys mean "any of them" (e.g. Weaponry or Ballistics 3).
        skills: new ArrayField(new SchemaField({
          keys: keys(skillKeys),
          value: integer(1, { min: 1, max: 6 })
        }), { validate: (list) => list.forEach((entry) => { if (!entry.keys.length) throw new Error("needs at least one skill"); }) }),
        feats: new ArrayField(name()),
        schools: new ArrayField(new SchemaField({ name: name(), value: integer(1, { min: 1, max: 6 }) })),
        text: text()
      }),
      characteristics: keys(characteristicKeys),
      anyCharacteristic: new BooleanField({ initial: false }),
      skills: keys(skillKeys),
      feats: new ArrayField(new SchemaField({
        name: name(),
        subcategory: text(),
        mandatory: new BooleanField({ initial: true }),
        orGroup: text()
      })),
      magicSchools: new ArrayField(name()),
      swordSchools: new ArrayField(name()),
      gunKata: new ArrayField(name()),
      completion: new SchemaField({
        text: new HTMLField({ required: true, blank: true }),
        automation: new StringField({ required: true, choices: CLASS_COMPLETION, initial: "none" }),
        value: integer(0),
        skillGroup: new StringField({ required: true, choices: ["any", "social"], initial: "any" }),
        grants: new ArrayField(grantField()),
        // Choice made when the class is completed on the character.
        selection: new SchemaField({
          skill: new StringField({ required: true, blank: true, initial: "", choices: ["", ...skillKeys] }),
          specialty: text()
        })
      }),
      status: new StringField({ required: true, choices: CLASS_STATUS, initial: "current" }),
      startedAt: integer(0, { min: 0 })
    };
  }
}
