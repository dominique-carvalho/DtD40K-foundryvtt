import { HINDRANCE_LIMIT } from "../config.mjs";
import { getFeats, originNames } from "../documents/feat-service.mjs";
import { getRace } from "../documents/race-service.mjs";
import { grantedByOf } from "../rules/feat.mjs";

/**
 * Template data for the Feats, Assets and Hindrances sections of the Traits tab (spec 005).
 */

/**
 * One row of a feat section.
 * @param {Actor} actor
 * @param {Item} feat
 * @param {string} raceName
 */
async function featRow(actor, feat, raceName) {
  const system = feat.system;
  const granted = grantedByOf(feat).length > 0;
  const purchased = Boolean(feat.getFlag("dtd40k", "purchased"));
  return {
    id: feat.id,
    name: feat.name,
    img: feat.img,
    granted,
    grantedBy: granted ? originNames(actor, feat) : "",
    purchased: granted && purchased,
    // Only purchased feats are removed by players; granted ones leave with their origin (FR-015).
    removable: !granted || purchased || game.user.isGM,
    wrongRace: system.category === "racialFeat" && system.prerequisites.race && system.prerequisites.race !== raceName
      ? system.prerequisites.race
      : "",
    racial: system.category === "racialFeat" ? system.prerequisites.race : "",
    automated: system.automation !== "none",
    description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description, {
      relativeTo: feat,
      secrets: feat.isOwner
    }),
    effects: feat.effects
      .filter((effect) => effect.getFlag("dtd40k", "feat"))
      .map((effect) => ({ id: effect.id, itemId: feat.id, name: effect.name, active: !effect.disabled }))
  };
}

/**
 * Feats (class and racial), Assets and Hindrances of the character.
 * @param {Actor} actor
 * @returns {Promise<{feats: object[], assets: object[], hindrances: object[], hindranceCount: string}>}
 */
export async function prepareFeatsContext(actor) {
  const raceName = getRace(actor)?.name ?? "";
  const rows = (categories) => Promise.all(getFeats(actor)
    .filter((feat) => categories.includes(feat.system.category))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((feat) => featRow(actor, feat, raceName)));
  const hindrances = await rows(["hindrance"]);
  return {
    feats: await rows(["feat", "racialFeat"]),
    assets: await rows(["asset"]),
    hindrances,
    hindranceCount: game.i18n.format("DTD.Feat.HindranceCount", { count: hindrances.length, max: HINDRANCE_LIMIT })
  };
}
