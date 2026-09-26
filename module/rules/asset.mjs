/**
 * Exalted Asset rules: who may take an asset, the one-asset limit and the Active Effect
 * changes of the automated assets.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 179, 211–223; specs/004-exaltation-compendium/contracts/rules-api.md.
 */
import { LIMIT_EXEMPT_GROUPS } from "../config.mjs";
import { ADD, OVERRIDE } from "./race.mjs";

/**
 * @typedef {object} AssetLike   a feat item (document or source data)
 * @property {string} name
 * @property {{group: string, prerequisites: {exaltation: string, race: string}, automation: string}} system
 */

/**
 * Whether the asset counts toward the one-Exalted-Asset limit; Paragon Assets do not (p. 179).
 * @param {AssetLike} asset
 * @returns {boolean}
 */
export function countsTowardLimit(asset) {
  return !LIMIT_EXEMPT_GROUPS.includes(asset.system.group);
}

/**
 * Whether a character may take an asset (FR-022).
 * @param {{asset: AssetLike, exaltation: {name: string}|null, race: {name: string}|null, assets: AssetLike[]}} params
 * @returns {{valid: true} | {valid: false, error: "noExaltation"|"wrongExaltation"|"wrongRace"|"duplicate"|"limit"}}
 */
export function validateAssetAdd({ asset, exaltation, race, assets }) {
  const { prerequisites, group } = asset.system;
  if (!exaltation) return { valid: false, error: "noExaltation" };
  if (prerequisites.exaltation && prerequisites.exaltation !== exaltation.name) return { valid: false, error: "wrongExaltation" };
  if (group === "paragonRacial" && prerequisites.race !== race?.name) return { valid: false, error: "wrongRace" };
  if (assets.some((owned) => owned.name === asset.name)) return { valid: false, error: "duplicate" };
  if (countsTowardLimit(asset) && assets.some(countsTowardLimit)) return { valid: false, error: "limit" };
  return { valid: true };
}

/** Change applied by each automated asset (research R6). */
const ASSET_CHANGES = {
  actionHero: { key: "system.heroPoints.max", mode: ADD, value: "1" },
  extraAction: { key: "system.modifiers.exaltation.resourceBonus", mode: ADD, value: "2" },
  bloodOfIo: { key: "system.modifiers.exaltation.resourcePerPowerStat", mode: ADD, value: "1" },
  // The racial Size is an OVERRIDE (priority 50); a later ADD keeps the Warboss +1.
  warboss: { key: "system.size", mode: ADD, value: "1", priority: 60 },
  longbeard: { key: "system.modifiers.resilience", mode: ADD, value: "1" },
  markOfNurgle: { key: "system.modifiers.resilience", mode: ADD, value: "1" },
  sloth: { key: "system.modifiers.hpMax", mode: ADD, value: "2" },
  elusive: { key: "system.modifiers.staticDefenseSize", mode: OVERRIDE, value: "false" }
};

/**
 * Active Effects of an automated asset (FR-025); text-only assets have none.
 * @param {{automation: string}} system
 * @returns {{asset: string, changes: {key: string, mode: number, value: string, priority?: number}[]}[]}
 */
export function buildAssetEffects({ automation }) {
  const change = ASSET_CHANGES[automation];
  return change ? [{ asset: automation, changes: [{ ...change }] }] : [];
}

/**
 * The Paragon Racial Asset granted by Perfection for a race (p. 83), or null.
 * @template {AssetLike} T
 * @param {T[]} assets
 * @param {string} raceName
 * @returns {T|null}
 */
export function perfectionAsset(assets, raceName) {
  if (!raceName) return null;
  return assets.find((asset) => asset.system.group === "paragonRacial" && asset.system.prerequisites.race === raceName) ?? null;
}
