import { CONSOLE_TYPES, CUSTOMIZATION, OFFICER_POSTS, SHIP_DEPARTMENTS } from "../config.mjs";
import { SHIP_ACTIONS, WARP_VOYAGE, weaponProfile } from "../rules/ship.mjs";
import {
  addComponent, addToHangar, assignOfficer, fieldRepair, newScene, officerActor, officerKept, portService,
  removeFromHangar, resetShield, setNonUniversal, setUpgrade
} from "../documents/ship-service.mjs";
import { critLabel, fire, rollCrit, shipAction, shipCombatant, shipTurn } from "../documents/ship-combat-service.mjs";
import { bombard, startVoyage } from "../documents/warp-service.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const TEMPLATE_ROOT = "systems/dtd40k/templates/actor/ship";
const TAB_IDS = ["summary", "components", "officers", "combat", "travel"];
const localize = (key) => game.i18n.localize(key);

/**
 * Ship sheet (spec 014, US2–US4): stats, Build Points, slots and warnings, customization of a custom hull; components
 * and officers by drop; the Combat tab with Crew, shield, Hull, the turn and the actions by department; the Travel tab
 * with the Warp, bombardment, fighters, hangar and repairs.
 */
export class ShipSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "actor", "ship"],
    position: { width: 760, height: 800 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      editImage: ShipSheet.#onEditImage,
      openItem: ShipSheet.#onOpenItem,
      deleteItem: ShipSheet.#onDeleteItem,
      quantity: ShipSheet.#onQuantity,
      upgrade: ShipSheet.#onUpgrade,
      clearOfficer: ShipSheet.#onClearOfficer,
      openActor: ShipSheet.#onOpenActor,
      shipAction: ShipSheet.#onShipAction,
      fireMode: ShipSheet.#onFire,
      rollCrit: ShipSheet.#onRollCrit,
      newScene: ShipSheet.#onNewScene,
      resetShield: ShipSheet.#onResetShield,
      warp: ShipSheet.#onWarp,
      bombard: ShipSheet.#onBombard,
      fieldRepair: ShipSheet.#onFieldRepair,
      port: ShipSheet.#onPort,
      removeVehicle: ShipSheet.#onRemoveVehicle,
      clearPicard: ShipSheet.#onClearPicard
    }
  };

  /** @override */
  static TABS = {
    primary: { tabs: TAB_IDS.map((id) => ({ id })), initial: "summary", labelPrefix: "DTD.Ship.Tab" }
  };

  /** @override */
  static PARTS = {
    header: { template: `${TEMPLATE_ROOT}/header.hbs` },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    summary: { template: `${TEMPLATE_ROOT}/summary.hbs`, scrollable: [""] },
    components: { template: `${TEMPLATE_ROOT}/components.hbs`, scrollable: [""] },
    officers: { template: `${TEMPLATE_ROOT}/officers.hbs`, scrollable: [""] },
    combat: { template: `${TEMPLATE_ROOT}/combat.hbs`, scrollable: [""] },
    travel: { template: `${TEMPLATE_ROOT}/travel.hbs`, scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const system = actor.system;
    const parts = actor.items.filter((i) => i.type === "shipComponent");
    const offline = new Set(system.state.disabled);
    const byCat = (c) => parts.filter((i) => i.system.category === c);
    const row = (i) => ({ id: i.id, name: i.name, cost: i.system.cost, quantity: i.system.quantity, effect: i.system.effect, offline: offline.has(i.id) });
    const combatant = shipCombatant(actor);
    const turn = combatant ? shipTurn(combatant) : null;
    const warn = (key) => game.i18n.format(`DTD.Ship.Warn.${key.replace(".", "_")}`, { spent: system.bp.spent, budget: system.bp.budget, printed: system.printed.cost });
    Object.assign(context, {
      actor, system, editable: this.isEditable, isGM: game.user.isGM,
      hullItem: parts.find((i) => ["hull", "customHull"].includes(i.system.category)) ?? null,
      hullClass: system.stats.hullClass ? localize(`DTD.Ship.HullClass.${system.stats.hullClass}`) : "",
      warnings: system.warnings.map(warn),
      budgetOptions: Object.fromEntries([0, 1, 2, 3, 4, 5].map((n) => [n, `${n}`])),
      consoleSlots: CONSOLE_TYPES.map((t) => ({ label: localize(`DTD.Ship.ConsoleType.${t}`), ...system.slots.consoles[t] })),
      custom: system.isCustom ? Object.entries(CUSTOMIZATION).map(([key, def]) => ({
        key, label: localize(`DTD.Ship.Upgrade.${key}`), count: system.custom.upgrades[key] ?? 0, cp: def.cp, limit: def.limit, total: def.total
      })) : null,
      split: system.isCustom ? ["arcana", "command", "engineering", "tactical"].map((t) => ({ key: t, label: localize(`DTD.Ship.ConsoleType.${t}`), value: system.custom.nonUniversal[t] })) : null,
      groups: [
        { label: localize("DTD.Ship.Category.shield"), rows: byCat("shield").map(row) },
        ...CONSOLE_TYPES.map((t) => ({ label: `${localize("DTD.Ship.Consoles")} — ${localize(`DTD.Ship.ConsoleType.${t}`)}`, rows: byCat("console").filter((i) => i.system.console.type === t).map(row), quantity: true })),
        { label: localize("DTD.Ship.Category.torpedoTube"), rows: byCat("torpedoTube").map((i) => ({ ...row(i), effect: localize(`DTD.Ship.Mount.${i.system.tube.mount}`) })) },
        { label: localize("DTD.Ship.Category.torpedo"), rows: byCat("torpedo").map(row), quantity: true }
      ].filter((g) => g.rows.length),
      weapons: byCat("weapon").map((i) => {
        const p = weaponProfile({ ...i.system.weapon, cost: i.system.cost }, i.system.weapon.typeKey);
        return { id: i.id, name: i.name, offline: offline.has(i.id), cost: p.cost, mount: localize(`DTD.Ship.Mount.${p.mount}`), type: localize(`DTD.Ship.WeaponType.${p.typeKey}`),
          text: `${p.dam.rolled}k${p.dam.kept}, Dis ${p.dis}, Acc ${p.acc}, Crit ${p.crit}, ${p.range} VU, ${localize(`DTD.Ship.Arc.${p.arc || "fixed"}`)}` };
      }),
      officers: byCat("officer").map((i) => {
        const def = OFFICER_POSTS[i.system.officer.post] ?? {};
        const holder = officerActor(i.system.officer.actorUuid);
        const dept = def.department;
        return {
          id: i.id, name: i.name, post: i.system.officer.post ? localize(`DTD.Ship.Post.${i.system.officer.post}`) : i.name,
          rank: def.rank ? localize(`DTD.Ship.Rank.${def.rank}`) : "", department: dept ? localize(`DTD.Ship.Department.${dept}`) : "—",
          holder: holder?.name ?? "", holderUuid: i.system.officer.actorUuid, npc: !holder,
          kept: dept ? officerKept(actor, dept).kept : null
        };
      }),
      departments: Object.keys(SHIP_DEPARTMENTS).map((dept) => ({
        key: dept, label: localize(`DTD.Ship.Department.${dept}`),
        used: turn ? (dept === "manoeuver" ? turn.manoeuver : turn.departments.includes(dept)) : false,
        officer: officerKept(actor, dept),
        actions: SHIP_ACTIONS.filter((a) => a.department === dept && a.timing !== "reaction").map((a) => ({ key: a.key, name: a.name, summary: a.summary, crew: a.crew }))
      })),
      turn,
      crits: system.state.crits.map((c) => ({ label: critLabel(actor, c), tn: c.tn })),
      offlineNames: system.state.disabled.map((id) => actor.items.get(id)?.name ?? id),
      layers: system.shield.layerCount ? system.shield.layers.map((l, n) => ({ n: n + 1, value: l.value, max: system.shield.max, disruption: l.disruption })) : null,
      round: system.state.round ?? {},
      distances: Object.entries(WARP_VOYAGE).map(([key, v]) => ({ key, label: `${v.distance} (TN ${v.tn})` })),
      hangar: system.hangar.map((uuid) => { const v = foundry.utils.fromUuidSync(uuid); return { uuid, name: v?.name ?? localize("DTD.Vehicle.MissingActor"), img: v?.img ?? CONFIG.DTD.ICONS.actor.vehicle }; }),
      fighterBay: parts.some((i) => i.system.automation?.key === "fighterBay"),
      enriched: {
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, { relativeTo: actor, secrets: actor.isOwner })
      }
    });
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    for (const input of this.element.querySelectorAll("input.nonuniversal-split")) {
      input.addEventListener("change", async (event) => {
        event.stopPropagation();
        await setNonUniversal(this.document, input.dataset.type, input.value);
      });
    }
  }

  /**
   * Ship components are installed; vehicles go to the hangar (FR-003, FR-015).
   * @override
   */
  async _onDropItem(event, item) {
    if (!this.actor.isOwner) return null;
    if (item.parent?.uuid === this.actor.uuid) return super._onDropItem(event, item);
    if (item.type !== "shipComponent") {
      ui.notifications.warn(localize("DTD.Ship.OnlyComponents"));
      return null;
    }
    return addComponent(this.actor, item.toObject());
  }

  /**
   * A vehicle joins the hangar; a character or NPC takes an officer post (the row it was dropped on, else a choice).
   * @override
   */
  async _onDropActor(event, actor) {
    if (!this.actor.isOwner) return null;
    if (actor.type === "vehicle") return addToHangar(this.actor, actor);
    if (!["character", "npc"].includes(actor.type)) return null;
    let itemId = event.target.closest?.("[data-officer-id]")?.dataset.officerId;
    if (!itemId) {
      const posts = this.actor.items.filter((i) => i.type === "shipComponent" && i.system.category === "officer");
      if (!posts.length) {
        ui.notifications.warn(localize("DTD.Ship.NoPosts"));
        return null;
      }
      itemId = await foundry.applications.api.DialogV2.wait({
        window: { title: `${this.actor.name} — ${actor.name}` }, classes: ["dtd40k"], rejectClose: false,
        content: `<div class="form-group"><label>${localize("DTD.Ship.PostLabel")}</label><select name="post">${posts.map((i) => `<option value="${i.id}">${i.name}</option>`).join("")}</select></div>`,
        buttons: [
          { action: "ok", label: "DTD.Ship.Assign", icon: "fa-solid fa-user-tie", default: true, callback: (e, button) => button.form.elements.post.value },
          { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
        ]
      });
      if (!itemId || itemId === "cancel") return null;
    }
    return assignOfficer(this.actor, itemId, actor);
  }

  /** @this {ShipSheet} */
  static async #onEditImage() {
    if (!this.isEditable) return;
    new foundry.applications.apps.FilePicker.implementation({ type: "image", current: this.document.img, callback: (path) => this.document.update({ img: path }) }).browse();
  }

  /** @this {ShipSheet} */
  static #onOpenItem(event, target) {
    this.document.items.get(target.closest("[data-item-id]")?.dataset.itemId)?.sheet.render(true);
  }

  /** @this {ShipSheet} */
  static async #onDeleteItem(event, target) {
    const item = this.document.items.get(target.closest("[data-item-id]")?.dataset.itemId);
    if (item && this.isEditable) await item.delete();
  }

  /** @this {ShipSheet} */
  static async #onQuantity(event, target) {
    const item = this.document.items.get(target.closest("[data-item-id]")?.dataset.itemId);
    if (!item || !this.isEditable) return;
    const step = item.system.category === "torpedo" ? 5 : 1;
    const quantity = item.system.quantity + step * Number(target.dataset.delta);
    if (quantity < 1) await item.delete();
    else await item.update({ "system.quantity": quantity });
  }

  /** @this {ShipSheet} */
  static async #onUpgrade(event, target) {
    if (this.isEditable) await setUpgrade(this.document, target.dataset.key, Number(target.dataset.delta));
  }

  /** @this {ShipSheet} */
  static async #onClearOfficer(event, target) {
    if (this.isEditable) await assignOfficer(this.document, target.closest("[data-officer-id]").dataset.officerId, null);
  }

  /** @this {ShipSheet} */
  static #onOpenActor(event, target) {
    foundry.utils.fromUuidSync(target.dataset.uuid)?.sheet.render(true);
  }

  /** @this {ShipSheet} */
  static async #onShipAction(event, target) {
    await shipAction(this.document, target.dataset.key);
  }

  /** @this {ShipSheet} */
  static async #onFire(event, target) {
    await fire(this.document, target.dataset.mode);
  }

  /** GM: roll the Crit Chart by hand. @this {ShipSheet} */
  static async #onRollCrit() {
    if (!game.user.isGM) return;
    const { postShipCard } = await import("../documents/ship-service.mjs");
    const lines = await rollCrit(this.document);
    await postShipCard(this.document, { title: `${localize("DTD.Ship.CritChart")} — ${this.document.name}`, lines });
  }

  /** @this {ShipSheet} */
  static async #onNewScene() {
    if (game.user.isGM) await newScene(this.document);
  }

  /** GM: refill the shield. @this {ShipSheet} */
  static async #onResetShield() {
    if (game.user.isGM) await resetShield(this.document);
  }

  /** @this {ShipSheet} */
  static async #onWarp() {
    const distance = this.element.querySelector("select.warp-distance")?.value;
    const relay = this.element.querySelector("input.warp-relay")?.checked;
    await startVoyage(this.document, { distance, relay });
  }

  /** @this {ShipSheet} */
  static async #onBombard() {
    await bombard(this.document);
  }

  /** @this {ShipSheet} */
  static async #onFieldRepair() {
    await fieldRepair(this.document);
  }

  /** @this {ShipSheet} */
  static async #onPort(event, target) {
    await portService(this.document, target.dataset.kind);
  }

  /** @this {ShipSheet} */
  static async #onRemoveVehicle(event, target) {
    await removeFromHangar(this.document, target.dataset.uuid);
  }

  /** GM: Picard Speech may be given again (new session). @this {ShipSheet} */
  static async #onClearPicard() {
    if (game.user.isGM) await this.document.update({ "system.state.round.picardUsed": false });
  }
}
