import { CHARACTERISTICS, SKILLS } from "../config.mjs";
import { creationSummary } from "../documents/creation-service.mjs";

/**
 * Template data for the creation panel of the character sheet (spec 016), shown only while creation is active.
 */

const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
const ICONS = { done: "fa-circle-check", pending: "fa-circle", warning: "fa-triangle-exclamation" };
const ratingLabel = ({ kind, key }) => localize((kind === "characteristic" ? CHARACTERISTICS : SKILLS)[key].label);

/** Groups of one Starting Scores step, in priority order. */
const scores = (result) => ({
  fits: result.fits,
  unspent: result.unspent,
  groups: result.groups.map((group) => ({
    label: localize(`DTD.SkillGroup.${group.key}`),
    spent: group.spent,
    budget: group.budget,
    state: group.spent > group.budget ? "over" : group.spent === group.budget ? "full" : "open"
  }))
});

/** Text next to a checklist step. */
function detail(step) {
  switch (step.key) {
    case "characteristics":
    case "skills": return step.data.unspent ? format("DTD.Creation.Detail.unspent", step.data) : "";
    case "alignment": return step.status === "warning" ? format("DTD.Creation.Detail.devotion", step.data) : "";
    case "backgrounds": return format("DTD.Creation.Detail.backgrounds", step.data);
    case "xp": return format("DTD.Creation.Detail.xp", step.data);
    case "specialties": return step.status === "warning" ? format("DTD.Creation.Detail.specialties", step.data) : "";
    case "equipment": return format("DTD.Creation.Detail.equipment", step.data);
    case "languages": return format("DTD.Creation.Detail.languages", step.data);
    default: return "";
  }
}

/**
 * @param {Actor} actor
 * @returns {object|null}
 */
export function prepareCreationContext(actor) {
  if (actor.type !== "character" || !actor.system.creation.active) return null;
  const summary = creationSummary(actor);
  return {
    characteristics: scores(summary.characteristics),
    skills: scores(summary.skills),
    xp: summary.xp,
    specialties: {
      missing: summary.specialties.missing.map(ratingLabel),
      excess: summary.specialties.excess.map((entry) => `${ratingLabel(entry)} (+${entry.count})`)
    },
    steps: summary.steps.map((step) => ({
      key: step.key,
      label: localize(`DTD.Creation.Step.${step.key}`),
      status: step.status,
      icon: ICONS[step.status],
      detail: detail(step)
    })),
    canEnd: game.user.isGM
  };
}
