import { CHARACTERISTICS, GENERIC_SPENDS } from "../config.mjs";
import { getExaltedAssets } from "../documents/asset-service.mjs";
import { getExaltation } from "../documents/exaltation-service.mjs";
import { needsSelection } from "../rules/exaltation.mjs";
import { getRace } from "../documents/race-service.mjs";
import { resourceActionLabel } from "./exaltation-sheet.mjs";

/**
 * Template data for the exaltation card and the Exalted Assets of the Traits tab (spec 004).
 * Kept out of character-sheet.mjs, which is already long (plan, Structure Decision).
 */

const localize = (key) => game.i18n.localize(key);

/**
 * Enrich an HTML description for display on the character sheet.
 * @param {string} html
 * @param {Item} item
 */
const enrich = (html, item) =>
  foundry.applications.ux.TextEditor.implementation.enrichHTML(html, { relativeTo: item, secrets: item.isOwner });

/**
 * Active Effects of an item carrying one of the given flags, for the GM toggles.
 * @param {Item} item
 * @param {string} flag  "exalted" or "asset"
 */
const effectRows = (item, flag) =>
  item.effects
    .filter((effect) => effect.getFlag("dtd40k", flag))
    .map((effect) => ({ id: effect.id, itemId: item.id, name: effect.name, active: !effect.disabled }));

/**
 * Exaltation card data, or null when the character has none.
 * @param {Actor} actor
 * @returns {Promise<object|null>}
 */
export async function prepareExaltationContext(actor) {
  const item = getExaltation(actor);
  const state = actor.system.exaltation;
  if (!item || !state) return null;
  const system = item.system;
  const { powerStat, resource, tell, pressure } = state;

  const dotCount = Math.max(5, powerStat.max);
  const selection = [];
  if (system.selection.statuesque) {
    selection.push(`Statuesque: +1 ${localize(CHARACTERISTICS[system.selection.statuesque].label)}`);
  }
  const element = system.elements.find((entry) => entry.key === system.selection.element);
  if (element) selection.push(`${element.name}: +1 ${localize(CHARACTERISTICS[element.characteristic].label)}`);

  return {
    id: item.id,
    name: item.name,
    img: item.img,
    needsSelection: needsSelection(system, getRace(actor)?.system ?? null),
    selection,
    powerStat: {
      ...powerStat,
      capped: powerStat.purchased > powerStat.value,
      dots: Array.from({ length: dotCount }, (_, i) => ({
        index: i + 1,
        filled: i < powerStat.value,
        disabled: i + 1 > powerStat.max
      }))
    },
    resource: {
      ...resource,
      empty: resource.value <= 0,
      pct: resource.max > 0 ? Math.round((resource.value / resource.max) * 100) : 0,
      actions: system.resource.actions.map((action, index) => ({
        index,
        label: resourceActionLabel(action, system.resource.debtName, powerStat.name)
      }))
    },
    tell: {
      ...tell,
      label: `DTD.Exaltation.TellLevel.${tell.level}`,
      description: await enrich(system.tell, item)
    },
    pressure,
    genericSpends: GENERIC_SPENDS
      .filter((key) => key !== "heal" || state.healing !== "never")
      .map((key) => ({
        key,
        label: key === "heal" ? `DTD.Exaltation.Healing.${state.healing}` : `DTD.Exaltation.GenericSpend.${key}`
      })),
    staticPowers: await Promise.all(system.staticPowers.map(async (power) => ({
      name: power.name,
      automated: power.automation !== "none",
      description: await enrich(power.description, item)
    }))),
    powers: await Promise.all(state.powers.map(async (power, index) => ({
      ...power,
      description: await enrich(system.powers[index]?.description ?? "", item)
    }))),
    effects: effectRows(item, "exalted")
  };
}

/**
 * Exalted Assets of the character, for the list under the exaltation card.
 * @param {Actor} actor
 * @returns {Promise<object[]>}
 */
export async function prepareAssetsContext(actor) {
  return Promise.all(getExaltedAssets(actor).map(async (asset) => ({
    id: asset.id,
    name: asset.name,
    img: asset.img,
    group: asset.system.group ? `DTD.Asset.Group.${asset.system.group}` : "",
    granted: asset.getFlag("dtd40k", "grantedBy") === "perfection",
    automated: asset.system.automation !== "none",
    grantsCount: asset.system.grants?.length ?? 0,
    description: await enrich(asset.system.description, asset),
    effects: effectRows(asset, "asset")
  })));
}
