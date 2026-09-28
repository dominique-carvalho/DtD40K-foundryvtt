import { CONSOLE_TYPES, HULL_CLASSES, OFFICER_POSTS, SHIELD_TYPES, SHIP_CATEGORIES, SHIP_WEAPON_TYPES } from "../config.mjs";
import { weaponProfile } from "../rules/ship.mjs";
import { lockedPackHint } from "./item-sheet-helpers.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/** Options object for `selectOptions` from keys and an i18n prefix. */
const options = (keys, prefix) => Object.fromEntries(keys.map((key) => [key, `${prefix}.${key}`]));

/**
 * Ship component item sheet (spec 014, FR-001): category and BP cost, then the fields of the category — hull stats and
 * slots, officer post and holder, console type, shield Capacity and Regeneration, weapon profile with its type and mount
 * (and the combined profile), torpedo profile, tube mount. Read-only for locked compendium entries.
 */
export class ShipComponentSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "ship-component"],
    position: { width: 540, height: 600 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/item/ship-component-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options_) {
    const context = await super._prepareContext(options_);
    const item = this.document;
    const system = item.system;
    const c = system.category;
    const holder = system.officer.actorUuid ? foundry.utils.fromUuidSync(system.officer.actorUuid) : null;
    const profile = c === "weapon" ? weaponProfile({ ...system.weapon, cost: system.cost }, system.weapon.typeKey) : null;
    Object.assign(context, {
      item,
      system,
      editable: this.isEditable,
      embedded: Boolean(item.actor),
      lockedPackHint: lockedPackHint(item),
      is: Object.fromEntries(SHIP_CATEGORIES.map((key) => [key, c === key])),
      isHullLike: c === "hull" || c === "customHull",
      categoryOptions: options(SHIP_CATEGORIES, "DTD.Ship.Category"),
      classOptions: options(HULL_CLASSES, "DTD.Ship.HullClass"),
      consoleOptions: options(CONSOLE_TYPES, "DTD.Ship.ConsoleType"),
      postOptions: options(Object.keys(OFFICER_POSTS), "DTD.Ship.Post"),
      shieldOptions: options(SHIELD_TYPES, "DTD.Ship.ShieldType"),
      typeOptions: options(Object.keys(SHIP_WEAPON_TYPES), "DTD.Ship.WeaponType"),
      arcOptions: options(["fixed", "flexible", "omni"], "DTD.Ship.Arc"),
      mountOptions: options(["forward", "rear"], "DTD.Ship.Mount"),
      kindOptions: options(["lance", "array"], "DTD.Ship.Kind"),
      rank: system.officer.post ? `DTD.Ship.Rank.${OFFICER_POSTS[system.officer.post].rank}` : "",
      holderName: holder?.name ?? "",
      profile,
      enriched: {
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, { relativeTo: item, secrets: item.isOwner })
      }
    });
    return context;
  }
}
