import { buildWeapon } from "../rules/weapon-creation.mjs";

/**
 * Custom weapons (spec 015; research R2, R5, R6): create or rebuild a 007 weapon from a build, approval by the GM and
 * crafting (materials by the Wealth test, then Crafts, both at the TN of the weapon's rarity).
 * Contract: specs/015-weapon-crafting/contracts/foundry-api.md ("weapon-craft-service").
 */

const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
/** Warnings that break the book's rules; the rest (rate of fire replaced) only inform. */
const BLOCKING = ["incompatible", "duplicate", "tooMany"];

/**
 * System data of a weapon made from a build.
 * @param {object} build  { family, template, type, damageType, mods }
 * @returns {{system: object, result: object}|null}  null when the build breaks the rules
 */
function systemOf(build) {
  const result = buildWeapon(build);
  const blocking = result.warnings.filter((w) => BLOCKING.includes(w));
  if (blocking.length) {
    ui.notifications.warn(blocking.map((w) => localize(`DTD.WeaponBuilder.Warn.${w}`)).join(" "));
    return null;
  }
  const summary = `<p>${format("DTD.WeaponBuilder.Summary", {
    template: localize(`DTD.WeaponBuilder.Template.${build.template}`), type: localize(`DTD.WeaponBuilder.Type.${build.family}.${build.type}`),
    mods: build.mods.length ? build.mods.join(", ") : "—", cost: result.cost
  })}</p>`;
  return {
    result,
    system: {
      ...result.system,
      description: summary,
      source: { book: "DtD 7.7a", page: 516 },
      custom: { build: { ...build, mods: [...build.mods] }, notes: result.notes }
    }
  };
}

/**
 * Create a custom weapon (FR-003/FR-006): in the world for the GM, or on an actor's sheet — pending until the GM
 * approves when a player made it.
 * @param {object} build
 * @param {{actor?: Actor|null, name: string}} options
 * @returns {Promise<Item|null>}
 */
export async function createCustomWeapon(build, { actor = null, name }) {
  const made = systemOf(build);
  if (!made) return null;
  const status = game.user.isGM ? "" : "pending";
  const data = {
    name: name || localize("DTD.WeaponBuilder.DefaultName"), type: "weapon",
    img: made.result.system.weaponType === "melee" ? "icons/svg/sword.svg" : "icons/svg/target.svg",
    system: { ...made.system, custom: { ...made.system.custom, status } }
  };
  const item = actor ? (await actor.createEmbeddedDocuments("Item", [data]))[0] : await Item.create(data);
  if (status === "pending") ui.notifications.info(format("DTD.WeaponBuilder.Pending", { name: item.name }));
  return item;
}

/**
 * Rebuild an existing custom weapon with a new build; its approval state is kept.
 * @param {Item} item
 * @param {object} build
 * @param {string} [name]
 */
export async function updateCustomWeapon(item, build, name) {
  const made = systemOf(build);
  if (!made) return null;
  return item.update({ name: name || item.name, system: { ...made.system, custom: { ...made.system.custom, status: item.system.custom.status } } });
}

/**
 * The GM approves a player's weapon: ready at once, or to be crafted (FR-007).
 * @param {Item} item
 * @param {{craft: boolean}} options
 */
export async function approveWeapon(item, { craft }) {
  if (!game.user.isGM) return;
  await item.update({ "system.custom.status": craft ? "crafting" : "", "system.custom.crafting": { materials: false, crafted: false, attempts: 0 } });
}

/**
 * Crafting, step 1 (p. 519): the materials come from a Wealth test at the TN of the weapon's rarity (the acquisition
 * rules of spec 007: effective Wealth, attempts, Liquid Wealth), without adding an item.
 * @param {Item} item  an owned weapon being crafted
 */
export async function gatherMaterials(item) {
  const actor = item.actor;
  if (!actor?.isOwner || item.system.custom.status !== "crafting" || item.system.custom.crafting.materials) return null;
  const { wealthTest } = await import("./acquisition-service.mjs");
  const outcome = await wealthTest(actor, { rarity: item.system.rarity, key: `craft:${item.id}`, label: format("DTD.WeaponBuilder.Materials", { name: item.name }) });
  await item.update({
    "system.custom.crafting.materials": Boolean(outcome?.success),
    "system.custom.crafting.attempts": item.system.custom.crafting.attempts + 1
  });
  return outcome;
}

/**
 * Crafting, step 2: Crafts at the same TN; with the materials in hand, a success finishes the weapon.
 * @param {Item} item
 */
export async function craftWeapon(item) {
  const actor = item.actor;
  const c = item.system.custom;
  if (!actor?.isOwner || c.status !== "crafting") return null;
  if (!c.crafting.materials) {
    ui.notifications.warn(localize("DTD.WeaponBuilder.NeedMaterials"));
    return null;
  }
  const tn = CONFIG.DTD.RARITIES[item.system.rarity]?.tn ?? 10;
  const message = await actor.rollSkill("crafts", { fastForward: true, tn, label: format("DTD.WeaponBuilder.Craft", { name: item.name }) });
  const outcome = message?.getFlag("dtd40k", "test")?.outcome;
  const update = { "system.custom.crafting.attempts": c.crafting.attempts + 1 };
  if (outcome?.success) Object.assign(update, { "system.custom.crafting.crafted": true, "system.custom.status": "" });
  await item.update(update);
  if (outcome?.success) ui.notifications.info(format("DTD.WeaponBuilder.Crafted", { name: item.name }));
  return outcome;
}

/** A weapon that cannot be used yet: waiting for the GM or being crafted. */
export const isUnfinished = (item) => ["pending", "crafting"].includes(item?.system?.custom?.status);
