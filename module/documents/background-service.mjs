import { BACKGROUNDS, CHARACTERISTICS } from "../config.mjs";
import { promptRollOptions } from "../apps/roll-dialog.mjs";
import { postTest, rng } from "../dice/roll-service.mjs";
import { backgroundCost, canRaise, inheritanceFits } from "../rules/backgrounds.mjs";
import { runTest } from "../rules/test.mjs";
import { recordEntry } from "./xp-service.mjs";

/**
 * Backgrounds on the character: raising them at creation with the free dots and XP, Artifact and Backing
 * instances, Inheritance picks and the Contacts roll (spec 011, US2; research R2–R4).
 * Contract: specs/011-backgrounds-alignment/contracts/foundry-api.md ("background-service").
 */

const localize = (key) => game.i18n.localize(key);
const LISTS = { artifact: "artifacts", backing: "backings" };

/**
 * Yes/no confirmation dialog.
 * @param {string} title
 * @param {string} content
 */
async function confirm(title, content) {
  return Boolean(await foundry.applications.api.DialogV2.confirm({ window: { title }, content, rejectClose: false }));
}

/** Total Artifact dots. */
const artifactDots = (actor) => actor._source.system.backgrounds.artifacts.reduce((sum, a) => sum + a.value, 0);

/**
 * Check a raise to `to`, price it and ask; returns the cost or null when refused.
 * @param {Actor} actor
 * @param {string} key
 * @param {number} to
 * @param {string} label
 */
async function price(actor, key, to, label) {
  const creation = actor.system.creation.active;
  const check = canRaise({ creation, isGM: game.user.isGM, to, artifactTotal: key === "artifact" ? artifactDots(actor) + 1 : 0 });
  if (!check.allowed) {
    const message = game.i18n.format(`DTD.Background.Refused.${check.reason}`, { label });
    ui.notifications.warn(message);
    if (check.reason === "atMax" || !game.user.isGM || !(await confirm(localize("DTD.XP.GMOverrideTitle"), `<p>${message}</p><p>${localize("DTD.XP.GMOverride")}</p>`))) return null;
    return 0;
  }
  // Outside creation only the GM adjusts, without XP (FR-007).
  if (!creation) return 0;
  const cost = backgroundCost({ to, dotsUsed: actor.system.backgrounds.dots });
  const available = actor.system.xp.totals.available;
  if (cost > available) {
    ui.notifications.warn(game.i18n.format("DTD.XP.Error.notEnough", { cost, available }));
    return null;
  }
  if (cost && !(await confirm(localize("DTD.XP.Buy"), `<p>${game.i18n.format("DTD.XP.BuyConfirm", { label, cost, available })}</p>`))) return null;
  return cost;
}

/**
 * Raise a Background by one dot (FR-006): Wealth is the spec 007 value; `id` picks an Artifact or Backing instance.
 * @param {Actor} actor
 * @param {string} key
 * @param {{id?: string}} [options]
 * @returns {Promise<boolean>}
 */
export async function raiseBackground(actor, key, { id = "" } = {}) {
  if (!actor.isOwner || !BACKGROUNDS[key]) return false;
  const source = actor._source.system;
  let from;
  let path;
  let name = localize(BACKGROUNDS[key].label);
  if (LISTS[key]) {
    const list = source.backgrounds[LISTS[key]];
    const instance = list.find((i) => i.id === id);
    if (!instance) return false;
    from = instance.value;
    name = `${name} (${instance.name})`;
  } else if (key === "wealth") {
    from = source.wealth.value;
    path = "system.wealth.value";
  } else {
    from = source.backgrounds[key].value;
    path = `system.backgrounds.${key}.value`;
  }
  const to = from + 1;
  const cost = await price(actor, key, to, name);
  if (cost === null) return false;
  if (path) await actor.update({ [path]: to });
  else {
    const list = foundry.utils.deepClone(source.backgrounds[LISTS[key]]).map((i) => (i.id === id ? { ...i, value: to } : i));
    await actor.update({ [`system.backgrounds.${LISTS[key]}`]: list });
  }
  await recordEntry(actor, { kind: "background", key: LISTS[key] ? `${key}:${id}` : key, label: `${name} ${from} → ${to}`, from, to, cost });
  return true;
}

/**
 * A new Artifact or Backing instance with one dot (a purchase like any other).
 * @param {Actor} actor
 * @param {"artifact"|"backing"} key
 * @param {string} name
 * @returns {Promise<boolean>}
 */
export async function addInstance(actor, key, name) {
  if (!actor.isOwner || !LISTS[key] || !name?.trim()) return false;
  const label = `${localize(BACKGROUNDS[key].label)} (${name.trim()})`;
  const cost = await price(actor, key, 1, label);
  if (cost === null) return false;
  const id = foundry.utils.randomID();
  const list = [...actor._source.system.backgrounds[LISTS[key]], { id, name: name.trim(), value: 1 }];
  await actor.update({ [`system.backgrounds.${LISTS[key]}`]: list });
  await recordEntry(actor, { kind: "background", key: `${key}:${id}`, label: `${label} 0 → 1`, from: 0, to: 1, cost });
  return true;
}

/**
 * Undo of an instance purchase (called by the XP log): back to the previous rating, or removed at 0.
 * @param {Actor} actor
 * @param {string} ref  "artifact:<id>" | "backing:<id>"
 * @param {number} from
 */
export async function restoreInstance(actor, ref, from) {
  const [key, id] = ref.split(":");
  const listKey = LISTS[key];
  if (!listKey) return;
  const list = foundry.utils.deepClone(actor._source.system.backgrounds[listKey]);
  const next = from <= 0 ? list.filter((i) => i.id !== id) : list.map((i) => (i.id === id ? { ...i, value: from } : i));
  await actor.update({ [`system.backgrounds.${listKey}`]: next });
}

/**
 * Save the Inheritance picks if they fit the rating (FR-009); the GM may allow more.
 * @param {Actor} actor
 * @param {Record<string, number>} picks
 * @returns {Promise<boolean>}
 */
export async function setInheritancePicks(actor, picks) {
  if (!actor.isOwner) return false;
  const clean = Object.fromEntries(Object.entries(picks).map(([k, v]) => [k, Math.max(0, Math.floor(Number(v) || 0))]));
  if (!inheritanceFits(actor.system.backgrounds.inheritance.value, clean)) {
    const message = localize("DTD.Background.InheritanceOver");
    ui.notifications.warn(message);
    if (!game.user.isGM || !(await confirm(localize("DTD.XP.GMOverrideTitle"), `<p>${message}</p><p>${localize("DTD.XP.GMOverride")}</p>`))) return false;
  }
  await actor.update({ "system.backgrounds.inheritancePicks": clean });
  return true;
}

/**
 * Contacts roll (FR-010, p. 281): (Contacts + Charisma or Fellowship) k characteristic, with the roll dialog.
 * @param {Actor} actor
 * @param {"cha"|"fel"} characteristic
 * @returns {Promise<ChatMessage|null>}
 */
export async function rollContacts(actor, characteristic = "cha") {
  const contacts = actor.system.backgrounds.contacts.value;
  const value = actor.system.characteristics[characteristic].value;
  const options = await promptRollOptions({ actor, characteristicKey: characteristic, tn: 15 });
  if (!options) return null;
  const testResult = runTest({ base: { rolled: contacts + value, kept: value }, tn: options.tn, specialty: options.specialty, rng, ...actor.withRollModifiers(options.modifiers) });
  const label = `${localize(BACKGROUNDS.contacts.label)} + ${localize(CHARACTERISTICS[characteristic].label)}`;
  return postTest({ actor, label, testResult, rollMode: options.rollMode });
}
