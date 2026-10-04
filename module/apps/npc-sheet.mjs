import { CharacterSheet } from "./character-sheet.mjs";
import { prepareNpcContext } from "./npc-context.mjs";
import { fearCard } from "../documents/npc-service.mjs";
import { useAbility } from "../documents/ability-service.mjs";
import { adjustNpcResource, switchForm } from "../documents/form-service.mjs";

const TEMPLATE_ROOT = "systems/dtd40k/templates/actor/parts";
const NPC_TABS = ["main", "combat", "magic", "npc"];

/** New entries of the editable lists (spec 022, FR-018). */
const BLANK = {
  traits: () => ({ key: "darkSight", value: "" }),
  abilities: () => ({ name: game.i18n.localize("DTD.Npc.NewAbility"), effect: "", kind: "text" }),
  forms: () => ({ id: foundry.utils.randomID(8), name: game.i18n.localize("DTD.Npc.NewForm"), kind: "shift", action: "full" })
};

/**
 * NPC sheet (spec 012, research R1): the character sheet with the stat block of the book — characteristics and
 * skills, the combat tab (actions, weapons, conditions), magic for Casters and the Antagonist tab (traits,
 * abilities, feats, gear). Class, race, exaltation, XP and martial schools are for characters only.
 * Spec 022: abilities, forms and the Resource Stat are used from the Antagonist tab and edited there in Edit mode.
 */
export class NpcSheet extends CharacterSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["npc"],
    actions: {
      npcFear: NpcSheet.#onFear,
      npcAbility: NpcSheet.#onAbility,
      npcForm: NpcSheet.#onForm,
      npcResource: NpcSheet.#onResource,
      npcAdd: NpcSheet.#onAdd,
      npcRemove: NpcSheet.#onRemove
    }
  };

  /** @override */
  static TABS = {
    primary: {
      tabs: NPC_TABS.map((id) => ({ id })),
      initial: "main",
      labelPrefix: "DTD.Sheet.Tab"
    }
  };

  /** @override */
  static PARTS = {
    header: { template: `${TEMPLATE_ROOT}/npc-header.hbs` },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    main: { template: `${TEMPLATE_ROOT}/main.hbs` },
    combat: { template: `${TEMPLATE_ROOT}/combat.hbs` },
    magic: { template: `${TEMPLATE_ROOT}/magic.hbs` },
    npc: { template: `${TEMPLATE_ROOT}/npc.hbs` },
    footer: { template: `${TEMPLATE_ROOT}/footer.hbs` }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.npcTab = await prepareNpcContext(this.document, { isEdit: context.isEdit });
    // NPCs have no Advance mode: the book values are edited directly.
    context.isAdvance = false;
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    for (const control of this.element.querySelectorAll(".npc-edit")) {
      control.addEventListener("change", (event) => {
        event.stopPropagation();
        this.#editList(control);
      });
    }
  }

  /**
   * Write one edited field of a list (traits, abilities, feats, forms) back to the stored array.
   * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} control
   */
  async #editList(control) {
    const { list, index, field } = control.dataset;
    const path = `system.npc.${list}`;
    if (field === "_csv") {
      await this.document.update({ [path]: control.value.split(",").map((s) => s.trim()).filter(Boolean) });
      return;
    }
    const items = foundry.utils.deepClone(foundry.utils.getProperty(this.document._source, path));
    const entry = items[Number(index)];
    if (!entry) return;
    let value = control.type === "number" ? (control.value === "" ? null : Number(control.value)) : control.value;
    if (value === null && !control.dataset.nullable) value = 0;
    if (field === "_traits") {
      entry.traits = String(value).split(";").map((s) => s.trim()).filter(Boolean).map((s) => {
        const [key, val = ""] = s.split("=").map((x) => x.trim());
        return { key, value: val };
      }).filter((t) => CONFIG.DTD.NPC_TRAITS[t.key]);
    } else if (field === "_abilities") {
      entry.abilities = String(value).split(",").map((s) => s.trim()).filter(Boolean);
    } else if (field === "_armorAp") {
      entry.armor = value === null ? [] : [{ name: entry.name, ap: value, locations: ["all"] }];
    } else {
      foundry.utils.setProperty(entry, field, value);
    }
    await this.document.update({ [path]: items });
  }

  /**
   * Post the Fear Test card for the heroes (spec 012, FR-004).
   * @this {NpcSheet}
   */
  static async #onFear() {
    if (game.user.isGM) await fearCard(this.document);
  }

  /**
   * Use a special ability (spec 022, US3).
   * @this {NpcSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onAbility(event, target) {
    await useAbility(this.document, Number(target.dataset.index));
  }

  /**
   * Take an alternate form, choose a variant or go back to the base form (spec 022, US5).
   * @this {NpcSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onForm(event, target) {
    await switchForm(this.document, target.dataset.formId ?? "");
  }

  /**
   * Spend or regain one point of the Resource Stat.
   * @this {NpcSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onResource(event, target) {
    await adjustNpcResource(this.document, Number(target.dataset.delta) || 0);
  }

  /**
   * Add an entry to an editable list.
   * @this {NpcSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onAdd(event, target) {
    const list = target.dataset.list;
    if (!BLANK[list] || !this.document.isOwner) return;
    const path = `system.npc.${list}`;
    await this.document.update({ [path]: [...foundry.utils.getProperty(this.document._source, path), BLANK[list]()] });
  }

  /**
   * Remove an entry of an editable list.
   * @this {NpcSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onRemove(event, target) {
    const { list, index } = target.dataset;
    if (!this.document.isOwner) return;
    const path = `system.npc.${list}`;
    const items = foundry.utils.getProperty(this.document._source, path).filter((_, i) => i !== Number(index));
    const update = { [path]: items };
    // Removing the active form goes back to the base form.
    if (list === "forms" && !items.some((f) => f.id === this.document._source.system.npc.activeForm)) update["system.npc.activeForm"] = "";
    await this.document.update(update);
  }
}
