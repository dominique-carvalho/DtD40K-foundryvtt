import {
  ASSET_GROUPS, CHARACTERISTICS, FEAT_AUTOMATION, FEAT_CATEGORIES, FEAT_REQUIREMENT_TYPES, HINDRANCE_LIMIT, SKILLS
} from "../config.mjs";
import { lockedPackHint } from "./item-sheet-helpers.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/** Array fields edited as indexed form rows. */
const LIST_FIELDS = ["requires", "grants"];

/** Blank rows added by the "+" buttons. */
const NEW_ENTRY = {
  requires: () => ({ type: "feat", name: "Feat" }),
  grants: () => ({ name: "Feat", subcategory: "", choose: false })
};

/**
 * Localized options object for a `selectOptions` helper.
 * @param {string[]} keys
 * @param {string} prefix  i18n prefix
 */
const options = (keys, prefix) => Object.fromEntries(keys.map((key) => [key, `${prefix}.${key}`]));

/**
 * Feat item sheet: feats, racial feats, assets, hindrances and Exalted Assets (spec 004 FR-005, spec 005 FR-004).
 * Read-only for locked compendium entries; editable for owners otherwise.
 */
export class FeatSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "feat"],
    position: { width: 580, height: 620 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      addEntry: FeatSheet.#onAddEntry,
      removeEntry: FeatSheet.#onRemoveEntry
    }
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
    const localize = (key) => game.i18n.localize(key);
    const selection = system.selection;
    const selectionParts = [
      selection.subcategory,
      selection.characteristic && localize(CHARACTERISTICS[selection.characteristic].label),
      selection.characteristic2 && `−1 ${localize(CHARACTERISTICS[selection.characteristic2].label)}`,
      selection.skill && localize(SKILLS[selection.skill].label),
      selection.specialty
    ].filter(Boolean);

    Object.assign(context, {
      item,
      system,
      editable: this.isEditable,
      isExaltedAsset: system.category === "exaltedAsset",
      // At most two hindrances, chosen at character creation (p. 179, spec 005 US1-5).
      isHindrance: system.category === "hindrance",
      hindranceLimitText: game.i18n.format("DTD.Feat.HindranceLimit", { max: HINDRANCE_LIMIT }),
      lockedPackHint: lockedPackHint(item),
      categoryOptions: options(FEAT_CATEGORIES, "DTD.Feat.Category"),
      groupOptions: { "": "—", ...options(ASSET_GROUPS, "DTD.Asset.Group") },
      automationOptions: options(FEAT_AUTOMATION, "DTD.Feat.Automation"),
      requireTypeOptions: options(FEAT_REQUIREMENT_TYPES, "DTD.Feat.RequireType"),
      categoryLabel: `DTD.Feat.Category.${system.category}`,
      groupLabel: system.group ? `DTD.Asset.Group.${system.group}` : "",
      automationLabel: `DTD.Feat.Automation.${system.automation}`,
      showRace: system.category === "racialFeat" || system.group === "paragonRacial" || Boolean(system.prerequisites.race),
      showDeity: system.group === "chosenMark" || Boolean(system.prerequisites.deity),
      groupOptionsValue: system.featGroup.options.join(","),
      groupOptionsText: system.featGroup.options.join(", "),
      requires: system.requires.map((req, index) => ({ ...req, index })),
      grants: system.grants.map((grant, index) => ({ ...grant, index })),
      requiresText: system.requires.map((req) => `${req.name}${req.type === "racePower" ? ` (${localize("DTD.Feat.RequireType.racePower")})` : ""}`).join(", "),
      grantsText: system.grants.map((grant) => (grant.subcategory
        ? `${grant.name} (${grant.subcategory})`
        : `${grant.name}${grant.choose ? ` (${localize("DTD.Feat.Choose")})` : ""}`)).join(", "),
      selectionText: selectionParts.join(" · "),
      enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, {
        relativeTo: item,
        secrets: item.isOwner
      })
    });
    return context;
  }

  /**
   * Indexed rows ("system.grants.0.name") arrive as objects keyed by index; turn them back into arrays.
   * @override
   */
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);
    for (const path of LIST_FIELDS) {
      const value = data.system?.[path];
      if (value && !Array.isArray(value)) {
        data.system[path] = Object.keys(value).sort((a, b) => a - b).map((key) => value[key]);
      }
    }
    return data;
  }

  /**
   * Add a blank row to the dependencies or grants.
   * @this {FeatSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onAddEntry(event, target) {
    const path = target.dataset.list;
    await this.document.update({ [`system.${path}`]: [...this.document.system[path], NEW_ENTRY[path]()] });
  }

  /**
   * Remove one row from the dependencies or grants.
   * @this {FeatSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onRemoveEntry(event, target) {
    const path = target.dataset.list;
    const index = Number(target.dataset.index);
    await this.document.update({ [`system.${path}`]: this.document.system[path].filter((_, i) => i !== index) });
  }
}
