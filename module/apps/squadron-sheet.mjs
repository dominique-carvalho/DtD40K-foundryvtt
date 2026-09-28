import { dock, squadronAttack } from "../documents/squadron-service.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Fighter squadron sheet (spec 014, US4): craft left, profile, the ship it came from, attack and docking.
 */
export class SquadronSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "actor", "squadron"],
    position: { width: 420, height: 380 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      squadronAttack: SquadronSheet.#onAttack,
      dock: SquadronSheet.#onDock,
      openShip: SquadronSheet.#onOpenShip
    }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/actor/squadron-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const ship = actor.system.shipUuid ? foundry.utils.fromUuidSync(actor.system.shipUuid) : null;
    Object.assign(context, { actor, system: actor.system, editable: this.isEditable, shipName: ship?.name ?? "" });
    return context;
  }

  /** @this {SquadronSheet} */
  static async #onAttack() {
    await squadronAttack(this.document);
  }

  /** @this {SquadronSheet} */
  static async #onDock() {
    await dock(this.document);
  }

  /** @this {SquadronSheet} */
  static #onOpenShip() {
    foundry.utils.fromUuidSync(this.document.system.shipUuid)?.sheet.render(true);
  }
}
