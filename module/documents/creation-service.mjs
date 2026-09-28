import { CHARACTERISTICS, SKILLS } from "../config.mjs";
import { startingSlots } from "../rules/acquisition.mjs";
import {
  assignPriorities, canReach, checkDots, creationChecklist, creationSpend, creationXp, specialtyCheck
} from "../rules/creation.mjs";
import { getDeity } from "./alignment-service.mjs";
import { getExaltation } from "./exaltation-service.mjs";
import { getRace } from "./race-service.mjs";

/**
 * Guided character creation (spec 016): the creation summary of the sheet panel, the checks on the dots set in edit
 * mode and the end of creation. Contract: specs/016-guided-creation/contracts/foundry-api.md.
 */

const localize = (key) => game.i18n.localize(key);
const KINDS = { characteristics: "characteristic", skills: "skill" };
const values = (group) => Object.fromEntries(Object.entries(group).map(([key, data]) => [key, data.value]));
const lists = (group) => Object.fromEntries(Object.entries(group).map(([key, data]) => [key, data.specialties]));

/**
 * Warn about a refused change; the GM may allow it anyway (constitution IV).
 * @param {string} message
 * @returns {Promise<boolean>}  true if the GM allowed it
 */
export async function refuseUnlessGM(message) {
  ui.notifications.warn(message);
  if (!game.user.isGM) return false;
  return Boolean(await foundry.applications.api.DialogV2.confirm({
    window: { title: localize("DTD.Creation.GMOverrideTitle") },
    content: `<p>${message}</p><p>${localize("DTD.Creation.GMOverride")}</p>`,
    rejectClose: false
  }));
}

/**
 * Everything the creation panel shows (data-model.md): dots by group, XP, specialties and the checklist.
 * @param {Actor} actor
 */
export function creationSummary(actor) {
  const system = actor.system;
  const source = actor._source.system;
  const log = source.xp.log;
  const scores = (kind, group) => {
    const spend = creationSpend(kind, values(source[group]), log);
    return { ...assignPriorities(kind, spend.byGroup), byKey: spend.byKey };
  };
  const characteristics = scores("characteristic", "characteristics");
  const skills = scores("skill", "skills");
  const exaltation = getExaltation(actor);
  const has = (name) => actor.items.some((item) => item.type === "feat" && item.name === name);
  const specialties = specialtyCheck({
    ratings: { characteristic: values(system.characteristics), skill: values(system.skills) },
    specialties: { characteristic: lists(source.characteristics), skill: lists(source.skills) },
    extras: {
      expandedKnowledge: has("Expanded Knowledge"),
      education: has("Education") ? system.characteristics.int.value : 0,
      atlantean: exaltation?.name === "Atlantean" ? 3 : 0
    }
  });
  const xp = creationXp(system.xp.totals, log);
  const steps = creationChecklist({
    race: Boolean(getRace(actor)),
    exaltation: Boolean(exaltation),
    classes: actor.items.filter((item) => item.type === "class").map((item) => ({ level: item.system.level, current: item.system.status === "current" })),
    deity: Boolean(getDeity(actor)),
    devotion: system.devotion.value,
    characteristics,
    skills,
    backgroundDots: system.backgrounds.dots,
    xp,
    specialties,
    slots: startingSlots(actor.items, system.backgrounds.inheritancePicks ?? {}),
    int: system.characteristics.int.value
  });
  return { characteristics, skills, xp, specialties, steps };
}

/**
 * Set a characteristic or skill from a clicked dot in edit mode (FR-004, FR-005): the highest rating of the
 * character always; the budgets and the caps of the step while creation is active.
 * @param {Actor} actor
 * @param {string} path  "system.characteristics.<key>.value" or "system.skills.<key>.value"
 * @param {number} value  new stored value
 * @returns {Promise<boolean>}
 */
export async function setCreationDots(actor, path, value) {
  const [, group, key] = path.split(".");
  const kind = KINDS[group];
  const stored = actor._source.system[group][key].value;
  if (kind && value > stored) {
    const label = localize((kind === "characteristic" ? CHARACTERISTICS : SKILLS)[key].label);
    // Bonuses from effects stay on top of the stored value.
    const bonus = actor.system[group][key].value - stored;
    const atSix = Object.entries(actor.system[group]).filter(([other, data]) => other !== key && data.value >= 6).length;
    const reach = canReach({ to: value + Math.max(0, bonus), cap: actor.system.ratingCaps[kind], atSix });
    if (!reach.allowed && !(await refuseUnlessGM(game.i18n.format(`DTD.Creation.Error.${reach.reason}`, { label })))) return false;
    if (actor.system.creation.active) {
      const check = checkDots({ kind, key, to: value, source: values(actor._source.system[group]), log: actor._source.system.xp.log });
      if (!check.allowed && !(await refuseUnlessGM(game.i18n.format(`DTD.Creation.Error.${check.reason}`, { label })))) return false;
    }
  }
  await actor.update({ [path]: value });
  return true;
}

/**
 * End character creation — GM only (FR-012). Steps not done are listed for confirmation.
 * @param {Actor} actor
 * @returns {Promise<boolean>}
 */
export async function endCreation(actor) {
  if (!game.user.isGM || !actor.system.creation.active) return false;
  const open = creationSummary(actor).steps.filter((step) => step.status !== "done" && step.key !== "languages");
  if (open.length) {
    const items = open.map((step) => `<li>${localize(`DTD.Creation.Step.${step.key}`)}</li>`).join("");
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: localize("DTD.Creation.EndTitle") },
      content: `<p>${localize("DTD.Creation.EndPending")}</p><ul>${items}</ul>`,
      rejectClose: false
    });
    if (!confirmed) return false;
  }
  await actor.update({ "system.creation.active": false });
  return true;
}
