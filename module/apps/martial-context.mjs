import { MARTIAL_SCHOOLS } from "../config.mjs";
import { levelFor, ranksOf, schoolData } from "../documents/martial-service.mjs";
import { UNIVERSAL_ADVANTAGES, UNIVERSAL_RESTRICTIONS, attackTotals, budget } from "../rules/martial.mjs";
import { advanceInfo } from "./class-context.mjs";
import { costLabel } from "./martial-school-sheet.mjs";

/**
 * Template data for the Martial tab (spec 010): Martial Adept / Gunslinger Level, school ranks with what each rank
 * unlocked, passives, the universal lists and the Special Attacks / Trick Shots.
 */

const localize = (key) => game.i18n.localize(key);

/**
 * @param {Actor} actor
 * @param {{isAdvance: boolean}} options
 */
export async function prepareMartialContext(actor, { isAdvance }) {
  const system = actor.system;
  const data = await schoolData();
  const ranks = ranksOf(actor);
  const passives = actor.effects.filter((effect) => effect.getFlag("dtd40k", "martialPassive"));
  const schools = Object.entries(MARTIAL_SCHOOLS).map(([key, def]) => {
    const value = ranks[key];
    const school = data[key];
    const unlocked = (school?.system.entries ?? []).filter((e) => e.rank <= value).map((e) => {
      const effect = passives.find((p) => p.getFlag("dtd40k", "martialPassive") === `${key}:${e.id}`);
      return {
        ...e, typeLabel: localize(`DTD.Martial.EntryType.${e.type}`), cost: costLabel(e),
        effectId: effect?.id ?? "", disabled: effect?.disabled ?? false, textOnly: e.type === "mastery" && !effect
      };
    });
    return {
      key, kind: def.kind, label: localize(def.label), value,
      skill: localize(CONFIG.DTD.SKILLS[def.skill].label), weaponGroup: school?.system.weaponGroup ?? "",
      advance: isAdvance ? advanceInfo(actor, "martial", key, actor._source.system.martial.schools[key].value) : null,
      unlocked
    };
  }).filter((s) => s.value > 0 || isAdvance);

  const weapons = [{ id: "unarmed", name: localize("DTD.Attack.Unarmed") },
    ...actor.items.filter((item) => item.type === "weapon" && item.system.equipped).map((item) => ({ id: item.id, name: item.name }))];
  const round = game.combat?.started ? game.combat.round : 1;
  const attacks = system.martial.attacks.map((attack) => {
    const totals = attackTotals(attack, data);
    const level = levelFor(actor, attack.kind);
    const check = budget({ advantages: totals.advantages, restrictions: totals.restrictions, level });
    return {
      id: attack.id, name: attack.name, kindLabel: localize(`DTD.Martial.AttackKind.${attack.kind}`),
      action: attack.action, advantages: totals.advantages, restrictions: totals.restrictions,
      valid: check.ok && !totals.missing.length,
      invalidReason: totals.missing.length ? localize("DTD.Martial.MissingEntries") : check.ok ? "" : game.i18n.format(`DTD.Martial.Budget.${check.reason}`, { level, missing: check.missing }),
      ready: attack.state.readyUntil >= round,
      usedScene: attack.state.usedScene,
      picks: [...attack.advantages, ...attack.restrictions].map((p) => {
        const [scope, id] = p.ref.split(":");
        const entry = scope === "universal" ? [...UNIVERSAL_ADVANTAGES, ...UNIVERSAL_RESTRICTIONS].find((u) => u.slug === id) : data[scope]?.system.entries.find((e) => e.id === id);
        return `${entry?.name ?? p.ref}${p.count > 1 ? ` ×${p.count}` : ""}`;
      }).join(", ")
    };
  });
  return {
    levels: system.martial.levels,
    schools,
    swordSchools: schools.filter((s) => s.kind === "sword"),
    gunKata: schools.filter((s) => s.kind === "gunKata"),
    universals: {
      advantages: UNIVERSAL_ADVANTAGES.map((u) => ({ ...u, costText: costLabel(u) })),
      restrictions: UNIVERSAL_RESTRICTIONS.map((u) => ({ ...u, costText: costLabel(u) }))
    },
    attacks,
    weapons,
    canSpecial: system.martial.levels.adeptLevel > 0,
    canTrick: system.martial.levels.gunslingerLevel > 0,
    empty: !schools.length
  };
}
