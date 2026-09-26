import { CHARACTERISTICS, CLASS_COMPLETION, SKILLS } from "../config.mjs";
import { lockedPackHint } from "./item-sheet-helpers.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Localized options object for a `selectOptions` helper.
 * @param {string[]} keys
 * @param {string} prefix  i18n prefix
 */
const options = (keys, prefix) => Object.fromEntries(keys.map((key) => [key, `${prefix}.${key}`]));

/**
 * Class item sheet (spec 006, FR-003). Read-only for locked compendium entries; the book data is
 * edited through the JSON sources, so the editable form covers the fields a GM usually adjusts.
 */
export class ClassSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "class"],
    position: { width: 620, height: 700 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/item/class-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options_) {
    const context = await super._prepareContext(options_);
    const item = this.document;
    const system = item.system;
    const localize = (key) => game.i18n.localize(key);
    const enrich = (html) => foundry.applications.ux.TextEditor.implementation.enrichHTML(html, { relativeTo: item, secrets: item.isOwner });
    const skillName = (key) => localize(SKILLS[key].label);
    const featLabel = (feat) => (feat.subcategory ? `${feat.name} (${feat.subcategory})` : feat.name);

    // Group the list feats: mandatory, optional, and A-or-B choices.
    const choices = new Map();
    const mandatory = [];
    const optional = [];
    for (const feat of system.feats) {
      if (feat.orGroup) {
        const group = choices.get(feat.orGroup) ?? { mandatory: false, names: [] };
        group.mandatory ||= feat.mandatory;
        group.names.push(featLabel(feat));
        choices.set(feat.orGroup, group);
      } else {
        (feat.mandatory ? mandatory : optional).push(featLabel(feat));
      }
    }

    Object.assign(context, {
      item,
      system,
      editable: this.isEditable,
      lockedPackHint: lockedPackHint(item),
      automationOptions: options(CLASS_COMPLETION, "DTD.Class.Completion"),
      automationLabel: `DTD.Class.Completion.${system.completion.automation}`,
      prerequisites: [
        ...system.prerequisites.skills.map((req) => `${req.keys.map(skillName).join(` ${localize("DTD.Class.Or")} `)} ${req.value}`),
        ...system.prerequisites.feats,
        ...system.prerequisites.schools.map((school) => `${school.name} ${school.value}`),
        ...(system.prerequisites.text ? [system.prerequisites.text] : [])
      ],
      characteristicsText: system.anyCharacteristic
        ? localize("DTD.Class.AnyCharacteristic")
        : system.characteristics.map((key) => localize(CHARACTERISTICS[key].label)).join(", "),
      skillsText: system.skills.map(skillName).join(", "),
      mandatory,
      optional,
      choices: [...choices.values()].map((group) => ({ ...group, text: group.names.join(` ${localize("DTD.Class.Or")} `) })),
      schools: [
        { label: "DTD.Class.MagicSchools", text: system.magicSchools.join(", ") },
        { label: "DTD.Class.SwordSchools", text: system.swordSchools.join(", ") },
        { label: "DTD.Class.GunKata", text: system.gunKata.join(", ") }
      ].filter((entry) => entry.text),
      grantsText: system.completion.grants.map((grant) => (grant.subcategory ? `${grant.name} (${grant.subcategory})` : grant.name)).join(", "),
      enriched: {
        description: await enrich(system.description),
        completion: await enrich(system.completion.text)
      }
    });
    return context;
  }
}
