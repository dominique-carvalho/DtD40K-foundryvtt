import { lockedPackHint } from "./item-sheet-helpers.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Cost of an entry as the book prints it: "2", "2*", "(-1)", "1/3", "X"; "—" for actions and Masteries.
 * @param {{cost: number|null, perPoint: boolean, variableCost: number[]}} entry
 */
export function costLabel(entry) {
  if (entry.variableCost?.length) return entry.variableCost.includes(0) ? "X" : entry.variableCost.join("/");
  if (entry.cost === null || entry.cost === undefined) return "—";
  const star = entry.perPoint ? "*" : "";
  return entry.cost < 0 ? `(${entry.cost})${star}` : `${entry.cost}${star}`;
}

/**
 * Sword School / Gun Kata item sheet (spec 010, FR-001): key skill, weapon group and the entries by mastery rank;
 * read-only for locked compendium entries. The entries are edited through the JSON sources.
 */
export class MartialSchoolSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "martial-school"],
    position: { width: 560, height: 640 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/item/martial-school-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.document;
    const system = item.system;
    const localize = (key) => game.i18n.localize(key);
    const ranks = [1, 2, 3, 4, 5].map((rank) => ({
      rank,
      label: localize(`DTD.Martial.Rank.${rank}`),
      entries: system.entries.filter((e) => e.rank === rank).map((e) => ({
        ...e,
        typeLabel: localize(`DTD.Martial.EntryType.${e.type}`),
        cost: costLabel(e),
        textOnly: Boolean(e.automation?.text)
      }))
    }));
    Object.assign(context, {
      item,
      system,
      editable: this.isEditable,
      lockedPackHint: lockedPackHint(item),
      kindLabel: localize(`DTD.Martial.Kind.${system.kind}`),
      skillLabel: localize(CONFIG.DTD.SKILLS[system.keySkill].label),
      ranks,
      enriched: {
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, { relativeTo: item, secrets: item.isOwner })
      }
    });
    return context;
  }
}
