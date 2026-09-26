import { CHARACTERISTICS, GROUPS, RACE_POWER_AUTOMATION, SKILLS } from "../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/** Lore fields edited as tag lists. */
const LORE_LISTS = ["languages", "personality", "physical", "names"];

/**
 * Race item sheet (spec 002, FR-004/FR-005).
 * Read-only for locked compendium entries; editable for owners otherwise.
 */
export class RaceSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "race"],
    position: { width: 640, height: 760 },
    window: { resizable: true },
    form: { submitOnChange: true }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/item/race-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.document;
    const system = item.system;
    const localize = (key) => game.i18n.localize(key);
    const list = (entries, type) => new Intl.ListFormat(game.i18n.lang, { type }).format(entries);
    const characteristicName = (key) => localize(CHARACTERISTICS[key].label);
    const skillName = (key) => localize(SKILLS[key].label);
    const enrich = (html) =>
      foundry.applications.ux.TextEditor.implementation.enrichHTML(html, { relativeTo: item, secrets: item.isOwner });

    const characteristicSummary = system.characteristicBonus.any
      ? localize("DTD.Race.AnyCharacteristic")
      : `+1 ${list(system.characteristicBonus.options.map(characteristicName), "disjunction")}`;
    const skillParts = [];
    if (system.skillBonus.skills.length) {
      skillParts.push(`+1 ${list(system.skillBonus.skills.map(skillName), "conjunction")}`);
    }
    if (system.skillBonus.choose > 0) {
      skillParts.push(game.i18n.format("DTD.Race.ChooseN", { n: system.skillBonus.choose }));
    }

    Object.assign(context, {
      item,
      system,
      editable: this.isEditable,
      // GMs can unlock the compendium to edit its races (core "Toggle Edit Lock").
      lockedPackHint: item.pack && game.packs.get(item.pack)?.locked && game.user.isGM
        ? game.i18n.format("DTD.Race.LockedPackHint", { option: localize("COMPENDIUM.ToggleLocked.Option") })
        : "",
      characteristicOptions: Object.keys(CHARACTERISTICS).map((key) => ({
        key,
        label: characteristicName(key),
        selected: system.characteristicBonus.options.includes(key)
      })),
      skillGroups: GROUPS.map((group) => ({
        label: localize(`DTD.SkillGroup.${group}`),
        options: Object.entries(SKILLS)
          .filter(([, def]) => def.group === group)
          .map(([key]) => ({ key, label: skillName(key), selected: system.skillBonus.skills.includes(key) }))
      })),
      automationOptions: Object.fromEntries(RACE_POWER_AUTOMATION.map((key) => [key, `DTD.Race.Automation.${key}`])),
      automationLabel: `DTD.Race.Automation.${system.power.automation}`,
      summary: { characteristic: characteristicSummary, skills: skillParts.join("; ") || "—" },
      loreLists: LORE_LISTS.map((key) => ({
        key,
        label: `DTD.Race.${key.charAt(0).toUpperCase()}${key.slice(1)}`,
        value: system.lore[key].join(","),
        text: system.lore[key].join(", ")
      })),
      enriched: {
        description: await enrich(system.description),
        fullText: await enrich(system.fullText),
        power: await enrich(system.power.description)
      }
    });
    return context;
  }
}
