import { ASSET_AUTOMATION, ASSET_GROUPS, FEAT_CATEGORIES } from "../config.mjs";
import { lockedPackHint } from "./item-sheet-helpers.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Localized options object for a `selectOptions` helper.
 * @param {string[]} keys
 * @param {string} prefix  i18n prefix
 */
const options = (keys, prefix) => Object.fromEntries(keys.map((key) => [key, `${prefix}.${key}`]));

/**
 * Feat item sheet — Exalted Assets for now (spec 004, FR-004/FR-005).
 * Read-only for locked compendium entries; editable for owners otherwise.
 */
export class FeatSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "feat"],
    position: { width: 560, height: 560 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/item/feat-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options_) {
    const context = await super._prepareContext(options_);
    const item = this.document;
    const system = item.system;
    Object.assign(context, {
      item,
      system,
      editable: this.isEditable,
      lockedPackHint: lockedPackHint(item),
      categoryOptions: options(FEAT_CATEGORIES, "DTD.Asset.Category"),
      groupOptions: { "": "—", ...options(ASSET_GROUPS, "DTD.Asset.Group") },
      automationOptions: options(ASSET_AUTOMATION, "DTD.Asset.Automation"),
      categoryLabel: `DTD.Asset.Category.${system.category}`,
      groupLabel: system.group ? `DTD.Asset.Group.${system.group}` : "",
      automationLabel: `DTD.Asset.Automation.${system.automation}`,
      showRace: system.group === "paragonRacial" || Boolean(system.prerequisites.race),
      showDeity: system.group === "chosenMark" || Boolean(system.prerequisites.deity),
      enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, {
        relativeTo: item,
        secrets: item.isOwner
      })
    });
    return context;
  }
}
