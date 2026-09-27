import { MAGIC_SCHOOLS, SPELL_ACTIONS, SPELL_KEYWORDS } from "../config.mjs";
import { lockedPackHint } from "./item-sheet-helpers.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/** Localized options object for a `selectOptions` helper. */
const options = (keys, prefix) => Object.fromEntries(keys.map((key) => [key, `${prefix}.${key}`]));

/**
 * Spell item sheet (spec 009, FR-004): the stat block with keyword hints; read-only for locked compendium entries.
 * The book data is edited through the JSON sources; the form covers the fields a GM usually adjusts.
 */
export class SpellSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "spell"],
    position: { width: 520, height: 600 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/item/spell-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options_) {
    const context = await super._prepareContext(options_);
    const item = this.document;
    const system = item.system;
    const localize = (key) => game.i18n.localize(key);
    const school = MAGIC_SCHOOLS[system.school];
    const d = system.damage;
    const damage = d.kept || d.perLevelKept
      ? `${d.rolled}k${d.kept} ${d.type}${d.perLevelRolled || d.perLevelKept ? ` + ${d.perLevelRolled}k${d.perLevelKept} ${localize("DTD.Magic.PerLevel")}` : ""}`
      : system.damageText;
    const tn = system.tn.special === "none" ? "—" : system.tn.special === "mentalDefense" ? localize("DTD.Magic.TnMentalDefense") : system.tn.value;
    Object.assign(context, {
      item,
      system,
      editable: this.isEditable,
      lockedPackHint: lockedPackHint(item),
      schoolLabel: localize(school.label),
      test: `${localize(school.label)} + ${localize(CONFIG.DTD.CHARACTERISTICS[school.characteristic].label)}`,
      tn,
      actionLabel: localize(`DTD.Magic.Action.${system.action}`),
      keywords: system.keywords.map((key) => ({ label: localize(`DTD.Magic.Keyword.${key}.label`), hint: localize(`DTD.Magic.Keyword.${key}.hint`) })),
      damage,
      save: system.save ? `Arcana + ${localize(CONFIG.DTD.CHARACTERISTICS[system.save].label)}` : "",
      schoolOptions: Object.fromEntries(Object.entries(MAGIC_SCHOOLS).map(([key, def]) => [key, def.label])),
      actionOptions: options(SPELL_ACTIONS, "DTD.Magic.Action"),
      keywordChoices: SPELL_KEYWORDS.map((key) => ({ key, label: localize(`DTD.Magic.Keyword.${key}.label`), checked: system.keywords.includes(key) })),
      enriched: {
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, { relativeTo: item, secrets: item.isOwner })
      }
    });
    return context;
  }
}
