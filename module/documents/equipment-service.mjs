import { ADDICTIVITY } from "../config.mjs";
import { rarityStep, startingSlotFor, startingSlots } from "../rules/acquisition.mjs";
import { mechadendriteCheck } from "../rules/equipment.mjs";
import { gearInUse, grantFeats, releaseGrants } from "./feat-service.mjs";

/**
 * Inventory of a character: adding, equipping, doses and hearthstones (spec 007, US2 and US5).
 * Contract: specs/007-equipment/contracts/foundry-api.md ("equipment-service").
 */

const EQUIPMENT_TYPES = ["weapon", "armor", "gear"];
const localize = (key) => game.i18n.localize(key);

/**
 * Yes/no confirmation dialog.
 * @param {string} title  i18n key
 * @param {string} content
 */
async function confirm(title, content) {
  return Boolean(await foundry.applications.api.DialogV2.confirm({ window: { title: localize(title) }, content, rejectClose: false }));
}

/** Items of the same kind merge their quantity: same name, type, craftsmanship, material and piece. */
const sameStack = (a, data) => a.type === data.type && a.name === data.name
  && a.system.craftsmanship === data.system.craftsmanship && a.system.material === data.system.material
  && (a.system.piece ?? "") === (data.system.piece ?? "");

/**
 * Add an item to the inventory (FR-007); during character creation, ask if it is a starting pick and check
 * the picks left (FR-024, GM override).
 * @param {Actor} actor
 * @param {Item} item
 * @param {{starting?: boolean, overrides?: object}} [options]
 *   starting: false skips the question (acquired items); overrides: system fields of the new copy
 * @returns {Promise<Item|null>}
 */
export async function addEquipment(actor, item, { starting, overrides = {} } = {}) {
  if (actor.type !== "character" || !EQUIPMENT_TYPES.includes(item.type)) return null;
  const data = item.toObject();
  delete data._id;
  delete data.folder;
  Object.assign(data.system, { equipped: false, active: false, socketedIn: "", startingSlot: "", ...overrides });
  if (item.actor === actor) data.system.quantity = 1;

  let asStarting = starting;
  if (asStarting === undefined && actor.system.creation.active) {
    asStarting = await confirm("DTD.Equipment.StartingTitle", `<p>${game.i18n.format("DTD.Equipment.StartingAsk", { item: item.name })}</p>`);
  }
  if (asStarting) {
    const rarity = data.system.piece ? rarityStep(data.system.rarity, -1) : data.system.rarity;
    const slot = startingSlotFor(rarity, data.system.craftsmanship);
    const slots = startingSlots(actor.items.filter((entry) => EQUIPMENT_TYPES.includes(entry.type)));
    const free = slot && slots[slot].used < slots[slot].max;
    if (!free) {
      const message = slot ? game.i18n.format("DTD.Equipment.NoSlot", { slot: localize(`DTD.Rarity.${slot}`) }) : localize("DTD.Equipment.NotStartingRarity");
      ui.notifications.warn(message);
      if (!game.user.isGM || !(await confirm("DTD.Equipment.StartingTitle", `<p>${message}</p><p>${localize("DTD.Equipment.GMOverride")}</p>`))) return null;
    }
    data.system.startingSlot = slot ?? "";
  }

  const stack = !asStarting && actor.items.find((entry) => sameStack(entry, data) && !entry.system.startingSlot);
  if (stack) {
    await stack.update({ "system.quantity": stack.system.quantity + Math.max(1, data.system.quantity) });
    return stack;
  }
  const [created] = await actor.createEmbeddedDocuments("Item", [data]);
  return created ?? null;
}

/**
 * Equip, wear or install an item (FR-007, FR-027): mechadendrites above Constitution warn (GM override);
 * feats granted by the item follow its state.
 * @param {Actor} actor
 * @param {string} itemId
 */
export async function toggleEquipped(actor, itemId) {
  const item = actor.items.get(itemId);
  if (!item || !actor.isOwner) return;
  const equipping = !item.system.equipped;
  if (equipping && item.type === "gear" && item.system.mechadendrite) {
    const installed = actor.items.filter((entry) => entry.type === "gear" && entry.system.mechadendrite && entry.system.equipped).length + 1;
    const check = mechadendriteCheck({ installed, con: actor.system.characteristics.con.value });
    if (!check.ok) {
      const message = game.i18n.format("DTD.Equipment.TooManyMechadendrites", { max: check.max });
      ui.notifications.warn(message);
      if (!game.user.isGM || !(await confirm("DTD.Equipment.Install", `<p>${message}</p><p>${localize("DTD.Equipment.GMOverride")}</p>`))) return;
    }
  }
  await item.update({ "system.equipped": equipping });
  await syncGrants(actor, item);
  // Hearthstones set in this item turn on or off with it.
  for (const stone of actor.items.filter((entry) => entry.type === "gear" && entry.system.socketedIn === item.id)) await syncGrants(actor, stone);
}

/**
 * Feats granted by a gear item exist only while it is in use (Bionic Heart → Hardy; hearthstones).
 * @param {Actor} actor
 * @param {Item} item
 */
async function syncGrants(actor, item) {
  if (item.type !== "gear" || !item.system.grants.length) return;
  if (gearInUse(item)) await grantFeats(actor, item);
  else await releaseGrants(actor, item.id);
}

/**
 * Change the quantity (doses, grenades); 0 keeps the entry.
 * @param {Actor} actor
 * @param {string} itemId
 * @param {number} quantity
 */
export async function setQuantity(actor, itemId, quantity) {
  const item = actor.items.get(itemId);
  if (item && actor.isOwner) await item.update({ "system.quantity": Math.max(0, Math.trunc(Number(quantity) || 0)) });
}

/**
 * Remove an item after confirmation; hearthstones set in it come loose.
 * @param {Actor} actor
 * @param {string} itemId
 */
export async function removeEquipment(actor, itemId) {
  const item = actor.items.get(itemId);
  if (!item || !actor.isOwner) return;
  if (!(await confirm("DTD.Equipment.Remove", `<p>${game.i18n.format("DTD.Equipment.RemoveConfirm", { item: item.name })}</p>`))) return;
  const stones = actor.items.filter((entry) => entry.type === "gear" && entry.system.socketedIn === item.id);
  if (stones.length) await actor.updateEmbeddedDocuments("Item", stones.map((stone) => ({ _id: stone.id, "system.socketedIn": "" })));
  await item.delete();
}

/**
 * Take a dose of a drug (FR-025): one dose less, its effects on, and the Willpower Test against the
 * Addictivity; a failure raises the addiction (FR-026).
 * @param {Actor} actor
 * @param {string} itemId
 */
export async function useDose(actor, itemId) {
  const item = actor.items.get(itemId);
  if (!item || !actor.isOwner || item.system.category !== "drug") return;
  if (item.system.quantity < 1) {
    ui.notifications.warn(game.i18n.format("DTD.Equipment.NoDoses", { item: item.name }));
    return;
  }
  await item.update({ "system.quantity": item.system.quantity - 1, "system.active": true });
  const tn = ADDICTIVITY[item.system.addictivity] ?? 0;
  if (!tn) return;
  const message = await actor.rollCharacteristic("wil", {
    tn, label: game.i18n.format("DTD.Equipment.AddictionTest", { item: item.name })
  });
  const test = message?.getFlag("dtd40k", "test");
  if (test && test.outcome && !test.outcome.success) await raiseAddiction(actor, item.name);
}

/**
 * Raise the addiction to a drug one level, up to Major.
 * @param {Actor} actor
 * @param {string} name
 */
async function raiseAddiction(actor, name) {
  const list = foundry.utils.deepClone(actor._source.system.addictions);
  const entry = list.find((a) => a.name === name);
  if (entry) entry.level = Math.min(3, entry.level + 1);
  else list.push({ name, level: 1 });
  await actor.update({ "system.addictions": list });
  const level = list.find((a) => a.name === name).level;
  ui.notifications.warn(game.i18n.format("DTD.Equipment.Addicted", { item: name, level: localize(`DTD.Addiction.${CONFIG.DTD.ADDICTION_LEVELS[level]}`) }));
}

/**
 * End the effect of a drug (its duration is text).
 * @param {Actor} actor
 * @param {string} itemId
 */
export async function endDose(actor, itemId) {
  const item = actor.items.get(itemId);
  if (item && actor.isOwner) await item.update({ "system.active": false });
}

/**
 * Set the addiction level of a drug — GM only (FR-026).
 * @param {Actor} actor
 * @param {string} name
 * @param {number} level  0 removes it
 */
export async function setAddiction(actor, name, level) {
  if (!game.user.isGM) return;
  const list = foundry.utils.deepClone(actor._source.system.addictions).filter((a) => a.name !== name);
  if (level > 0) list.push({ name, level: Math.min(3, level) });
  await actor.update({ "system.addictions": list });
}

/**
 * Hearthstone settings of an item: 1 for a magical-material item, the Wonder's own number otherwise (p. 348, p. 352).
 * @param {Item} host
 */
export function socketsOf(host) {
  if (host.type === "gear" && host.system.category === "wonder") return host.system.sockets;
  return host.system.material ? 1 : 0;
}

/**
 * Set a hearthstone in an item of the character (FR-029): the item needs a free setting.
 * @param {Actor} actor
 * @param {string} stoneId
 * @param {string} hostId
 */
export async function socketHearthstone(actor, stoneId, hostId) {
  const stone = actor.items.get(stoneId);
  const host = actor.items.get(hostId);
  if (!stone || !host || !actor.isOwner) return;
  const used = actor.items.filter((entry) => entry.type === "gear" && entry.system.socketedIn === host.id).length;
  if (used >= socketsOf(host)) {
    ui.notifications.warn(game.i18n.format("DTD.Equipment.NoSocket", { item: host.name }));
    return;
  }
  await stone.update({ "system.socketedIn": host.id });
  await syncGrants(actor, stone);
}

/**
 * Take a hearthstone out of its setting.
 * @param {Actor} actor
 * @param {string} stoneId
 */
export async function unsocket(actor, stoneId) {
  const stone = actor.items.get(stoneId);
  if (!stone || !actor.isOwner) return;
  await stone.update({ "system.socketedIn": "" });
  await syncGrants(actor, stone);
}
