import { reloadStep, spendRounds } from "../rules/ammo.mjs";

/**
 * Ammunition (spec 019): rounds checked and spent by attacks, launcher ammunition, Reload with the weapon's time and its
 * progress, jams and Overheats, Clear Jam. Contract: specs/019-ammunition/contracts/foundry-api.md.
 */

const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);

/**
 * Warn about a refusal; the GM may allow it anyway (constitution IV).
 * @param {string} message
 * @returns {Promise<boolean>}  true when the GM allows it
 */
async function refuseUnlessGM(message) {
  ui.notifications.warn(message);
  if (!game.user.isGM) return false;
  return Boolean(await foundry.applications.api.DialogV2.confirm({
    window: { title: localize("DTD.Ammo.Title") },
    content: `<p>${message}</p><p>${localize("DTD.Ammo.GMOverride")}</p>`,
    rejectClose: false
  }));
}

/**
 * Whether a weapon can fire (FR-003, FR-008): not jammed, rounds in the clip. The GM may allow it.
 * @param {Item} item
 * @returns {Promise<boolean>}
 */
export async function checkAmmo(item) {
  const ammo = item.system.ammo;
  if (ammo.jammed) return refuseUnlessGM(format("DTD.Ammo.Jammed", { weapon: item.name }));
  if (ammo.current <= 0) return refuseUnlessGM(format("DTD.Ammo.Empty", { weapon: item.name }));
  return true;
}

/**
 * Spend the rounds of an attack (FR-002, FR-003): 1 for a single shot, the full-auto ROF for a burst (or what is left).
 * An attack the GM allowed on an empty clip spends nothing and keeps the weapon's ROF.
 * @param {Item} item
 * @param {"single"|"auto"} mode
 * @returns {Promise<{spent: number, left: number, effectiveRof: number}>}
 */
export async function spendAmmo(item, mode) {
  const rof = item.system.rof?.auto ?? 0;
  const result = spendRounds({ current: item.system.ammo.current, mode, rof });
  if (!result.allowed) return { spent: 0, left: 0, effectiveRof: rof };
  await item.update({ "system.ammo.loaded": result.left });
  return result;
}

/**
 * A launcher spends the grenade or missile it fired (FR-004); the item stays at 0 so the damage roll can still read it.
 * @param {Actor} actor
 * @param {string} ammoId
 */
export async function spendLauncherAmmo(actor, ammoId) {
  const ammo = actor.items.get(ammoId);
  if (ammo) await ammo.update({ "system.quantity": Math.max(0, (ammo.system.quantity ?? 1) - 1) });
}

/**
 * After a jam (FR-008): the weapon is jammed until cleared; an overheating weapon is also empty (p. 320).
 * @param {Item} item
 * @param {{overheats: boolean}} options
 */
export async function afterJam(item, { overheats }) {
  await item.update({ "system.ammo.jammed": true, ...(overheats ? { "system.ammo.loaded": 0 } : {}) });
}

/**
 * Clear Jam succeeded (p. 435): the weapon works again, with an empty clip.
 * @param {Item} item
 */
export async function clearJam(item) {
  await item.update({ "system.ammo.jammed": false, "system.ammo.loaded": 0, "system.ammo.progress": 0 });
}

/**
 * The weapon a Reload or Clear Jam applies to: the chosen one, else the first equipped weapon that counts rounds
 * (jammed first for Clear Jam).
 * @param {Actor} actor
 * @param {string} [itemId]
 * @param {{jammed?: boolean}} [options]
 */
export function ammoWeapon(actor, itemId, { jammed = false } = {}) {
  if (itemId) return actor.items.get(itemId) ?? null;
  const weapons = actor.items.filter((item) => item.type === "weapon" && item.system.equipped && item.system.ammo?.tracked);
  return (jammed ? weapons.find((item) => item.system.ammo.jammed) : null) ?? weapons[0] ?? null;
}

/**
 * Check a Reload before the action is spent (FR-005, FR-007): the weapon reloads and has a spare clip.
 * @param {Item|null} item
 * @returns {{type: string, actions: number}|null}  the Reload value, or null when refused
 */
export function reloadCheck(item) {
  if (!item?.system.ammo?.tracked) {
    ui.notifications.warn(localize("DTD.Ammo.NoWeapon"));
    return null;
  }
  const ammo = item.system.ammo;
  const step = reloadStep({ progress: ammo.progress, actions: ammo.reloadInfo.actions, spare: ammo.spare });
  if (!step.allowed) {
    ui.notifications.warn(format(`DTD.Ammo.Refused.${step.reason}`, { weapon: item.name }));
    return null;
  }
  return ammo.reloadInfo;
}

/**
 * One Reload action done (FR-005, FR-007): progress, or a full clip for a spare one (the rounds left are lost).
 * @param {Actor} actor
 * @param {Item} item
 */
export async function reloadWeapon(actor, item) {
  const ammo = item.system.ammo;
  const step = reloadStep({ progress: ammo.progress, actions: ammo.reloadInfo.actions, spare: ammo.spare });
  if (!step.allowed) return;
  const text = step.done
    ? format("DTD.Ammo.Reloaded", { weapon: item.name, clip: item.system.clip, spare: ammo.spare - 1 })
    : format("DTD.Ammo.Progress", { weapon: item.name, done: step.progress, total: ammo.reloadInfo.actions });
  await item.update(step.done
    ? { "system.ammo.loaded": item.system.clip, "system.ammo.spare": ammo.spare - 1, "system.ammo.progress": 0 }
    : { "system.ammo.progress": step.progress });
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><i class="fa-solid fa-rotate" inert></i> ${text}</p>` });
}

/**
 * Any action but a free one or a reaction breaks a reload under way (FR-006, p. 424).
 * @param {Actor} actor
 * @param {{except?: string}} [options]  the weapon being reloaded
 */
export async function resetReloadProgress(actor, { except = "" } = {}) {
  const updates = actor.items.filter((item) => item.type === "weapon" && item.id !== except && item.system.ammo?.progress > 0)
    .map((item) => ({ _id: item.id, "system.ammo.progress": 0 }));
  if (updates.length && actor.isOwner) await actor.updateEmbeddedDocuments("Item", updates);
}
