import { ADDICTIVITY, ARMOR_PIECES, GEAR_CATEGORIES } from "../config.mjs";
import { count, equipmentFields } from "./equipment-fields.mjs";
import { grantField } from "./fields.mjs";

const { ArrayField, BooleanField, StringField } = foundry.data.fields;

/**
 * Data model for the `gear` Item subtype: gear, cybernetics, drugs, magical materials, Wonders and
 * Hearthstones (spec 007, research R1, R10–R12). Schema: specs/007-equipment/data-model.md.
 */
export class GearData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      ...equipmentFields(),
      category: new StringField({ required: true, choices: GEAR_CATEGORIES, initial: "gear" }),
      effectText: new StringField({ required: true, blank: true }),
      addictivity: new StringField({ required: true, choices: Object.keys(ADDICTIVITY), initial: "none" }),
      // A dose of the drug is in effect.
      active: new BooleanField({ initial: false }),
      mechadendrite: new BooleanField({ initial: false }),
      // Bionic limb: +2 AP at that location (p. 336).
      location: new StringField({ required: true, blank: true, initial: "", choices: ["", ...ARMOR_PIECES] }),
      // Hearthstone settings of a Wonder (Hearthstone Amulet 1, Bracers 2, Dragon Tear Tiara 3; p. 352).
      sockets: count(0),
      // Hearthstone: id of the item of the same actor it is set in.
      socketedIn: new StringField({ required: true, blank: true }),
      grants: new ArrayField(grantField())
    };
  }
}
