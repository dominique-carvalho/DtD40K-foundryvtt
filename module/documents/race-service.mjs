import { CHARACTERISTICS, GROUPS, SKILLS } from "../config.mjs";
import { buildRaceEffects, characteristicOptions, defaultChoice, needsChoice, validateRaceChoice } from "../rules/race.mjs";
import { syncPerfection } from "./exaltation-service.mjs";

/**
 * Applying, reconfiguring and removing a character's race (spec 002, US2).
 * Contract: specs/002-race-compendium/contracts/foundry-api.md ("Serviço").
 */

const CHOICE_TEMPLATE = "systems/dtd40k/templates/dialog/race-choice.hbs";
const localize = (key) => game.i18n.localize(key);

/**
 * The race item of an actor, if any.
 * @param {Actor} actor
 * @returns {Item|null}
 */
export function getRace(actor) {
  return actor.items.find((item) => item.type === "race") ?? null;
}

/**
 * Ask the player for the characteristic (and skills) that receive the racial bonus.
 * Invalid submissions are reported and the dialog is shown again.
 * @param {Item|{name: string, system: object}} race
 * @param {{characteristic: string, skills: string[]}} [current]
 * @returns {Promise<{characteristic: string, skills: string[]}|null>}  null if cancelled
 */
export async function promptRaceChoice(race, current = defaultChoice(race.system)) {
  const system = race.system;
  let choice = current;
  for (;;) {
    const content = await foundry.applications.handlebars.renderTemplate(CHOICE_TEMPLATE, choiceContext(race, choice));
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.format("DTD.Race.ChooseTitle", { race: race.name }) },
      classes: ["dtd40k", "race-choice-dialog"],
      position: { width: 560 },
      content,
      render: (event, dialog) => limitSkillChoice(dialog.element, system.skillBonus.choose),
      buttons: [
        {
          action: "confirm",
          label: localize("DTD.Race.Confirm"),
          icon: "fa-solid fa-check",
          default: true,
          callback: (event, button) => readChoice(button.form)
        },
        { action: "cancel", label: localize("Cancel"), icon: "fa-solid fa-xmark" }
      ],
      rejectClose: false
    });
    if (!result || result === "cancel") return null;
    if (validateRaceChoice(system, result).valid) return result;
    ui.notifications.warn(localize("DTD.Race.InvalidChoice"));
    choice = result;
  }
}

/**
 * Apply a race to a character, replacing any previous one (FR-009 to FR-011).
 * @param {Actor} actor
 * @param {Item} raceItem  race dropped from a compendium, the sidebar or another actor
 * @returns {Promise<Item|null>}  the new embedded race, or null if cancelled or refused
 */
export async function applyRace(actor, raceItem) {
  if (actor.type !== "character") {
    ui.notifications.warn(localize("DTD.Race.NotCharacter"));
    return null;
  }

  const choice = needsChoice(raceItem.system) ? await promptRaceChoice(raceItem) : defaultChoice(raceItem.system);
  if (!choice) return null;

  const data = raceItem.toObject();
  delete data._id;
  data.system.choice = choice;
  data.system.power.uses = { spent: 0 };
  data.effects = racialEffectData(data, choice);

  // Validate before touching the current race, so a bad entry never leaves the character raceless (research R6).
  try {
    new Item.implementation(data, { parent: actor }).validate({ strict: true });
  } catch (error) {
    console.error("dtd40k | Invalid race data", error);
    ui.notifications.warn(localize("DTD.Race.InvalidChoice"));
    return null;
  }

  await deleteCurrentRace(actor);
  const [created] = await actor.createEmbeddedDocuments("Item", [data]);
  if (created?.system.power.automation === "heroicHeritage") {
    await actor.update({ "system.heroPoints.value": actor._source.system.heroPoints.value + 1 });
  }
  // A Paragon swaps the racial asset granted by Perfection (spec 004).
  if (created) await syncPerfection(actor);
  return created ?? null;
}

/**
 * Re-open the choice of the current race and swap its racial effects (FR-013).
 * @param {Actor} actor
 * @returns {Promise<Item|null>}
 */
export async function reconfigureRace(actor) {
  const race = getRace(actor);
  if (!race || !needsChoice(race.system)) return race;
  const choice = await promptRaceChoice(race, race.system.choice);
  if (!choice) return null;

  const racialIds = race.effects.filter((effect) => effect.getFlag("dtd40k", "racial")).map((effect) => effect.id);
  await race.deleteEmbeddedDocuments("ActiveEffect", racialIds);
  await race.createEmbeddedDocuments("ActiveEffect", racialEffectData(race.toObject(), choice));
  await race.update({ "system.choice": choice });
  return race;
}

/**
 * Remove the character's race and all its effects, after confirmation (FR-012).
 * @param {Actor} actor
 * @returns {Promise<void>}
 */
export async function removeRace(actor) {
  const race = getRace(actor);
  if (!race) return;
  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: { title: localize("DTD.Race.Remove") },
    content: `<p>${game.i18n.format("DTD.Race.RemoveConfirm", { race: race.name })}</p>`,
    rejectClose: false
  });
  if (!confirmed) return;
  await deleteCurrentRace(actor);
  await syncPerfection(actor);
}

/* -------------------------------------------- */

/**
 * Delete the current race and keep current Hero Points within the new maximum.
 * @param {Actor} actor
 */
async function deleteCurrentRace(actor) {
  const ids = actor.items.filter((item) => item.type === "race").map((item) => item.id);
  if (!ids.length) return;
  await actor.deleteEmbeddedDocuments("Item", ids);
  const max = actor.system.heroPoints.max;
  if (actor._source.system.heroPoints.value > max) await actor.update({ "system.heroPoints.value": max });
}

/**
 * ActiveEffect creation data for a race and choice (one effect per modifier).
 * @param {object} raceData  race item source data
 * @param {{characteristic: string, skills: string[]}} choice
 * @returns {object[]}
 */
function racialEffectData(raceData, choice) {
  return buildRaceEffects(raceData.system, choice).map((effect) => ({
    name: effectName(raceData, effect.label),
    img: raceData.img,
    transfer: true,
    changes: effect.changes,
    flags: { dtd40k: { racial: effect.racial } }
  }));
}

/**
 * Localized effect name, e.g. "Eldarin: +1 Wisdom".
 * @param {object} raceData
 * @param {{type: string, key?: string}} label
 */
function effectName(raceData, label) {
  const names = {
    size: () => String(raceData.system.size),
    characteristic: () => localize(CHARACTERISTICS[label.key].label),
    skill: () => localize(SKILLS[label.key].label),
    power: () => raceData.system.power.name
  };
  return game.i18n.format(`DTD.Race.Effect.${label.type}`, { race: raceData.name, name: names[label.type]() });
}

/**
 * Template data for the choice dialog.
 * @param {{name: string, system: object}} race
 * @param {{characteristic: string, skills: string[]}} choice
 */
function choiceContext(race, choice) {
  const system = race.system;
  const fixed = new Set(system.skillBonus.skills);
  const chosen = new Set(choice.skills);
  return {
    intro: game.i18n.format("DTD.Race.ChooseIntro", { race: race.name }),
    choose: system.skillBonus.choose,
    chooseSkillsLabel: game.i18n.format("DTD.Race.ChooseSkills", { n: system.skillBonus.choose }),
    characteristics: characteristicOptions(system).map((key) => ({
      key,
      label: localize(CHARACTERISTICS[key].label),
      selected: key === choice.characteristic
    })),
    skillGroups: GROUPS.map((group) => ({
      label: localize(`DTD.SkillGroup.${group}`),
      options: Object.entries(SKILLS)
        .filter(([, def]) => def.group === group)
        .map(([key, def]) => ({ key, label: localize(def.label), fixed: fixed.has(key), selected: fixed.has(key) || chosen.has(key) }))
    }))
  };
}

/**
 * Read the dialog form into a choice.
 * @param {HTMLFormElement} form
 * @returns {{characteristic: string, skills: string[]}}
 */
function readChoice(form) {
  const characteristic = form.querySelector("input[name='characteristic']:checked")?.value ?? "";
  const skills = [...form.querySelectorAll("input[name='skills']:checked:not(:disabled)")].map((input) => input.value);
  return { characteristic, skills };
}

/**
 * Disable further skill checkboxes once `choose` skills are picked.
 * @param {HTMLElement} root
 * @param {number} choose
 */
function limitSkillChoice(root, choose) {
  if (!choose) return;
  const boxes = [...root.querySelectorAll("input[name='skills']:not(:disabled)")];
  const update = () => {
    const full = boxes.filter((box) => box.checked).length >= choose;
    for (const box of boxes) box.disabled = full && !box.checked;
  };
  for (const box of boxes) box.addEventListener("change", update);
  update();
}
