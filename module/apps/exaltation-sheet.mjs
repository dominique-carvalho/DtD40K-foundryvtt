import {
  CHARACTERISTICS, EXALTATION_FORMULAS, EXALTATION_POWER_AUTOMATION, POWER_STAT_CAPS, RESOURCE_ACTIONS, RESOURCE_HEALING
} from "../config.mjs";

import { lockedPackHint } from "./item-sheet-helpers.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/** Array fields of the exaltation edited as indexed form rows. */
const LIST_FIELDS = ["staticPowers", "powers", "elements", "resource.actions"];

/** Blank entries added by the "+" buttons of the sheet. */
const NEW_ENTRY = {
  staticPowers: () => ({ name: "", description: "", automation: "none" }),
  elements: () => ({ key: foundry.utils.randomID(8), name: "", characteristic: "str", hpMax: 0, description: "" }),
  "resource.actions": () => ({ type: "regain", amount: "1" })
};

/**
 * Localized options object for a `selectOptions` helper.
 * @param {string[]} keys
 * @param {string} prefix  i18n prefix
 */
const options = (keys, prefix) => Object.fromEntries(keys.map((key) => [key, `${prefix}.${key}`]));

/**
 * Label of a recovery action, e.g. "Regain 2" or "Recover 1 (Paradox)".
 * @param {{type: string, amount: string}} action
 * @param {string} debtName
 * @param {string} powerStatName
 * @returns {string}
 */
export function resourceActionLabel(action, debtName, powerStatName) {
  const amount = action.amount === "powerStat" ? powerStatName || game.i18n.localize("DTD.Exaltation.PowerStat") : action.amount;
  return game.i18n.format(`DTD.Exaltation.Action.${action.type}`, { amount, debt: debtName || game.i18n.localize("DTD.Exaltation.Debt") });
}

/**
 * Exaltation item sheet (spec 004, FR-005/FR-006).
 * Read-only for locked compendium entries; editable for owners otherwise.
 */
export class ExaltationSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "exaltation"],
    position: { width: 720, height: 820 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      addEntry: ExaltationSheet.#onAddEntry,
      removeEntry: ExaltationSheet.#onRemoveEntry
    }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/item/exaltation-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options_) {
    const context = await super._prepareContext(options_);
    const item = this.document;
    const system = item.system;
    const localize = (key) => game.i18n.localize(key);
    const enrich = (html) =>
      foundry.applications.ux.TextEditor.implementation.enrichHTML(html, { relativeTo: item, secrets: item.isOwner });
    const enrichAll = (list) => Promise.all(list.map(async (entry) => ({ ...entry, enriched: await enrich(entry.description) })));

    // A new exaltation shows five blank rank rows, so the form always submits ranks 1 to 5.
    const powers = system.powers.length
      ? system.powers
      : [1, 2, 3, 4, 5].map((rank) => ({ rank, name: "", description: "" }));

    Object.assign(context, {
      item,
      system,
      editable: this.isEditable,
      lockedPackHint: lockedPackHint(item),
      capOptions: options(POWER_STAT_CAPS, "DTD.Exaltation.Cap"),
      formulaOptions: options(EXALTATION_FORMULAS, "DTD.Exaltation.Formula"),
      healingOptions: options(RESOURCE_HEALING, "DTD.Exaltation.Healing"),
      automationOptions: options(EXALTATION_POWER_AUTOMATION, "DTD.Exaltation.Automation"),
      actionTypeOptions: Object.fromEntries(RESOURCE_ACTIONS.map((key) => [key, `DTD.Exaltation.ActionType.${key}`])),
      characteristicOptions: Object.fromEntries(Object.entries(CHARACTERISTICS).map(([key, def]) => [key, def.label])),
      isFixed: system.resource.formula === "fixed",
      actions: system.resource.actions.map((action, index) => ({
        ...action,
        index,
        label: resourceActionLabel(action, system.resource.debtName, system.powerStat.name)
      })),
      staticPowers: (await enrichAll(system.staticPowers)).map((power, index) => ({
        ...power,
        index,
        automationLabel: `DTD.Exaltation.Automation.${power.automation}`,
        automated: power.automation !== "none"
      })),
      powers: (await enrichAll(powers)).map((power, index) => ({ ...power, index })),
      elements: (await enrichAll(system.elements)).map((element, index) => ({
        ...element,
        index,
        characteristicLabel: CHARACTERISTICS[element.characteristic]?.label
      })),
      tellLevels: [1, 2, 3, 4].map((level) => ({
        points: ["1", "2–3", "4–5", "6+"][level - 1],
        label: `DTD.Exaltation.TellLevel.${level}`
      })),
      examples: system.lore.examples.join(","),
      examplesText: system.lore.examples.join(", "),
      enriched: {
        description: await enrich(system.description),
        fullText: await enrich(system.fullText),
        recovery: await enrich(system.resource.recovery),
        tell: await enrich(system.tell),
        origin: await enrich(system.lore.origin),
        appearance: await enrich(system.lore.appearance),
        society: await enrich(system.lore.society)
      }
    });
    context.formulaLabel = localize(`DTD.Exaltation.Formula.${system.resource.formula}`);
    return context;
  }

  /**
   * Indexed rows ("system.powers.0.name") arrive as objects keyed by index; turn them back into arrays.
   * @override
   */
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);
    for (const path of LIST_FIELDS) {
      const value = foundry.utils.getProperty(data.system ?? {}, path);
      if (value && !Array.isArray(value)) {
        foundry.utils.setProperty(data.system, path, Object.keys(value).sort((a, b) => a - b).map((key) => value[key]));
      }
    }
    return data;
  }

  /**
   * Add a blank row to one of the lists.
   * @this {ExaltationSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onAddEntry(event, target) {
    const path = target.dataset.list;
    const current = foundry.utils.getProperty(this.document.system, path) ?? [];
    await this.document.update({ [`system.${path}`]: [...current, NEW_ENTRY[path]()] });
  }

  /**
   * Remove one row from one of the lists.
   * @this {ExaltationSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onRemoveEntry(event, target) {
    const path = target.dataset.list;
    const index = Number(target.dataset.index);
    const current = foundry.utils.getProperty(this.document.system, path) ?? [];
    await this.document.update({ [`system.${path}`]: current.filter((_, i) => i !== index) });
  }
}
