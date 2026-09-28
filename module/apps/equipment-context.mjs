import { ADDICTION_LEVELS, WEAPON_QUALITIES } from "../config.mjs";
import { weaponPools } from "../documents/attack-service.mjs";
import { socketsOf } from "../documents/equipment-service.mjs";
import { startingSlots } from "../rules/acquisition.mjs";
import { ARMOR_LOCATIONS, armorValues, artifactRating } from "../rules/equipment.mjs";

/**
 * Template data for the Equipment tab (spec 007, US2–US5).
 */

const localize = (key) => game.i18n.localize(key);
const GEAR_GROUPS = ["gear", "cybernetic", "drug", "wonder", "hearthstone", "material"];

/**
 * Common row data of an inventory item.
 * @param {Item} item
 */
function row(item) {
  const system = item.system;
  const rating = system.material ? artifactRating(system.rarity, { primitive: item.type === "armor" && system.primitive }) : null;
  return {
    id: item.id,
    name: item.name,
    img: item.img,
    quantity: system.quantity,
    equipped: system.equipped,
    craftsmanship: system.craftsmanship !== "common" ? localize(`DTD.Craftsmanship.${system.craftsmanship}`) : "",
    material: system.material ? localize(`DTD.Material.${system.material}`) : "",
    rating: rating?.rating ?? null,
    starting: system.startingSlot ? localize(`DTD.Rarity.${system.startingSlot}`) : "",
    rarity: localize(`DTD.Rarity.${system.rarity}`)
  };
}

/**
 * Equipment tab data.
 * @param {Actor} actor
 */
export function prepareEquipmentContext(actor) {
  const items = actor.items.filter((item) => ["weapon", "armor", "gear"].includes(item.type)).sort((a, b) => a.name.localeCompare(b.name));
  const armor = actor.system.armor;

  const weapons = [
    { ...weaponPools(actor, null), id: "unarmed", name: localize("DTD.Attack.Unarmed"), unarmed: true, equipped: true, img: "icons/svg/combat.svg" },
    ...items.filter((item) => item.type === "weapon").map((item) => {
      const pools = weaponPools(actor, item);
      return {
        ...row(item),
        ...pools,
        skillLabel: localize(CONFIG.DTD.SKILLS[pools.skill].label),
        // Custom weapons waiting for the GM or being crafted cannot be used yet (spec 015).
        unfinished: item.system.custom?.status ? localize(`DTD.WeaponBuilder.Status.${item.system.custom.status}`) : "",
        canAttack: !item.system.custom?.status && (item.system.rof.single || item.system.rof.auto > 0 || item.system.weaponType === "melee" || item.system.weaponType === "thrown"),
        profile: `${item.system.damage.kept ? `${item.system.damage.rolled}k${item.system.damage.kept} ${item.system.damage.type}` : "—"} · Pen ${item.system.pen}`,
        qualities: item.system.qualities.map((q) => ({
          label: `${localize(WEAPON_QUALITIES[q.key].label)}${q.value !== null ? ` (${q.value})` : ""}`,
          hint: localize(WEAPON_QUALITIES[q.key].hint)
        }))
      };
    })
  ];

  const armors = items.filter((item) => item.type === "armor").map((item) => {
    const values = armorValues(item.system);
    return {
      ...row(item),
      type: localize(`DTD.ArmorType.${item.system.armorType}`),
      ap: values.ap,
      maxDex: values.maxDex ?? "—",
      piece: item.system.piece ? localize(`DTD.Location.${item.system.piece}`) : localize("DTD.Equipment.Suit"),
      inactive: Boolean(item.system.piece && item.system.suitOnly)
    };
  });

  const hosts = items.filter((item) => socketsOf(item) > 0);
  const stones = items.filter((item) => item.type === "gear" && item.system.category === "hearthstone");
  const gear = GEAR_GROUPS.map((category) => ({
    category,
    label: localize(`DTD.GearCategory.${category}`),
    items: items.filter((item) => item.type === "gear" && item.system.category === category).map((item) => ({
      ...row(item),
      effect: item.system.effectText,
      isDrug: category === "drug",
      active: item.system.active,
      addictivity: category === "drug" ? localize(`DTD.Addictivity.${item.system.addictivity}`) : "",
      installable: category !== "drug" && category !== "hearthstone" && category !== "material",
      sockets: socketsOf(item),
      isStone: category === "hearthstone",
      socketedIn: item.system.socketedIn ? actor.items.get(item.system.socketedIn)?.name ?? "" : "",
      hostOptions: category === "hearthstone"
        ? hosts.filter((host) => stones.filter((stone) => stone.system.socketedIn === host.id).length < socketsOf(host))
          .map((host) => ({ id: host.id, name: host.name }))
        : []
    }))
  })).filter((group) => group.items.length);

  // Inheritance picks add starting picks (spec 011).
  const slots = startingSlots(items, actor.system.backgrounds?.inheritancePicks ?? {});
  return {
    armor: {
      locations: ARMOR_LOCATIONS.map((key) => ({ key, label: localize(`DTD.Location.${key}`), ap: armor.locations[key] })),
      sdPenalty: armor.sdPenalty,
      penaltySource: armor.sources.penalty,
      maxDex: armor.maxDex,
      maxDexSource: armor.sources.maxDex
    },
    weapons,
    armors,
    gear,
    wealth: { ...actor.system.wealth, attemptsCount: actor.system.wealth.attempts.length },
    creation: actor.system.creation.active,
    slots: Object.keys(slots).map((key) => ({ key, label: localize(`DTD.Rarity.${key}`), ...slots[key] })),
    addictions: actor.system.addictions.map((entry) => ({
      ...entry, label: localize(`DTD.Addiction.${ADDICTION_LEVELS[entry.level]}`)
    })),
    addictionLevel: actor.system.addictionLevel ? localize(`DTD.Addiction.${ADDICTION_LEVELS[actor.system.addictionLevel]}`) : "",
    empty: !items.length
  };
}
