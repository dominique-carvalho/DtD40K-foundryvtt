import { VEHICLE_BUDGETS, VEHICLE_CATEGORIES, VEHICLE_CREW_ROLES } from "../config.mjs";
import { baseCost, componentCost, componentSlots, staticDefense } from "../rules/vehicle.mjs";
import { startChase } from "../documents/chase-service.mjs";
import {
  addComponent, assignWeapon, controlTest, crewOf, disembark, embark, fire, juryRig, move, newScene, punchIt, ram,
  repair, rollOutOfControl, setCrew, switchDrive, vehicleCritical
} from "../documents/vehicle-service.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const TEMPLATE_ROOT = "systems/dtd40k/templates/actor/vehicle";
const TAB_IDS = ["summary", "components", "crew", "combat"];
const localize = (key) => game.i18n.localize(key);

/**
 * Vehicle sheet (spec 013, US2/US3): stats, budget, VP and slots with warnings; components and mounted weapons by drop;
 * crew by dropping actors; the Combat tab with Momentum, Static Defense, reach, the vehicle actions and its state.
 */
export class VehicleSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "actor", "vehicle"],
    position: { width: 720, height: 760 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      editImage: VehicleSheet.#onEditImage,
      openItem: VehicleSheet.#onOpenItem,
      deleteItem: VehicleSheet.#onDeleteItem,
      quantity: VehicleSheet.#onQuantity,
      switchDrive: VehicleSheet.#onSwitchDrive,
      removeCrew: VehicleSheet.#onRemoveCrew,
      openCrew: VehicleSheet.#onOpenCrew,
      vehicleMove: VehicleSheet.#onMove,
      vehiclePunchIt: VehicleSheet.#onPunchIt,
      vehicleFire: VehicleSheet.#onFire,
      vehicleBarrage: VehicleSheet.#onBarrage,
      vehicleControl: VehicleSheet.#onControl,
      vehicleOutOfControl: VehicleSheet.#onOutOfControl,
      vehicleRam: VehicleSheet.#onRam,
      vehicleJuryRig: VehicleSheet.#onJuryRig,
      vehicleCritical: VehicleSheet.#onCritical,
      vehicleNewScene: VehicleSheet.#onNewScene,
      vehicleRepair: VehicleSheet.#onRepair,
      vehicleChase: VehicleSheet.#onChase,
      clearOffline: VehicleSheet.#onClearOffline
    }
  };

  /** @override */
  static TABS = {
    primary: { tabs: TAB_IDS.map((id) => ({ id })), initial: "summary", labelPrefix: "DTD.Vehicle.Tab" }
  };

  /** @override */
  static PARTS = {
    header: { template: `${TEMPLATE_ROOT}/header.hbs` },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    summary: { template: `${TEMPLATE_ROOT}/summary.hbs`, scrollable: [""] },
    components: { template: `${TEMPLATE_ROOT}/components.hbs`, scrollable: [""] },
    crew: { template: `${TEMPLATE_ROOT}/crew.hbs`, scrollable: [""] },
    combat: { template: `${TEMPLATE_ROOT}/combat.hbs`, scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const system = actor.system;
    const state = system.state;
    const crew = crewOf(actor);
    const offline = new Set(state.disabled);
    const components = actor.items.filter((i) => i.type === "vehicleComponent");
    const weapons = actor.items.filter((i) => i.type === "weapon");
    const round = game.combat?.started ? game.combat.round : 0;
    const gunnerUuid = (id) => crew.find((c) => c.weaponIds.includes(id))?.actorUuid ?? "";
    const pool = (d) => `${d.rolled}k${d.kept}${d.bonus ? `+${d.bonus}` : ""} ${d.type}`;
    Object.assign(context, {
      actor,
      system,
      editable: this.isEditable,
      isGM: game.user.isGM,
      budgetOptions: Object.fromEntries(Object.keys(VEHICLE_BUDGETS).map((k) => [k, `DTD.Vehicle.Budget.${k}`])),
      baseCost: baseCost(system),
      sdMoving: staticDefense({ size: system.size, speed: system.speed, maneuver: system.maneuver, momentum: 1 }),
      sdStopped: staticDefense({ size: system.size, speed: system.speed, maneuver: system.maneuver, momentum: 0 }),
      controlSkill: localize(CONFIG.DTD.SKILLS[system.drive.controlSkill]?.label ?? ""),
      printed: system.printed.vp || system.printed.slots,
      warnings: Object.entries(system.warnings).filter(([, on]) => on).map(([key]) => game.i18n.format(`DTD.Vehicle.Warn.${key}`, {
        cost: system.vp.cost, budget: system.vp.budget, used: system.slots.used, max: system.slots.max
      })),
      drives: components.filter((c) => c.system.category === "drivetrain").map((c) => ({
        id: c.id, name: c.name, rating: c.system.drive.rating, active: c.id === system.drive.id,
        skill: localize(CONFIG.DTD.SKILLS[c.system.drive.controlSkill]?.label ?? "")
      })),
      groups: VEHICLE_CATEGORIES.map((category) => ({
        category,
        label: localize(`DTD.Vehicle.Category.${category}`),
        rows: components.filter((c) => c.system.category === category).map((c) => ({
          id: c.id, name: c.name, quantity: c.system.quantity, cost: componentCost(c.system), slots: componentSlots(c.system),
          effect: c.system.effect, offline: offline.has(c.id), repeatable: !["drivetrain", "frame", "armor"].includes(category)
        }))
      })).filter((g) => g.rows.length),
      weapons: weapons.map((w) => ({
        id: w.id, name: w.name, damage: pool(w.system.damage), pen: w.system.pen,
        range: w.system.range.value ? `${w.system.range.value} m` : "—",
        rof: w.system.weaponType === "melee" ? "—" : `${w.system.rof.single ? "S" : "-"}/${w.system.rof.auto || "-"}`,
        qualities: w.system.qualities.map((q) => localize(CONFIG.DTD.WEAPON_QUALITIES[q.key]?.label ?? q.key) + (q.value ? ` (${q.value})` : "")).join(", "),
        slots: componentSlots({ slots: w.system.vehicle.slots, automation: w.system.vehicle }),
        cost: componentCost({ cost: w.system.vehicle.cost, automation: w.system.vehicle }),
        gunner: gunnerUuid(w.id), offline: offline.has(w.id)
      })),
      crew: crew.map((c) => ({
        uuid: c.actorUuid, name: c.actor?.name ?? localize("DTD.Vehicle.MissingActor"), img: c.actor?.img ?? "icons/svg/mystery-man.svg",
        role: c.role, roleOptions: VEHICLE_CREW_ROLES.map((r) => ({ value: r, label: localize(`DTD.Vehicle.Role.${r}`), selected: r === c.role })),
        weapons: c.weaponIds.map((id) => actor.items.get(id)?.name).filter(Boolean).join(", ")
      })),
      crewChoices: crew.filter((c) => c.actor).map((c) => ({ uuid: c.actorUuid, name: c.actor.name })),
      stateBadges: [
        state.destroyed && localize("DTD.Vehicle.Destroyed"),
        state.flipped && localize("DTD.Vehicle.Flipped"),
        state.stalled && localize("DTD.Vehicle.CritRow.stall"),
        round && state.lockedUntil >= round && localize("DTD.Vehicle.CritRow.lockup"),
        round && state.immobileUntil >= round && localize("DTD.Vehicle.CritRow.halt"),
        state.explodeRound && game.i18n.format("DTD.Vehicle.ExplodesIn", { round: state.explodeRound })
      ].filter(Boolean),
      offline: state.disabled.map((id) => actor.items.get(id)?.name ?? id),
      // Pushing an upturned vehicle back: Athletics at TN 2 × Size (p. 362).
      flipTn: 2 * system.size,
      enriched: {
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, { relativeTo: actor, secrets: actor.isOwner })
      }
    });
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    for (const select of this.element.querySelectorAll("select.crew-role")) {
      select.addEventListener("change", async (event) => {
        event.stopPropagation();
        const actor = foundry.utils.fromUuidSync(select.dataset.uuid);
        if (actor) await setCrew(this.document, actor, select.value);
      });
    }
    for (const select of this.element.querySelectorAll("select.weapon-gunner")) {
      select.addEventListener("change", async (event) => {
        event.stopPropagation();
        await assignWeapon(this.document, select.dataset.itemId, select.value);
      });
    }
  }

  /**
   * Components and weapons dropped on the sheet (FR-005); other items are refused.
   * @override
   */
  async _onDropItem(event, item) {
    if (!this.actor.isOwner) return null;
    if (item.parent?.uuid === this.actor.uuid) return super._onDropItem(event, item);
    if (item.type !== "vehicleComponent" && item.type !== "weapon") {
      ui.notifications.warn(localize("DTD.Vehicle.OnlyComponents"));
      return null;
    }
    return addComponent(this.actor, item.toObject());
  }

  /**
   * Actors dropped on the sheet join the crew (a Half Action in combat, p. 361).
   * @override
   */
  async _onDropActor(event, actor) {
    if (!this.actor.isOwner || actor.type === "vehicle") return null;
    const role = await foundry.applications.api.DialogV2.wait({
      window: { title: `${this.actor.name} — ${actor.name}` }, classes: ["dtd40k"], position: { width: 320 }, rejectClose: false,
      content: `<div class="form-group"><label>${localize("DTD.Vehicle.RoleLabel")}</label><select name="role">${VEHICLE_CREW_ROLES.map((r) => `<option value="${r}">${localize(`DTD.Vehicle.Role.${r}`)}</option>`).join("")}</select></div>`,
      buttons: [
        { action: "ok", label: "DTD.Vehicle.Embark", icon: "fa-solid fa-door-open", default: true, callback: (e, button) => button.form.elements.role.value },
        { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
      ]
    });
    if (!VEHICLE_CREW_ROLES.includes(role)) return null;
    const inCombat = game.combat?.started && game.combat.combatants.some((c) => c.actorId === actor.id);
    return inCombat ? embark(this.actor, actor, role) : setCrew(this.actor, actor, role);
  }

  /** Engineer for Jury Rig and repairs: the crew engineer, else the first crew member. */
  get engineer() {
    const crew = crewOf(this.document).filter((c) => c.actor);
    return (crew.find((c) => c.role === "engineer") ?? crew[0])?.actor ?? null;
  }

  /** @this {VehicleSheet} */
  static async #onEditImage() {
    if (!this.isEditable) return;
    new foundry.applications.apps.FilePicker.implementation({ type: "image", current: this.document.img, callback: (path) => this.document.update({ img: path }) }).browse();
  }

  /** @this {VehicleSheet} */
  static #onOpenItem(event, target) {
    this.document.items.get(target.closest("[data-item-id]")?.dataset.itemId)?.sheet.render(true);
  }

  /** @this {VehicleSheet} */
  static async #onDeleteItem(event, target) {
    const item = this.document.items.get(target.closest("[data-item-id]")?.dataset.itemId);
    if (item && this.isEditable) await item.delete();
  }

  /** @this {VehicleSheet} */
  static async #onQuantity(event, target) {
    const item = this.document.items.get(target.closest("[data-item-id]")?.dataset.itemId);
    if (!item || !this.isEditable) return;
    const quantity = item.system.quantity + Number(target.dataset.delta);
    if (quantity < 1) await item.delete();
    else await item.update({ "system.quantity": quantity });
  }

  /** @this {VehicleSheet} */
  static async #onSwitchDrive(event, target) {
    if (this.document.isOwner) await switchDrive(this.document, target.dataset.itemId);
  }

  /** @this {VehicleSheet} */
  static async #onRemoveCrew(event, target) {
    if (this.document.isOwner) await disembark(this.document, target.closest("[data-uuid]").dataset.uuid);
  }

  /** @this {VehicleSheet} */
  static #onOpenCrew(event, target) {
    foundry.utils.fromUuidSync(target.closest("[data-uuid]").dataset.uuid)?.sheet.render(true);
  }

  /** @this {VehicleSheet} */
  static async #onMove() {
    if (this.document.isOwner) await move(this.document);
  }

  /** @this {VehicleSheet} */
  static async #onPunchIt() {
    if (this.document.isOwner) await punchIt(this.document);
  }

  /** @this {VehicleSheet} */
  static async #onFire(event, target) {
    await fire(this.document, [target.closest("[data-item-id]").dataset.itemId]);
  }

  /** Barrage with the two ticked weapons. @this {VehicleSheet} */
  static async #onBarrage() {
    const ids = [...this.element.querySelectorAll("input.barrage-pick:checked")].map((input) => input.dataset.itemId);
    if (ids.length !== 2) {
      ui.notifications.warn(localize("DTD.Vehicle.PickTwo"));
      return;
    }
    await fire(this.document, ids);
  }

  /** @this {VehicleSheet} */
  static async #onControl() {
    if (this.document.isOwner) await controlTest(this.document);
  }

  /** @this {VehicleSheet} */
  static async #onOutOfControl() {
    if (this.document.isOwner) await rollOutOfControl(this.document);
  }

  /** @this {VehicleSheet} */
  static async #onRam() {
    await ram(this.document);
  }

  /** @this {VehicleSheet} */
  static async #onJuryRig() {
    const engineer = this.engineer;
    if (!engineer) ui.notifications.warn(localize("DTD.Vehicle.NoEngineer"));
    else await juryRig(this.document, engineer);
  }

  /** @this {VehicleSheet} */
  static async #onCritical() {
    if (game.user.isGM) await vehicleCritical(this.document, 1);
  }

  /** @this {VehicleSheet} */
  static async #onNewScene() {
    if (game.user.isGM) await newScene(this.document);
  }

  /** @this {VehicleSheet} */
  static async #onRepair() {
    await repair(this.document, this.engineer);
  }

  /** Chase with this vehicle and the targeted tokens. @this {VehicleSheet} */
  static async #onChase() {
    if (game.user.isGM) await startChase([this.document, ...[...game.user.targets].map((t) => t.actor)]);
  }

  /** GM: bring every offline system back. @this {VehicleSheet} */
  static async #onClearOffline() {
    if (game.user.isGM) await this.document.update({ "system.state.disabled": [] });
  }
}
