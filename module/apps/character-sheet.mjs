import { CHARACTERISTIC_GRID, CHARACTERISTICS, DERIVED_KEYS, GROUPS, SKILLS } from "../config.mjs";
import { applyRace, getRace, reconfigureRace, removeRace } from "../documents/race-service.mjs";
import { needsChoice } from "../rules/race.mjs";
import { buildDots, filterSkills, nextBaseValue, sanitizeDerivedMods } from "../rules/sheet.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

const TEMPLATE_ROOT = "systems/dtd40k/templates/actor/parts";
const MODES = { EDIT: "edit", PLAY: "play" };
const TAB_IDS = ["main", "traits"];

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
      removeSpecialty: CharacterSheet.#onRemoveSpecialty,
      openRace: CharacterSheet.#onOpenRace,
      reconfigureRace: CharacterSheet.#onReconfigureRace,
      removeRace: CharacterSheet.#onRemoveRace,
      spendRaceUse: CharacterSheet.#onSpendRaceUse,
      resetRaceUses: CharacterSheet.#onResetRaceUses,
      toggleRaceEffect: CharacterSheet.#onToggleRaceEffect,
      showRaceInfo: CharacterSheet.#onShowRaceInfo
    }
  };

  /** Main (characteristics and skills) and Traits (race) tabs — spec 002, FR-015a. */
  static TABS = {
    primary: {
      tabs: TAB_IDS.map((id) => ({ id })),
      initial: "main",
      labelPrefix: "DTD.Sheet.Tab"
    }
  };

  /** @override */
  static PARTS = {
    header: { template: `${TEMPLATE_ROOT}/header.hbs` },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    main: { template: `${TEMPLATE_ROOT}/main.hbs` },
    traits: { template: `${TEMPLATE_ROOT}/traits.hbs` },
    footer: { template: `${TEMPLATE_ROOT}/footer.hbs` }
  };

  /** Partials used inside the parts; preloaded during init. */
  static PARTIALS = [
    `${TEMPLATE_ROOT}/characteristics.hbs`,
    `${TEMPLATE_ROOT}/skills.hbs`,
    `${TEMPLATE_ROOT}/specialties.hbs`,
    `${TEMPLATE_ROOT}/dots.hbs`
  ];

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

  /**
   * Restore the last active tab, remembered per user and actor (FR-015a).
   * @override
   */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    if (!options.isFirstRender) return;
    const saved = game.user.getFlag("dtd40k", "sheetTabs")?.[this.document.id];
    if (TAB_IDS.includes(saved)) this.tabGroups.primary = saved;
  }

  /** @override */
  changeTab(tab, group, options = {}) {
    const previous = this.tabGroups[group];
    super.changeTab(tab, group, options);
    if (group === "primary" && tab !== previous && options.event) {
      game.user.setFlag("dtd40k", "sheetTabs", { [this.document.id]: tab });
    }
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const system = actor.system;
    const source = actor._source.system;
    const isEdit = this.mode === MODES.EDIT;
    const capped = system.capped ?? {};

    const percent = (value, max) => (max > 0 ? Math.clamp(Math.round((value / max) * 100), 0, 100) : 0);

    const characteristicEntry = (key) => {
      const def = CHARACTERISTICS[key];
      const data = system.characteristics[key];
      return {
        key,
        label: def.label,
        abbr: def.abbr,
        value: data.value,
        dots: buildDots(data.value, 6, source.characteristics[key].value),
        capped: capped[`characteristics.${key}`] ?? false,
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
      canEditRace: actor.isOwner,
      // Individual racial modifiers are switched on and off by the GM (FR-010).
      canToggleEffects: game.user.isGM,
      race: await this.#prepareRace(),
      // Inputs of fields that racial effects can change show the base value (research R3).
      base: {
        size: source.size,
        sizeChanged: source.size !== system.size,
        heroPointsMax: source.heroPoints.max,
        heroPointsMaxChanged: source.heroPoints.max !== system.heroPoints.max
      },
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
                dots: buildDots(data.value, 6, source.skills[key].value),
                capped: capped[`skills.${key}`] ?? false,
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
   * Race summary for the header and the Traits tab (spec 002).
   * @returns {Promise<object|null>}
   */
  async #prepareRace() {
    const race = getRace(this.document);
    if (!race) return null;
    const system = race.system;
    const localize = (key) => game.i18n.localize(key);
    const bonuses = [];
    if (system.choice.characteristic) bonuses.push(localize(CHARACTERISTICS[system.choice.characteristic].label));
    for (const key of [...system.skillBonus.skills, ...system.choice.skills]) bonuses.push(localize(SKILLS[key].label));

    const uses = system.power.automation === "usesPerScene" && system.power.uses.max !== undefined
      ? { ...system.power.uses, empty: system.power.uses.remaining <= 0 }
      : null;

    return {
      id: race.id,
      name: race.name,
      img: race.img,
      size: system.size,
      bonuses,
      needsChoice: needsChoice(system),
      effects: race.effects
        .filter((effect) => effect.getFlag("dtd40k", "racial"))
        .map((effect) => ({ id: effect.id, name: effect.name, active: !effect.disabled })),
      power: {
        name: system.power.name,
        automated: ["heroicHeritage", "shifty", "squatToughness"].includes(system.power.automation),
        uses,
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.power.description, {
          relativeTo: race,
          secrets: race.isOwner
        })
      }
    };
  }

  /**
   * Races dropped from elsewhere go through the race service (FR-009 to FR-011);
   * dragging the actor's own race only reorders it, as in core (research R6).
   * @override
   */
  async _onDropItem(event, item) {
    if (item.type === "race" && item.parent?.uuid !== this.actor.uuid) {
      if (!this.actor.isOwner) return null;
      return applyRace(this.actor, item);
    }
    return super._onDropItem(event, item);
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
    // The clicked dot becomes the final value; only the distributed (base) value is stored (spec 002, FR-014).
    const base = Number(foundry.utils.getProperty(this.document._source, path)) || 0;
    const final = Number(foundry.utils.getProperty(this.document, path)) || 0;
    const value = nextBaseValue({ base, final, clicked: Number(target.dataset.value) });
    if (value !== base) await this.document.update({ [path]: value });
  }

  /**
   * Open the race item sheet.
   * @this {CharacterSheet}
   */
  static #onOpenRace() {
    getRace(this.document)?.sheet.render(true);
  }

  /**
   * Re-open the racial choice (FR-013).
   * @this {CharacterSheet}
   */
  static async #onReconfigureRace() {
    if (this.document.isOwner) await reconfigureRace(this.document);
  }

  /**
   * Remove the race and its effects (FR-012).
   * @this {CharacterSheet}
   */
  static async #onRemoveRace() {
    if (this.document.isOwner) await removeRace(this.document);
  }

  /**
   * Spend one use of a per-scene racial power (FR-017).
   * @this {CharacterSheet}
   */
  static async #onSpendRaceUse() {
    const race = getRace(this.document);
    const uses = race?.system.power.uses;
    if (!this.document.isOwner || !uses || uses.remaining <= 0) return;
    await race.update({ "system.power.uses.spent": uses.spent + 1 });
  }

  /**
   * Enable or disable one racial modifier — GM only (FR-010).
   * @this {CharacterSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onToggleRaceEffect(event, target) {
    const effect = getRace(this.document)?.effects.get(target.dataset.effectId);
    if (!game.user.isGM || !effect) return;
    await effect.update({ disabled: !effect.disabled });
  }

  /**
   * Show the race description and lore in a popup (the "i" button of the Traits tab).
   * @this {CharacterSheet}
   */
  static async #onShowRaceInfo() {
    const race = getRace(this.document);
    if (!race) return;
    const system = race.system;
    const lists = ["languages", "personality", "physical", "names"]
      .filter((key) => system.lore[key].length)
      .map((key) => ({ label: `DTD.Race.${key.charAt(0).toUpperCase()}${key.slice(1)}`, text: system.lore[key].join(", ") }));
    const content = await foundry.applications.handlebars.renderTemplate("systems/dtd40k/templates/dialog/race-info.hbs", {
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, {
        relativeTo: race,
        secrets: race.isOwner
      }),
      lore: system.lore,
      lists,
      source: system.source
    });
    await foundry.applications.api.DialogV2.prompt({
      window: { title: race.name, icon: "fa-solid fa-circle-info" },
      classes: ["dtd40k", "race-info-dialog"],
      position: { width: 520 },
      content,
      ok: { label: game.i18n.localize("Close"), icon: "fa-solid fa-check" },
      rejectClose: false
    });
  }

  /**
   * New scene: restore every use of the racial power (FR-017).
   * @this {CharacterSheet}
   */
  static async #onResetRaceUses() {
    const race = getRace(this.document);
    if (this.document.isOwner && race) await race.update({ "system.power.uses.spent": 0 });
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
