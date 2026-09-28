import {
  ADDICTIVITY, ARMOR_PIECES, ARMOR_TYPES, CRAFTSMANSHIP, DAMAGE_TYPES, GEAR_CATEGORIES, MATERIALS, RARITIES,
  WEAPON_QUALITIES, WEAPON_TYPES
} from "../config.mjs";
import { acquire } from "../documents/acquisition-service.mjs";
import { rarityStep } from "../rules/acquisition.mjs";
import { artifactRating } from "../rules/equipment.mjs";
import { lockedPackHint } from "./item-sheet-helpers.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Localized options object for a `selectOptions` helper.
 * @param {string[]} keys
 * @param {string} prefix  i18n prefix
 */
const options = (keys, prefix) => Object.fromEntries(keys.map((key) => [key, `${prefix}.${key}`]));

/** "Blast (4), Reliable" ⇄ [{ key: "blast", value: 4 }, { key: "reliable", value: null }]. */
const qualityText = (qualities) => qualities.map((q) => {
  const label = game.i18n.localize(WEAPON_QUALITIES[q.key]?.label ?? q.key);
  return q.value === null || q.value === undefined ? label : `${label} (${q.value})`;
}).join(", ");

/**
 * Parse the qualities text of the weapon form; unknown names are dropped with a warning.
 * @param {string} text
 * @returns {{key: string, value: number|null}[]}
 */
function parseQualities(text) {
  const byLabel = Object.fromEntries(Object.entries(WEAPON_QUALITIES).map(([key, def]) => [game.i18n.localize(def.label).toLowerCase(), key]));
  const result = [];
  for (const part of String(text ?? "").split(",").map((entry) => entry.trim()).filter(Boolean)) {
    const [, name, value] = part.match(/^(.*?)\s*(?:\((\d+)\))?$/);
    const key = byLabel[name.toLowerCase()] ?? (name in WEAPON_QUALITIES ? name : null);
    if (!key) {
      ui.notifications.warn(game.i18n.format("DTD.Equipment.UnknownQuality", { name }));
      continue;
    }
    result.push({ key, value: value === undefined ? null : Number(value) });
  }
  return result;
}

/**
 * Weapon, armor and gear item sheet (spec 007, FR-006). Read-only for locked compendium entries.
 * One template for the three subtypes; the Acquire button opens the Wealth Test for the owning or the
 * user's character (FR-021).
 */
export class EquipmentSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["dtd40k", "sheet", "item", "equipment"],
    position: { width: 560, height: 640 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: { acquire: EquipmentSheet.#onAcquire }
  };

  /** @override */
  static PARTS = {
    body: { template: "systems/dtd40k/templates/item/equipment-sheet.hbs", scrollable: [""] }
  };

  /** Character that would acquire this item: its owner, or the user's character. */
  get buyer() {
    return this.document.actor ?? game.user.character ?? null;
  }

  /** @override */
  async _prepareContext(options_) {
    const context = await super._prepareContext(options_);
    const item = this.document;
    const system = item.system;
    const isWeapon = item.type === "weapon";
    const isArmor = item.type === "armor";
    const isGear = item.type === "gear";
    const artifactKind = isWeapon || isArmor || (isGear && system.category === "cybernetic");
    const rating = system.material ? artifactRating(system.rarity, { primitive: isArmor && system.primitive }) : null;

    Object.assign(context, {
      item,
      system,
      editable: this.isEditable,
      lockedPackHint: lockedPackHint(item),
      isWeapon,
      isArmor,
      isGear,
      isDrug: isGear && system.category === "drug",
      canHaveMaterial: artifactKind,
      typeLabel: `TYPES.Item.${item.type}`,
      rarityOptions: Object.fromEntries(Object.entries(RARITIES).map(([key, def]) => [key, def.label])),
      craftsmanshipOptions: options(Object.keys(CRAFTSMANSHIP), "DTD.Craftsmanship"),
      materialOptions: { "": "DTD.Material.none", ...options(Object.keys(MATERIALS), "DTD.Material") },
      weaponTypeOptions: options(WEAPON_TYPES, "DTD.WeaponType"),
      damageTypeOptions: { "": "—", ...Object.fromEntries(DAMAGE_TYPES.map((key) => [key, `DTD.DamageType.${key}`])) },
      armorTypeOptions: options(ARMOR_TYPES, "DTD.ArmorType"),
      vehicleScaleOptions: { "": "DTD.Vehicle.PersonalScale", Vhcl: "DTD.Vehicle.ScaleVhcl", Hybrid: "DTD.Vehicle.ScaleHybrid" },
      pieceOptions: { "": "DTD.Equipment.Suit", ...options(ARMOR_PIECES, "DTD.Location") },
      categoryOptions: options(GEAR_CATEGORIES, "DTD.GearCategory"),
      addictivityOptions: options(Object.keys(ADDICTIVITY), "DTD.Addictivity"),
      qualitiesText: isWeapon ? qualityText(system.qualities) : "",
      qualities: isWeapon
        ? system.qualities.map((q) => ({
          label: qualityText([q]),
          hint: game.i18n.localize(WEAPON_QUALITIES[q.key]?.hint ?? "")
        }))
        : [],
      proficienciesText: isWeapon ? system.proficiencies.join(` ${game.i18n.localize("DTD.Class.Or")} `) : "",
      rating,
      // A single armor piece is one rarity step cheaper (p. 332).
      pieceRarity: isArmor && !system.suitOnly ? `DTD.Rarity.${rarityStep(system.rarity, -1)}` : "",
      canAcquire: Boolean(this.buyer?.isOwner),
      buyerName: this.buyer?.name ?? "",
      enriched: {
        description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, {
          relativeTo: item, secrets: item.isOwner
        })
      }
    });
    return context;
  }

  /** @override */
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);
    if ("qualitiesText" in data) {
      data.system ??= {};
      data.system.qualities = parseQualities(data.qualitiesText);
      delete data.qualitiesText;
    }
    return data;
  }

  /**
   * Open the Wealth Test for this item.
   * @this {EquipmentSheet}
   */
  static async #onAcquire() {
    const buyer = this.buyer;
    if (buyer?.isOwner) await acquire(buyer, this.document);
  }
}
