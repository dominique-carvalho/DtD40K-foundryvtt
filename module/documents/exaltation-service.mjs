import { CHARACTERISTICS } from "../config.mjs";
import { perfectionAsset } from "../rules/asset.mjs";
import {
  applyResourceAction, buildExaltationEffects, defaultSelection, needsSelection, spendCheck, statuesqueOptions,
  validateExaltationSelection
} from "../rules/exaltation.mjs";
import { nextDotValue } from "../rules/sheet.mjs";
import { addExaltedAsset, getExaltedAssets } from "./asset-service.mjs";
import { getRace } from "./race-service.mjs";

/**
 * Applying, changing and using a character's exaltation (spec 004, US3/US4).
 * Contract: specs/004-exaltation-compendium/contracts/foundry-api.md ("Serviços").
 */

const CHOICE_TEMPLATE = "systems/dtd40k/templates/dialog/exaltation-choice.hbs";
const ASSET_PACK = "dtd40k.exalted-assets";
const localize = (key) => game.i18n.localize(key);

/**
 * The exaltation item of an actor, if any.
 * @param {Actor} actor
 * @returns {Item|null}
 */
export function getExaltation(actor) {
  return actor.items.find((item) => item.type === "exaltation") ?? null;
}

/**
 * Marker of the current combat round, "<combatId>:<round>", or "none" out of combat (research R4).
 * @returns {string}
 */
export function currentCombatMarker() {
  const combat = game.combat;
  return combat?.started ? `${combat.id}:${combat.round}` : "none";
}

/**
 * Race data the exaltation rules read (bonus options and the player's racial choice).
 * @param {Actor} actor
 * @returns {object|null}
 */
const raceSystem = (actor) => getRace(actor)?.system ?? null;

/**
 * Whether the exaltation has an automated static power.
 * @param {{staticPowers: {automation: string}[]}} system
 * @param {string} automation
 */
const hasPower = (system, automation) => system.staticPowers.some((power) => power.automation === automation);

/**
 * Ask for the Statuesque characteristic and/or the Blood Quickening element.
 * Invalid submissions are reported and the dialog is shown again.
 * @param {{name: string, system: object}} exaltation
 * @param {object|null} race
 * @param {{statuesque: string, element: string}} [current]
 * @returns {Promise<{statuesque: string, element: string}|null>}  null if cancelled
 */
export async function promptExaltationSelection(exaltation, race, current = defaultSelection(exaltation.system, race)) {
  const system = exaltation.system;
  let selection = current;
  for (;;) {
    const content = await foundry.applications.handlebars.renderTemplate(CHOICE_TEMPLATE, {
      intro: game.i18n.format("DTD.Exaltation.ChooseIntro", { exaltation: exaltation.name }),
      statuesque: hasPower(system, "statuesque")
        ? statuesqueOptions(race).map((key) => ({
          key,
          label: localize(CHARACTERISTICS[key].label),
          selected: key === selection.statuesque
        }))
        : null,
      elements: hasPower(system, "bloodQuickening")
        ? system.elements.map((element) => ({
          ...element,
          characteristicLabel: localize(CHARACTERISTICS[element.characteristic].label),
          selected: element.key === selection.element
        }))
        : null
    });
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.format("DTD.Exaltation.ChooseTitle", { exaltation: exaltation.name }) },
      classes: ["dtd40k", "exaltation-choice-dialog"],
      position: { width: 520 },
      content,
      buttons: [
        {
          action: "confirm",
          label: localize("DTD.Exaltation.Confirm"),
          icon: "fa-solid fa-check",
          default: true,
          callback: (event, button) => ({
            statuesque: button.form.querySelector("input[name='statuesque']:checked")?.value ?? "",
            element: button.form.querySelector("input[name='element']:checked")?.value ?? ""
          })
        },
        { action: "cancel", label: localize("Cancel"), icon: "fa-solid fa-xmark" }
      ],
      rejectClose: false
    });
    if (!result || result === "cancel") return null;
    if (validateExaltationSelection(system, result, race).valid) return result;
    ui.notifications.warn(localize("DTD.Exaltation.InvalidChoice"));
    selection = result;
  }
}

/**
 * Apply an exaltation to a character, replacing any previous one (FR-010 to FR-011).
 * @param {Actor} actor
 * @param {Item} exaltationItem  dropped from a compendium, the sidebar or another actor
 * @returns {Promise<Item|null>}  the new embedded exaltation, or null if cancelled or refused
 */
export async function applyExaltation(actor, exaltationItem) {
  if (actor.type !== "character") {
    ui.notifications.warn(localize("DTD.Exaltation.NotCharacter"));
    return null;
  }

  const current = getExaltation(actor);
  if (current) {
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: localize("DTD.Exaltation.Replace") },
      content: `<p>${game.i18n.format("DTD.Exaltation.ReplaceConfirm", { old: current.name, exaltation: exaltationItem.name })}</p>`,
      rejectClose: false
    });
    if (!confirmed) return null;
  }

  const race = raceSystem(actor);
  const selection = needsSelection(exaltationItem.system, race)
    ? await promptExaltationSelection(exaltationItem, race)
    : defaultSelection(exaltationItem.system, race);
  if (!selection) return null;

  const data = exaltationItem.toObject();
  delete data._id;
  Object.assign(data.system, {
    selection,
    round: { spent: 0, marker: "none" },
    scene: { spent: 0 }
  });
  data.system.powerStat.value = 1;
  data.system.resource.spent = 0;
  data.system.pressure.spent = 0;
  data.effects = exaltedEffectData(data, selection, race);

  // Validate before touching the current exaltation, so a bad entry never leaves the character without one.
  try {
    new Item.implementation(data, { parent: actor }).validate({ strict: true });
  } catch (error) {
    console.error("dtd40k | Invalid exaltation data", error);
    ui.notifications.warn(localize("DTD.Exaltation.InvalidChoice"));
    return null;
  }

  await deleteExaltation(actor);
  const [created] = await actor.createEmbeddedDocuments("Item", [data]);
  if (!created) return null;
  // Destiny (p. 83): the two extra Hero Points are available right away.
  if (hasPower(created.system, "destiny")) {
    await actor.update({ "system.heroPoints.value": actor._source.system.heroPoints.value + 2 });
  }
  await syncPerfection(actor);
  return created;
}

/**
 * Re-open the exaltation's choices and swap its effects (FR-013).
 * @param {Actor} actor
 * @returns {Promise<Item|null>}
 */
export async function reconfigureExaltation(actor) {
  const exaltation = getExaltation(actor);
  const race = raceSystem(actor);
  if (!exaltation || !needsSelection(exaltation.system, race)) return exaltation;
  const selection = await promptExaltationSelection(exaltation, race, exaltation.system.selection);
  if (!selection) return null;

  const ids = exaltation.effects.filter((effect) => effect.getFlag("dtd40k", "exalted")).map((effect) => effect.id);
  await exaltation.deleteEmbeddedDocuments("ActiveEffect", ids);
  await exaltation.createEmbeddedDocuments("ActiveEffect", exaltedEffectData(exaltation.toObject(), selection, race));
  await exaltation.update({ "system.selection": selection });
  return exaltation;
}

/**
 * Remove the exaltation, its effects and its Exalted Assets, after confirmation (FR-012).
 * @param {Actor} actor
 * @returns {Promise<void>}
 */
export async function removeExaltation(actor) {
  const exaltation = getExaltation(actor);
  if (!exaltation) return;
  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: { title: localize("DTD.Exaltation.Remove") },
    content: `<p>${game.i18n.format("DTD.Exaltation.RemoveConfirm", { exaltation: exaltation.name })}</p>`,
    rejectClose: false
  });
  if (confirmed) await deleteExaltation(actor);
}

/**
 * Set the purchased Power Stat from a clicked dot, within 1..cap (FR-014).
 * Clicking the current value lowers it by one, like the characteristic dots.
 * @param {Actor} actor
 * @param {number} clicked
 */
export async function setPowerStat(actor, clicked) {
  const exaltation = getExaltation(actor);
  const state = actor.system.exaltation;
  if (!exaltation || !state) return;
  const value = Math.clamp(nextDotValue(state.powerStat.value, clicked), 1, state.powerStat.max);
  if (value !== exaltation.system.powerStat.value) await exaltation.update({ "system.powerStat.value": value });
}

/**
 * Spend one Resource Point (FR-016 to FR-018): counts for the round limit and the Tell.
 * @param {Actor} actor
 */
export async function spendResource(actor) {
  const exaltation = getExaltation(actor);
  const state = actor.system.exaltation;
  if (!exaltation || !state) return;
  const { resource, powerStat } = state;
  const check = spendCheck({ value: resource.value, roundSpent: resource.roundSpent, ps: powerStat.value });
  if (check === "empty") {
    ui.notifications.warn(game.i18n.format("DTD.Exaltation.Empty", { resource: resource.name }));
    return;
  }
  if (check === "overLimit") {
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: localize("DTD.Exaltation.Spend") },
      content: `<p>${game.i18n.format("DTD.Exaltation.RoundLimit", { limit: powerStat.value, stat: powerStat.name })}</p>`,
      rejectClose: false
    });
    if (!confirmed) return;
  }
  await exaltation.update({
    "system.resource.spent": exaltation.system.resource.spent + 1,
    "system.scene.spent": exaltation.system.scene.spent + 1,
    "system.round": { spent: resource.roundSpent + 1, marker: currentCombatMarker() }
  });
}

/**
 * Run one of the exaltation's recovery buttons (restore all, regain, lose, unravel).
 * @param {Actor} actor
 * @param {number} index  index in `system.resource.actions`
 */
export async function recoverResource(actor, index) {
  const exaltation = getExaltation(actor);
  const state = actor.system.exaltation;
  const action = exaltation?.system.resource.actions[index];
  if (!action || !state) return;
  const spent = applyResourceAction(exaltation.system.resource.spent, action, state.powerStat.value, state.resource.max);
  await exaltation.update({ "system.resource.spent": spent });
}

/**
 * Set the current resource by hand (feeding, 1d10 Action Points, GM rulings).
 * @param {Actor} actor
 * @param {number} value
 */
export async function adjustResource(actor, value) {
  const exaltation = getExaltation(actor);
  const state = actor.system.exaltation;
  if (!exaltation || !state || !Number.isFinite(value)) return;
  const current = Math.clamp(Math.round(value), 0, state.resource.max);
  await exaltation.update({ "system.resource.spent": state.resource.max - current });
}

/**
 * Clear the points spent this round (outside combat the round never changes by itself).
 * @param {Actor} actor
 */
export async function resetRound(actor) {
  await getExaltation(actor)?.update({ "system.round": { spent: 0, marker: "none" } });
}

/**
 * New scene: the Tell fades, the round counter clears and Pressure Points refill (FR-018, FR-021).
 * @param {Actor} actor
 */
export async function newScene(actor) {
  await getExaltation(actor)?.update({
    "system.scene.spent": 0,
    "system.round": { spent: 0, marker: "none" },
    "system.pressure.spent": 0
  });
}

/**
 * Spend Pressure Points on a roll (Be a Man); not limited per round and not part of the Tell.
 * @param {Actor} actor
 * @param {number} amount
 */
export async function spendPressure(actor, amount) {
  const exaltation = getExaltation(actor);
  const pressure = actor.system.exaltation?.pressure;
  if (!exaltation || !pressure || !Number.isFinite(amount) || amount <= 0) return;
  if (pressure.value <= 0) {
    ui.notifications.warn(game.i18n.format("DTD.Exaltation.Empty", { resource: localize("DTD.Exaltation.Pressure") }));
    return;
  }
  const spent = Math.min(pressure.max, pressure.spent + Math.min(Math.round(amount), pressure.value));
  await exaltation.update({ "system.pressure.spent": spent });
}

/**
 * Regain Pressure Points: 5 (Be a Man) or Excellence (All the Force of a Great Typhoon).
 * @param {Actor} actor
 * @param {string} amount  a number or "powerStat"
 */
export async function regainPressure(actor, amount) {
  const exaltation = getExaltation(actor);
  const state = actor.system.exaltation;
  if (!exaltation || !state?.pressure) return;
  const n = amount === "powerStat" ? state.powerStat.value : Number(amount) || 0;
  await exaltation.update({ "system.pressure.spent": Math.max(0, state.pressure.spent - n) });
}

/**
 * Perfection (Paragon, p. 83): keep the Paragon Racial Asset of the character's race.
 * Called after applying the exaltation and whenever the race changes; re-opens the
 * Statuesque choice when the new race makes it invalid.
 * @param {Actor} actor
 */
export async function syncPerfection(actor) {
  const exaltation = getExaltation(actor);
  if (!exaltation || !hasPower(exaltation.system, "perfection")) return;
  const race = getRace(actor);
  const raceName = race?.name ?? "";

  const granted = getExaltedAssets(actor).filter((asset) => asset.getFlag("dtd40k", "grantedBy") === "perfection");
  const stale = granted.filter((asset) => asset.system.prerequisites.race !== raceName);
  if (stale.length) await actor.deleteEmbeddedDocuments("Item", stale.map((asset) => asset.id));
  const kept = granted.length > stale.length;

  if (!kept) {
    if (!race) {
      ui.notifications.info(localize("DTD.Exaltation.NoRace"));
    } else {
      const documents = (await game.packs.get(ASSET_PACK)?.getDocuments()) ?? [];
      const asset = perfectionAsset(documents.filter((doc) => doc.type === "feat"), raceName);
      if (asset) await addExaltedAsset(actor, asset, { granted: true });
      else ui.notifications.info(game.i18n.format("DTD.Exaltation.NoPerfectionAsset", { race: raceName }));
    }
  }

  const selection = exaltation.system.selection;
  if (hasPower(exaltation.system, "statuesque") && !statuesqueOptions(race?.system ?? null).includes(selection.statuesque)) {
    await reconfigureExaltation(actor);
  }
}

/* -------------------------------------------- */

/**
 * Delete the current exaltation and its Exalted Assets; keep Hero Points within the new maximum.
 * @param {Actor} actor
 */
async function deleteExaltation(actor) {
  const exaltation = getExaltation(actor);
  if (!exaltation) return;
  const linked = getExaltedAssets(actor).filter((asset) => asset.system.prerequisites.exaltation === exaltation.name);
  await actor.deleteEmbeddedDocuments("Item", [exaltation.id, ...linked.map((asset) => asset.id)]);
  await clampHeroPoints(actor);
}

/**
 * Keep the current Hero Points within the maximum after an effect that raised it is gone.
 * @param {Actor} actor
 */
export async function clampHeroPoints(actor) {
  const max = actor.system.heroPoints.max;
  if (actor._source.system.heroPoints.value > max) await actor.update({ "system.heroPoints.value": max });
}

/**
 * ActiveEffect creation data for an exaltation and selection (one effect per modifier).
 * @param {object} exaltationData  exaltation item source data
 * @param {{statuesque: string, element: string}} selection
 * @param {object|null} race
 * @returns {object[]}
 */
function exaltedEffectData(exaltationData, selection, race) {
  return buildExaltationEffects(exaltationData.system, selection, race).map((effect) => ({
    name: effectName(exaltationData.name, effect.label),
    img: exaltationData.img,
    transfer: true,
    changes: effect.changes,
    flags: { dtd40k: { exalted: effect.exalted } }
  }));
}

/**
 * Localized effect name, e.g. "Paragon: Statuesque +1 Intelligence".
 * @param {string} exaltationName
 * @param {{type: string, key?: string, name?: string, value?: number}} label
 */
function effectName(exaltationName, label) {
  const characteristic = label.key ? localize(CHARACTERISTICS[label.key].label) : "";
  return game.i18n.format(`DTD.Exaltation.Effect.${label.type}`, {
    exaltation: exaltationName,
    characteristic,
    name: label.name ?? "",
    value: label.value ?? ""
  });
}
