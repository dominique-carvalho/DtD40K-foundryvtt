import { CHARACTERISTIC_GRID, CHARACTERISTICS, DERIVED_KEYS, GROUPS, SKILLS } from "../config.mjs";
import { buildDots, filterSkills, nextDotValue, sanitizeDerivedMods } from "../rules/sheet.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

const TEMPLATE_ROOT = "systems/dtd40k/templates/actor/parts";
const MODES = { EDIT: "edit", PLAY: "play" };

/**
 * Character sheet — hybrid layout (classic 3×3 grid + table header) with edit and play modes.
 * Spec: FR-022 to FR-030.
 */
export class CharacterSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "actor", "character"],
    position: { width: 860, height: 900 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      toggleMode: CharacterSheet.#onToggleMode,
      setDots: CharacterSheet.#onSetDots,
      addSpecialty: CharacterSheet.#onAddSpecialty,
      removeSpecialty: CharacterSheet.#onRemoveSpecialty
    }
  };

  /** @override */
  static PARTS = {
    header: { template: `${TEMPLATE_ROOT}/header.hbs` },
    characteristics: { template: `${TEMPLATE_ROOT}/characteristics.hbs` },
    skills: { template: `${TEMPLATE_ROOT}/skills.hbs` },
    footer: { template: `${TEMPLATE_ROOT}/footer.hbs` }
  };

  /** Partials used inside the parts; preloaded during init. */
  static PARTIALS = [`${TEMPLATE_ROOT}/specialties.hbs`, `${TEMPLATE_ROOT}/dots.hbs`];

  /** Skill search state, kept across re-renders. */
  #skillFilter = { query: "", onlyTrained: false };

  /**
   * Current sheet mode. Owners pick it (remembered per user and actor); others always play.
   * @type {"edit"|"play"}
   */
  get mode() {
    if (!this.document.isOwner) return MODES.PLAY;
    return game.user.getFlag("dtd40k", "sheetModes")?.[this.document.id] ?? MODES.EDIT;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const system = actor.system;
    const isEdit = this.mode === MODES.EDIT;

    const percent = (value, max) => (max > 0 ? Math.clamp(Math.round((value / max) * 100), 0, 100) : 0);

    const characteristicEntry = (key) => {
      const def = CHARACTERISTICS[key];
      const data = system.characteristics[key];
      return {
        key,
        label: def.label,
        abbr: def.abbr,
        value: data.value,
        dots: buildDots(data.value),
        specialties: data.specialties,
        valuePath: `system.characteristics.${key}.value`,
        specialtiesPath: `system.characteristics.${key}.specialties`
      };
    };

    const derivedValue = {
      staticDefense: system.derived.staticDefense,
      hpMax: system.hp.max,
      mentalDefense: system.derived.mentalDefense,
      resolveMax: system.resolve.max,
      speed: system.derived.speed,
      resilience: system.derived.resilience
    };

    Object.assign(context, {
      actor,
      system,
      isEdit,
      canToggle: actor.isOwner,
      hpPct: percent(system.hp.value, system.hp.max),
      resolvePct: percent(system.resolve.value, system.resolve.max),
      initiativeBonus: system.characteristics.dex.value + system.characteristics.cmp.value,
      gridColumns: CHARACTERISTIC_GRID.columns.map((key) => ({ key, label: `DTD.Sheet.Column.${key}` })),
      gridRows: CHARACTERISTIC_GRID.rows.map((row) => ({
        key: row,
        label: `DTD.Sheet.Row.${row}`,
        cells: CHARACTERISTIC_GRID.cells[row].map(characteristicEntry)
      })),
      skillColumns: ["mental", "physical", "social"]
        .filter((group) => GROUPS.includes(group))
        .map((group) => ({
          key: group,
          label: `DTD.Sheet.Column.${group}`,
          entries: Object.entries(SKILLS)
            .filter(([, def]) => def.group === group)
            .map(([key, def]) => {
              const data = system.skills[key];
              return {
                key,
                name: game.i18n.localize(def.label),
                advanced: def.advanced,
                charAbbr: CHARACTERISTICS[def.characteristic].abbr,
                value: data.value,
                dots: buildDots(data.value),
                specialties: data.specialties,
                valuePath: `system.skills.${key}.value`,
                specialtiesPath: `system.skills.${key}.specialties`
              };
            })
        })),
      derived: DERIVED_KEYS.map((key) => {
        const mod = system.derivedMods[key];
        return {
          key,
          label: `DTD.Derived.${key}`,
          value: derivedValue[key],
          bonus: mod.bonus,
          override: mod.override ?? "",
          overridden: mod.override !== null
        };
      })
    });
    return context;
  }

  /**
   * Sanitize derived adjustments before Foundry validates the whole submission:
   * a blank bonus must never make the entire update fail (FR-010, research R11).
   * @override
   */
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);
    if (data.system?.derivedMods) data.system.derivedMods = sanitizeDerivedMods(data.system.derivedMods);
    return data;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    this.element.classList.toggle("mode-edit", context.isEdit);
    this.element.classList.toggle("mode-play", !context.isEdit);
    this.#bindSpecialtyInputs();
    this.#bindSkillFilters();
  }

  /** Pressing Enter in a specialty field adds it instead of submitting the form. */
  #bindSpecialtyInputs() {
    for (const input of this.element.querySelectorAll(".specialty-input")) {
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        input.closest(".specialty-add")?.querySelector("[data-action='addSpecialty']")?.click();
      });
    }
  }

  /** Wire the play-mode skill search and "only trained" filter (client-side, no re-render). */
  #bindSkillFilters() {
    const search = this.element.querySelector(".skill-search");
    const trained = this.element.querySelector(".skill-only-trained");
    if (!search || !trained) return;
    search.value = this.#skillFilter.query;
    trained.checked = this.#skillFilter.onlyTrained;
    // Keep these controls out of the document form submission.
    for (const control of [search, trained]) control.addEventListener("change", (event) => event.stopPropagation());
    search.addEventListener("input", () => {
      this.#skillFilter.query = search.value;
      this.#applySkillFilter();
    });
    trained.addEventListener("change", () => {
      this.#skillFilter.onlyTrained = trained.checked;
      this.#applySkillFilter();
    });
    this.#applySkillFilter();
  }

  /** Hide skill rows that do not match the current filter. */
  #applySkillFilter() {
    const rows = [...this.element.querySelectorAll(".skill[data-key]")];
    const entries = rows.map((el) => ({ el, name: el.dataset.skillName, value: Number(el.dataset.value) }));
    const visible = new Set(filterSkills(entries, this.#skillFilter).map((entry) => entry.el));
    for (const { el } of entries) el.hidden = !visible.has(el);
  }

  /**
   * Switch between edit and play mode; remembered per user and actor.
   * @this {CharacterSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onToggleMode(event, target) {
    const mode = target.dataset.mode;
    if (!Object.values(MODES).includes(mode) || mode === this.mode) return;
    await game.user.setFlag("dtd40k", "sheetModes", { [this.document.id]: mode });
    this.render();
  }

  /**
   * Set a characteristic or skill value from a clicked dot (FR-025).
   * @this {CharacterSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onSetDots(event, target) {
    if (this.mode !== MODES.EDIT) return;
    const path = target.dataset.path;
    const current = Number(foundry.utils.getProperty(this.document, path)) || 0;
    const value = nextDotValue(current, Number(target.dataset.value));
    if (value !== current) await this.document.update({ [path]: value });
  }

  /**
   * Add the text typed next to the button to a specialties list.
   * @this {CharacterSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onAddSpecialty(event, target) {
    const input = target.closest(".specialty-add")?.querySelector(".specialty-input");
    const text = input?.value.trim();
    if (!text) return;
    const path = target.dataset.path;
    const current = foundry.utils.getProperty(this.document, path) ?? [];
    await this.document.update({ [path]: [...current, text] });
  }

  /**
   * Remove one specialty by index.
   * @this {CharacterSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onRemoveSpecialty(event, target) {
    const path = target.dataset.path;
    const index = Number(target.dataset.index);
    const current = foundry.utils.getProperty(this.document, path) ?? [];
    await this.document.update({ [path]: current.filter((_, i) => i !== index) });
  }
}
