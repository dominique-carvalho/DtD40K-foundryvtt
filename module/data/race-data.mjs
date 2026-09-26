import { CHARACTERISTICS, RACE_POWER_AUTOMATION, SKILLS } from "../config.mjs";
import { remainingUses, usesPerScene } from "../rules/race.mjs";
import { grantField } from "./fields.mjs";

const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * Integer field helper.
 * @param {number|null} initial
 * @param {{min?: number, max?: number, nullable?: boolean}} [options]
 */
const integer = (initial, { min, max, nullable = false } = {}) =>
  new NumberField({ required: true, nullable, integer: true, initial, min, max });

/** List of distinct keys restricted to a set of choices. */
const keyList = (choices) =>
  new ArrayField(new StringField({ required: true, blank: false, choices }), {
    validate: (value) => {
      if (new Set(value).size !== value.length) throw new Error("must not contain duplicate keys");
    }
  });

/** List of short free-text entries (items must not be blank). */
const textList = () => new ArrayField(new StringField({ required: true, blank: false, trim: true }));

const characteristicKeys = Object.keys(CHARACTERISTICS);
const skillKeys = Object.keys(SKILLS);

/**
 * Data model for the `race` Item subtype.
 * Schema: specs/002-race-compendium/data-model.md.
 */
export class RaceData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      // Filled in by each table in its own world; always empty in the system compendium (constitution V).
      fullText: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: integer(null, { min: 1, nullable: true })
      }),
      characteristicBonus: new SchemaField({
        options: keyList(characteristicKeys),
        any: new BooleanField({ initial: false })
      }),
      skillBonus: new SchemaField({
        skills: keyList(skillKeys),
        choose: integer(0, { min: 0, max: skillKeys.length })
      }),
      size: integer(4, { min: 1, max: 10 }),
      power: new SchemaField({
        name: new StringField({ required: true, blank: true }),
        description: new HTMLField({ required: true, blank: true }),
        automation: new StringField({ required: true, choices: RACE_POWER_AUTOMATION, initial: "none" }),
        uses: new SchemaField({ spent: integer(0, { min: 0 }) })
      }),
      lore: new SchemaField({
        height: new StringField({ required: true, blank: true }),
        weight: new StringField({ required: true, blank: true }),
        languages: textList(),
        personality: textList(),
        physical: textList(),
        names: textList()
      }),
      // Feats the race grants (e.g. Aasimar: Jaded, Fearless — spec 005, research R6).
      grants: new ArrayField(grantField()),
      choice: new SchemaField({
        characteristic: new StringField({ required: true, blank: true, initial: "", choices: ["", ...characteristicKeys] }),
        skills: keyList(skillKeys)
      })
    };
  }

  /**
   * Uses per scene follow the owning character's Level (FR-017, research R5).
   * @override
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    const actor = this.parent?.actor;
    if (!actor || this.power.automation !== "usesPerScene") return;
    const level = actor.system.level;
    this.power.uses.max = usesPerScene(level);
    this.power.uses.remaining = remainingUses(level, this.power.uses.spent);
  }
}
