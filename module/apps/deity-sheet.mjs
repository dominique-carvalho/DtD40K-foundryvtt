import { PANTHEONS } from "../config.mjs";
import { lockedPackHint } from "./item-sheet-helpers.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Deity item sheet (spec 011, FR-001): pantheon, commandments, keywords, directives and cults; read-only for locked
 * compendium entries. The book data is edited through the JSON sources.
 */
export class DeitySheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "deity"],
    position: { width: 540, height: 640 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/item/deity-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.document;
    Object.assign(context, {
      item,
      system: item.system,
      editable: this.isEditable,
      lockedPackHint: lockedPackHint(item),
      pantheonLabel: game.i18n.localize(PANTHEONS[item.system.pantheon].label),
      enriched: {
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { relativeTo: item, secrets: item.isOwner })
      }
    });
    return context;
  }
}
