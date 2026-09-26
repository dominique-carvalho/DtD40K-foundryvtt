import { ARMOR_PIECES, ARMOR_TYPES } from "../config.mjs";
import { count, equipmentFields } from "./equipment-fields.mjs";

const { BooleanField, NumberField, StringField } = foundry.data.fields;

/**
 * Data model for the `armor` Item subtype (spec 007, research R1; pp. 332–333).
 * A suit covers every location; a piece covers one and is one rarity step cheaper.
 * Schema: specs/007-equipment/data-model.md.
 */
export class ArmorData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      ...equipmentFields(),
      armorType: new StringField({ required: true, choices: ARMOR_TYPES, initial: "light" }),
      ap: count(0),
      // null: no Max Dex limit ("-").
      maxDex: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 0 }),
      piece: new StringField({ required: true, blank: true, initial: "", choices: ["", ...ARMOR_PIECES] }),
      // Power armor only works as a full suit (p. 332).
      suitOnly: new BooleanField({ initial: false }),
      // Primitive armor: artifact rating one step lower (p. 348).
      primitive: new BooleanField({ initial: false })
    };
  }
}
