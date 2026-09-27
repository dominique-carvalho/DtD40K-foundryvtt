import { CHARACTERISTICS, SKILLS } from "../config.mjs";
import { getClasses } from "../documents/class-service.mjs";
import { getRace } from "../documents/race-service.mjs";
import { classProgress } from "../rules/class.mjs";
import { advanceCost, canAdvance } from "../rules/xp.mjs";

/**
 * Template data for the Class tab (classes, progress, XP) and the advance-mode buttons (spec 006).
 */

const localize = (key) => game.i18n.localize(key);
const enrich = (html, item) => foundry.applications.ux.TextEditor.implementation.enrichHTML(html, { relativeTo: item, secrets: item.isOwner });
const ownedFeats = (actor) => actor.items.filter((item) => item.type === "feat" && item.system.category !== "exaltedAsset");
const featLabel = (entry) => (entry.subcategory ? `${entry.name} (${entry.subcategory})` : entry.name);

/**
 * Class tab data.
 * @param {Actor} actor
 */
export async function prepareClassContext(actor) {
  const classes = getClasses(actor);
  const feats = ownedFeats(actor);
  const rows = await Promise.all(classes.map(async (item) => {
    const progress = classProgress(item.system, feats);
    return {
      id: item.id,
      name: item.name,
      img: item.img,
      level: item.system.level,
      track: item.system.track,
      current: item.system.status === "current",
      progress,
      progressText: `${progress.done} / ${progress.required}`,
      entries: progress.entries.map((entry) => ({
        label: featLabel(entry),
        name: entry.name,
        subcategory: entry.subcategory,
        mandatory: entry.mandatory,
        choice: Boolean(entry.orGroup),
        owned: entry.owned,
        blocked: entry.blocked
      })),
      characteristics: item.system.anyCharacteristic
        ? localize("DTD.Class.AnyCharacteristic")
        : item.system.characteristics.map((key) => localize(CHARACTERISTICS[key].label)).join(", "),
      skills: item.system.skills.map((key) => localize(SKILLS[key].label)).join(", "),
      completion: await enrich(item.system.completion.text, item),
      effects: item.effects.filter((effect) => effect.getFlag("dtd40k", "classBonus"))
        .map((effect) => ({ id: effect.id, itemId: item.id, name: effect.name, active: !effect.disabled }))
    };
  }));
  const xp = actor.system.xp;
  const log = [...xp.log].reverse().map((entry, index) => ({
    ...entry,
    award: entry.type === "award",
    sign: entry.type === "award" ? "+" : "−",
    undoable: game.user.isGM || index === 0,
    when: new Date(entry.date).toLocaleDateString(game.i18n.lang)
  }));
  return {
    current: rows.find((row) => row.current) ?? null,
    completed: rows.filter((row) => !row.current),
    freeStudy: actor.system.classState.freeStudy,
    xp: { ...xp.totals, starting: xp.starting, log, negative: xp.totals.available < 0 }
  };
}

/**
 * Advance-mode data of a characteristic, skill or the Power Stat: cost of the next point, or why not.
 * @param {Actor} actor
 * @param {"characteristic"|"skill"|"powerStat"} kind
 * @param {string} key
 * @param {number} from  stored value
 */
export function advanceInfo(actor, kind, key, from) {
  const check = canAdvance({
    kind,
    key,
    classes: actor.items.filter((item) => item.type === "class"),
    race: getRace(actor),
    owned: ownedFeats(actor),
    level: actor.system.level,
    from,
    blocked: actor.system.alignment?.blocked ?? []
  });
  const cost = advanceCost(kind, from) * check.multiplier;
  return {
    allowed: check.allowed,
    cost,
    doubled: check.multiplier > 1,
    tooltip: check.allowed
      ? game.i18n.format(check.multiplier > 1 ? "DTD.XP.CostFreeStudy" : "DTD.XP.CostTooltip", { cost })
      : localize(`DTD.XP.Error.${check.reason}`)
  };
}
