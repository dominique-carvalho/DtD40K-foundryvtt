import { buildAssetEffects, validateAssetAdd } from "../rules/asset.mjs";
import { clampHeroPoints, getExaltation } from "./exaltation-service.mjs";
import { getRace } from "./race-service.mjs";
import { priceExaltedAsset, recordEntry } from "./xp-service.mjs";

/**
 * Adding and removing a character's Exalted Assets (spec 004, US5).
 * Contract: specs/004-exaltation-compendium/contracts/foundry-api.md ("Serviços").
 */

const localize = (key) => game.i18n.localize(key);

/**
 * The Exalted Assets of an actor.
 * @param {Actor} actor
 * @returns {Item[]}
 */
export function getExaltedAssets(actor) {
  return actor.items.filter((item) => item.type === "feat" && item.system.category === "exaltedAsset");
}

/**
 * Add an Exalted Asset after checking exaltation, race and the one-asset limit (FR-022).
 * A refused asset can still be added by the GM (constitution IV).
 * @param {Actor} actor
 * @param {Item} assetItem  dropped from a compendium, the sidebar or another actor
 * @param {{granted?: boolean}} [options]  granted: added by Perfection, no creation-only notice
 * @returns {Promise<Item|null>}
 */
export async function addExaltedAsset(actor, assetItem, { granted = false } = {}) {
  if (actor.type !== "character") {
    ui.notifications.warn(localize("DTD.Exaltation.NotCharacter"));
    return null;
  }

  const exaltation = getExaltation(actor);
  const race = getRace(actor);
  const check = validateAssetAdd({ asset: assetItem, exaltation, race, assets: getExaltedAssets(actor) });
  // Exalted Assets are bought during character creation (p. 179), Paragons excepted (spec 016).
  if (check.valid && !granted && !actor.system.creation.active && exaltation?.name !== "Paragon") {
    Object.assign(check, { valid: false, error: "creationOnly" });
  }
  if (!check.valid) {
    const message = game.i18n.format(`DTD.Asset.Error.${check.error}`, {
      asset: assetItem.name,
      exaltation: assetItem.system.prerequisites.exaltation,
      race: assetItem.system.prerequisites.race
    });
    ui.notifications.warn(message);
    if (!game.user.isGM) return null;
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: localize("DTD.Asset.GMOverrideTitle") },
      content: `<p>${message}</p><p>${localize("DTD.Asset.GMOverride")}</p>`,
      rejectClose: false
    });
    if (!confirmed) return null;
  }

  // Exalted Assets cost XP like any asset (spec 020); the GM override above keeps the price.
  const price = await priceExaltedAsset(actor, assetItem, { granted });
  if (!price.ok) return null;

  const data = assetItem.toObject();
  delete data._id;
  delete data.folder;
  data.effects = buildAssetEffects(data.system).map((effect) => ({
    name: game.i18n.format("DTD.Asset.Effect", {
      asset: data.name,
      effect: localize(`DTD.Asset.Automation.${effect.asset}`)
    }),
    img: data.img,
    transfer: true,
    changes: effect.changes,
    flags: { dtd40k: { asset: effect.asset } }
  }));
  if (granted) foundry.utils.setProperty(data, "flags.dtd40k.grantedBy", "perfection");

  const [created] = await actor.createEmbeddedDocuments("Item", [data]);
  if (!created) return null;
  if (created.system.automation === "actionHero") {
    await actor.update({ "system.heroPoints.value": actor._source.system.heroPoints.value + 1 });
  }
  if (price.cost) await recordEntry(actor, { kind: "exaltedAsset", label: created.name, from: 0, to: 1, cost: price.cost, itemId: created.id });
  return created;
}

/**
 * Remove an Exalted Asset and its effects, after confirmation.
 * @param {Actor} actor
 * @param {string} itemId
 * @returns {Promise<void>}
 */
export async function removeExaltedAsset(actor, itemId) {
  const asset = actor.items.get(itemId);
  if (!asset) return;
  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: { title: localize("DTD.Asset.Remove") },
    content: `<p>${game.i18n.format("DTD.Asset.RemoveConfirm", { asset: asset.name })}</p>`,
    rejectClose: false
  });
  if (!confirmed) return;
  await asset.delete();
  await clampHeroPoints(actor);
}
