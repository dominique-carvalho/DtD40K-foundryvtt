import { DAMAGE_TYPES, MINION } from "../config.mjs";
import { allyBonus } from "../rules/minions.mjs";
import { alliesOf, attack, setAlly } from "../documents/minion-service.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Minion Squad sheet (spec 012, US3): Threat Rating, minions left, Damage Ratings, derived Static Defense, Speed and
 * range, the attacks and the hero the squad is teamed with.
 */
export class MinionSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "actor", "minion-squad"],
    position: { width: 520, height: 560 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      minionAttack: MinionSheet.#onAttack,
      editImage: MinionSheet.#onEditImage
    }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/actor/minion-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const system = actor.system;
    const heroes = game.actors.filter((a) => a.type === "character").map((a) => ({ uuid: a.uuid, name: a.name, selected: a.uuid === system.allyUuid }));
    const ally = heroes.find((h) => h.selected);
    const allyActor = ally ? await foundry.utils.fromUuid(ally.uuid) : null;
    Object.assign(context, {
      actor,
      system,
      editable: this.isEditable,
      maxCount: MINION.maxCount,
      damageTypes: Object.fromEntries([["", "—"], ...DAMAGE_TYPES.map((t) => [t, `DTD.DamageType.${t}`])]),
      heroes,
      kinds: ["melee", "ranged"].map((key) => ({ key, label: game.i18n.localize(`DTD.Minion.${key}`), ...system[key] })),
      allyBonus: allyActor ? allyBonus(alliesOf(allyActor), allyActor.system.characteristics.fel.value) : 0,
      enriched: {
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, { relativeTo: actor, secrets: actor.isOwner })
      }
    });
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    const select = this.element.querySelector(".minion-ally");
    select?.addEventListener("change", async (event) => {
      event.stopPropagation();
      const hero = select.value ? await foundry.utils.fromUuid(select.value) : null;
      await setAlly(this.document, hero);
    });
  }

  /**
   * Attack with the melee or ranged profile (FR-007).
   * @this {MinionSheet}
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static async #onAttack(event, target) {
    if (!this.document.isOwner) return;
    const attacking = Number(this.element.querySelector(".minion-attacking")?.value) || this.document.system.count;
    await attack(this.document, target.dataset.kind, { attacking });
  }

  /**
   * Change the portrait.
   * @this {MinionSheet}
   */
  static async #onEditImage() {
    if (!this.isEditable) return;
    const picker = new foundry.applications.apps.FilePicker.implementation({
      type: "image", current: this.document.img, callback: (path) => this.document.update({ img: path })
    });
    picker.browse();
  }
}
