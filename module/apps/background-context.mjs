import { BACKGROUND_XP, BACKGROUNDS, INHERITANCE_SLOTS } from "../config.mjs";
import { getDeity, pantheonLabel } from "../documents/alignment-service.mjs";
import { BACKGROUND_TEXT, backgroundCost, inheritanceFits } from "../rules/backgrounds.mjs";

/**
 * Template data for the Backgrounds and Alignment sections of the Traits tab (spec 011).
 */

const localize = (key) => game.i18n.localize(key);

/**
 * @param {Actor} actor
 * @param {{isEdit: boolean}} options
 */
export function prepareBackgroundContext(actor, { isEdit }) {
  const system = actor.system;
  const creation = system.creation.active;
  const canRaise = actor.isOwner && (creation || game.user.isGM);
  const dotsUsed = system.backgrounds.dots;
  const costOf = (value) => {
    if (!creation) return { cost: 0, tooltip: localize("DTD.Background.GMAdjust") };
    const cost = backgroundCost({ to: value + 1, dotsUsed });
    return { cost, tooltip: cost ? game.i18n.format("DTD.XP.CostTooltip", { cost }) : localize("DTD.Background.FreeDot") };
  };
  const levelText = (key, value) => BACKGROUND_TEXT[key].levels[String(value)] ?? "";
  const row = (key, value, path) => ({
    key, value, path, label: localize(BACKGROUNDS[key].label), summary: BACKGROUND_TEXT[key].summary,
    text: levelText(key, value), raise: canRaise && value < 5 ? costOf(value) : null
  });
  const singles = Object.keys(BACKGROUNDS).filter((key) => !BACKGROUNDS[key].multiple).map((key) => (key === "wealth"
    ? row(key, actor._source.system.wealth.value, "system.wealth.value")
    : row(key, actor._source.system.backgrounds[key].value, `system.backgrounds.${key}.value`)));
  const instances = (key, list) => ({
    key, label: localize(BACKGROUNDS[key].label), summary: BACKGROUND_TEXT[key].summary,
    items: list.map((i) => ({ ...i, raise: canRaise && i.value < 5 ? costOf(i.value) : null })),
    add: canRaise ? costOf(0) : null
  });
  const inheritance = system.backgrounds.inheritance.value;
  const picks = system.backgrounds.inheritancePicks;
  return {
    creation,
    dots: { used: dotsUsed, max: BACKGROUND_XP.freeDots },
    singles,
    lists: [instances("artifact", actor._source.system.backgrounds.artifacts), instances("backing", actor._source.system.backgrounds.backings)],
    gmEdit: isEdit && game.user.isGM,
    canRaise,
    contacts: system.backgrounds.contacts.value,
    inheritance: inheritance > 0 ? {
      value: inheritance,
      fits: inheritanceFits(inheritance, picks),
      picks: Object.keys(INHERITANCE_SLOTS).map((key) => ({ key, label: localize(`DTD.Rarity.${key}`), count: picks[key] ?? 0 }))
    } : null
  };
}

/**
 * @param {Actor} actor
 */
export function prepareAlignmentContext(actor) {
  const deity = getDeity(actor);
  const system = actor.system;
  const points = [];
  for (let point = 10; point >= 0; point--) {
    const records = system.alignment.degenerations.filter((d) => d.point === point);
    if (records.length) points.push({ point, names: records.map((r) => r.name).join(", ") });
  }
  return {
    deity: deity ? {
      id: deity.id, name: deity.name, img: deity.img, pantheon: pantheonLabel(deity), commandments: deity.system.commandments,
      keywords: deity.system.keywords
    } : null,
    devotion: system.devotion.value,
    outOfPlay: system.alignment.outOfPlay,
    changes: system.alignment.changes,
    degenerations: points,
    blocked: system.alignment.blocked.map((key) => localize(CONFIG.DTD.CHARACTERISTICS[key].label)).join(", "),
    canRoll: actor.isOwner
  };
}
