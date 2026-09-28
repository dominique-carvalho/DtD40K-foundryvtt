import { SKILLS, VEHICLE_CATEGORIES } from "../config.mjs";
import { componentCost, componentSlots } from "../rules/vehicle.mjs";
import { lockedPackHint } from "./item-sheet-helpers.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Vehicle component item sheet (spec 013, FR-001): category, VP cost, slots and the fields of drivetrains, frames and
 * armor; on a vehicle, the quantity and the Macronized/Miniaturized count with the resulting cost and slots (p. 375).
 * Read-only for locked compendium entries.
 */
export class VehicleComponentSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "vehicle-component"],
    position: { width: 520, height: 560 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/item/vehicle-component-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.document;
    const system = item.system;
    Object.assign(context, {
      item,
      system,
      editable: this.isEditable,
      lockedPackHint: lockedPackHint(item),
      categoryOptions: Object.fromEntries(VEHICLE_CATEGORIES.map((key) => [key, `DTD.Vehicle.Category.${key}`])),
      skillOptions: Object.fromEntries(Object.entries(SKILLS).map(([key, def]) => [key, def.label])),
      isDrive: system.category === "drivetrain",
      isFrame: system.category === "frame",
      isArmor: system.category === "armor",
      isUpgrade: system.category === "weaponUpgrade",
      embedded: Boolean(item.actor),
      macronized: system.automation?.macronized ?? 0,
      miniaturized: system.automation?.miniaturized ?? 0,
      totalCost: componentCost(system),
      totalSlots: componentSlots(system),
      enriched: {
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, { relativeTo: item, secrets: item.isOwner })
      }
    });
    return context;
  }
}
