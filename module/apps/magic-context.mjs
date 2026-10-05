import { MAGIC_SCHOOLS } from "../config.mjs";
import { advanceInfo } from "./class-context.mjs";

/**
 * Template data for the Magic tab (spec 009).
 */

const localize = (key) => game.i18n.localize(key);

/**
 * @param {Actor} actor
 * @param {{isAdvance: boolean}} options
 */
export function prepareMagicContext(actor, { isAdvance }) {
  const system = actor.system;
  const state = system.magic.state;
  const spells = actor.items.filter((item) => item.type === "spell");
  const schools = Object.entries(MAGIC_SCHOOLS).map(([key, def]) => {
    const value = system.magic.schools[key].value;
    const known = spells.filter((s) => s.system.school === key).sort((a, b) => a.system.level - b.system.level || a.name.localeCompare(b.name));
    return {
      key,
      label: localize(def.label),
      characteristic: localize(CONFIG.DTD.CHARACTERISTICS[def.characteristic].abbr),
      value,
      slots: state.slots[key],
      over: state.slots[key].used > state.slots[key].max,
      advance: isAdvance ? advanceInfo(actor, "school", key, actor._source.system.magic.schools[key].value) : null,
      spells: known.map((s) => ({
        id: s.id, name: s.name, img: s.img, level: s.system.level, comboOk: s.system.keywords.includes("comboOk"),
        tn: s.system.tn.special === "none" ? "—" : s.system.tn.special === "mentalDefense" ? "MD" : s.system.tn.value,
        action: localize(`DTD.Magic.Action.${s.system.action}`)
      }))
    };
  }).filter((s) => s.value > 0 || s.spells.length || isAdvance);
  return {
    casterLevel: state.casterLevel,
    sanctioned: state.sanctioned,
    hasImplement: state.hasImplement,
    schools,
    sustained: system.magic.sustained,
    combos: system.magic.combos.map((c) => ({ ...c, text: c.spells.join(" + ") })),
    comboCandidates: spells.filter((s) => s.system.keywords.includes("comboOk")).map((s) => ({ id: s.id, name: s.name, level: s.system.level })),
    empty: !schools.length
  };
}
