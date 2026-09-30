import { ACTION_TYPES, STATUS_EFFECTS, UNTIL_NEXT_TURN } from "../config.mjs";
import { combatantOf } from "../documents/turn-service.mjs";
import { COMBAT_ACTIONS } from "../rules/combat-actions.mjs";
import { SOCIAL_SKILLS } from "../rules/social.mjs";

/**
 * Template data for the Combat tab (spec 008).
 */

const localize = (key) => game.i18n.localize(key);

/**
 * Combat tab data.
 * @param {Actor} actor
 */
export function prepareCombatContext(actor) {
  const system = actor.system;
  const combatant = combatantOf(actor);
  const state = combatant?.turnState ?? null;
  const used = (action) => {
    if (!state) return false;
    if (action.type === "reaction") return state.reactions >= system.combat.reactionsMax;
    if (action.type === "free") return state.free.includes(action.key);
    return state.full || state.halves.includes(action.key) || (action.type === "full" && state.halves.length > 0) || state.halves.length >= 2;
  };
  const groups = ACTION_TYPES.map((type) => ({
    type,
    label: localize(`DTD.Combat.ActionType.${type}`),
    actions: COMBAT_ACTIONS.filter((a) => a.type === type).map((a) => ({
      key: a.key, name: a.name, summary: a.summary, page: a.page, used: used(a), attack: Boolean(a.automation.attack && !a.automation.attack.aim)
    }))
  })).filter((g) => g.actions.length);

  const conditions = STATUS_EFFECTS.filter((s) => !UNTIL_NEXT_TURN.includes(s.id)).map((s) => ({
    id: s.id, label: localize(s.name), img: s.img, active: actor.statuses.has(s.id)
  }));
  const actionEffects = STATUS_EFFECTS.filter((s) => UNTIL_NEXT_TURN.includes(s.id) && actor.statuses.has(s.id))
    .map((s) => ({ id: s.id, label: localize(s.name) }));

  return {
    inCombat: Boolean(combatant),
    turn: state ? {
      full: state.full, halves: state.halves.length, reactions: state.reactions, reactionsMax: system.combat.reactionsMax
    } : null,
    weapons: [
      { id: "unarmed", name: localize("DTD.Attack.Unarmed") },
      // Rounds in the clip next to the name (spec 019).
      ...actor.items.filter((item) => item.type === "weapon" && item.system.equipped).map((item) => ({
        id: item.id,
        name: item.system.ammo?.tracked ? `${item.name} (${item.system.ammo.current}/${item.system.ammo.max}${item.system.ammo.jammed ? ` · ${localize("DTD.Ammo.JammedBadge")}` : ""})` : item.name
      }))
    ],
    groups,
    conditions,
    actionEffects,
    critical: system.critical.value,
    woundState: localize(`DTD.Combat.Wound.${system.combat.woundState}`),
    fatigue: { value: system.fatigue.value, max: system.fatigue.max },
    dead: actor.statuses.has("dead"),
    heroPoints: system.heroPoints,
    resolve: { value: system.resolve.value, max: system.resolve.max, drained: system.resolve.drainedScene, jaded: actor.statuses.has("jaded") },
    insanity: system.insanity,
    fearRatings: [1, 2, 3, 4, 5],
    socialSkills: SOCIAL_SKILLS.map((key) => ({ key, label: localize(CONFIG.DTD.SKILLS[key].label) })),
    severities: ["minor", "severe", "acute"].map((key) => ({ key, label: localize(`DTD.Mental.Severity.${key}`) }))
  };
}
