import { VEHICLE_CATEGORIES } from "../config.mjs";

const { BooleanField, HTMLField, NumberField, ObjectField, SchemaField, StringField } = foundry.data.fields;

const int = (initial = 0, { min, max, nullable = false } = {}) => new NumberField({ required: true, nullable, integer: true, initial, min, max });

/**
 * Data model for the `vehicleComponent` Item subtype (spec 013, research R1; pp. 366–380): drivetrains, frames,
 * armor, control systems, accommodations, accessories, modifications and weapon ammunition/modes.
 * Schema: specs/013-vehicles/data-model.md.
 */
export class VehicleComponentData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      description: new HTMLField({ required: true, blank: true }),
      source: new SchemaField({
        book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
        page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
      }),
      category: new StringField({ required: true, choices: VEHICLE_CATEGORIES, initial: "accessory" }),
      // VP; negative for Lightweight frames and flaws. Null when the book prints "–" (Cockpit).
      cost: int(0, { nullable: true }),
      // Equipment slots; null = uses none (drivetrain, frame, armor, Cockpit).
      slots: int(0, { min: 0, nullable: true }),
      perPurchase: new BooleanField({ initial: false }),
      quantity: int(1, { min: 1 }),
      drive: new SchemaField({
        rating: int(0, { min: 0 }),
        controlSkill: new StringField({ required: true, blank: true, initial: "" }),
        minMomentum: int(0, { min: 0 }),
        flying: new BooleanField({ initial: false })
      }),
      frame: new SchemaField({ hp: int(0, { min: 0 }), resilience: int(0, { min: 0 }) }),
      armor: new SchemaField({ ap: int(0, { min: 0 }) }),
      // Parent weapon of an ammunition or mode (weaponUpgrade).
      parent: new StringField({ required: true, blank: true }),
      effect: new StringField({ required: true, blank: true }),
      automation: new ObjectField()
    };
  }
}
