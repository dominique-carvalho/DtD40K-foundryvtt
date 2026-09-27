import { DAMAGE_TYPES, MINION } from "../config.mjs";
import { squadDerived } from "../rules/minions.mjs";

const { HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

const int = (initial, min, max) => new NumberField({ required: true, nullable: false, integer: true, initial, min, max });
const attack = () => new SchemaField({
  rating: int(0, 0, 5),
  type: new StringField({ required: true, blank: true, initial: "", choices: ["", ...DAMAGE_TYPES] }),
  weapon: new StringField({ required: true, blank: true })
});

/**
 * Data model for the `minionSquad` Actor subtype (spec 012, research R5; pp. 543–544): no hit points; Threat Rating,
 * minions left, melee and ranged Damage Ratings, and the hero they may be teamed with.
 */
export class MinionSquadData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      threatRating: int(1, 1, 5),
      count: int(MINION.maxCount, 0, MINION.maxCount),
      melee: attack(),
      ranged: attack(),
      allyUuid: new StringField({ required: true, blank: true }),
      description: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
      })
    };
  }

  /** @override */
  prepareDerivedData() {
    const derived = squadDerived({ threatRating: this.threatRating });
    // The attack flow reads the target's Static Defense from derived (spec 007/008).
    this.derived = { staticDefense: derived.staticDefense, speed: derived.speed, mentalDefense: 0, resilience: 1 };
    this.range = derived.range;
    this.defeated = this.count <= 0;
  }
}
