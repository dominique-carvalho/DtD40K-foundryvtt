import {
  CHARACTERISTICS, EXALTATION_FORMULAS, EXALTATION_POWER_AUTOMATION, POWER_STAT_CAPS, RESOURCE_ACTIONS, RESOURCE_HEALING
} from "../config.mjs";

const { ArrayField, BooleanField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * Integer field helper.
 * @param {number|null} initial
 * @param {{min?: number, max?: number, nullable?: boolean}} [options]
 */
const integer = (initial, { min, max, nullable = false } = {}) =>
  new NumberField({ required: true, nullable, integer: true, initial, min, max });

const text = () => new StringField({ required: true, blank: true });
const html = () => new HTMLField({ required: true, blank: true });

/** Amount of a recovery action: a positive integer, or "powerStat" (research R4). */
const validateAmount = (action) => {
  if (action.type === "restoreAll" || action.type === "unravel") return;
  if (action.amount !== "powerStat" && !/^[1-9]\d*$/.test(action.amount)) {
    throw new Error(`recovery amount must be a positive integer or "powerStat", got "${action.amount}"`);
  }
};

/**
 * Data model for the `exaltation` Item subtype: the book data plus the state of the
 * exaltation on the character that owns it (purchased Power Stat and points spent).
 * Values derived from that state live on the actor (research R2).
 * Schema: specs/004-exaltation-compendium/data-model.md.
 */
export class ExaltationData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      description: html(),
      // Filled in by each table in its own world; always empty in the system compendium (constitution V).
      fullText: html(),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: integer(null, { min: 1, nullable: true })
      }),
      powerStat: new SchemaField({
        name: text(),
        cap: new StringField({ required: true, choices: POWER_STAT_CAPS, initial: "level" }),
        value: integer(1, { min: 1, max: 10 })
      }),
      resource: new SchemaField({
        name: text(),
        formula: new StringField({ required: true, choices: EXALTATION_FORMULAS, initial: "fixed" }),
        fixedMax: integer(0, { min: 0 }),
        recovery: html(),
        actions: new ArrayField(
          new SchemaField({
            type: new StringField({ required: true, choices: RESOURCE_ACTIONS, initial: "regain" }),
            amount: new StringField({ required: true, blank: true, initial: "1" })
          }),
          { validate: (actions) => actions.forEach(validateAmount) }
        ),
        debtName: text(),
        healing: new StringField({ required: true, choices: RESOURCE_HEALING, initial: "outOfCombat" }),
        spent: integer(0, { min: 0 })
      }),
      round: new SchemaField({
        spent: integer(0, { min: 0 }),
        marker: new StringField({ required: true, blank: false, initial: "none" })
      }),
      scene: new SchemaField({ spent: integer(0, { min: 0 }) }),
      pressure: new SchemaField({
        enabled: new BooleanField({ initial: false }),
        spent: integer(0, { min: 0 })
      }),
      staticPowers: new ArrayField(
        new SchemaField({
          name: text(),
          description: html(),
          automation: new StringField({ required: true, choices: EXALTATION_POWER_AUTOMATION, initial: "none" })
        })
      ),
      powers: new ArrayField(
        new SchemaField({ rank: integer(1, { min: 1, max: 5 }), name: text(), description: html() }),
        {
          validate: (powers) => {
            // An exaltation created in the Items directory starts with no powers.
            if (!powers.length) return;
            if (powers.length !== 5 || powers.some((power, index) => power.rank !== index + 1)) {
              throw new Error("must list exactly 5 powers, ranks 1 to 5 in order");
            }
          }
        }
      ),
      elements: new ArrayField(
        new SchemaField({
          key: new StringField({ required: true, blank: false }),
          name: text(),
          characteristic: new StringField({ required: true, choices: Object.keys(CHARACTERISTICS), initial: "str" }),
          hpMax: integer(0, { min: 0 }),
          description: html()
        })
      ),
      tell: html(),
      lore: new SchemaField({
        origin: html(),
        appearance: html(),
        society: html(),
        examples: new ArrayField(new StringField({ required: true, blank: false, trim: true }))
      }),
      selection: new SchemaField({
        statuesque: new StringField({ required: true, blank: true, initial: "", choices: ["", ...Object.keys(CHARACTERISTICS)] }),
        element: text()
      })
    };
  }
}
