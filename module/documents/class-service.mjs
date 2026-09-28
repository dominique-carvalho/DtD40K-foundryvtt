import { SKILLS } from "../config.mjs";
import { buildCompletionEffects, checkClassEntry, classProgress, completionSkillOptions } from "../rules/class.mjs";
import { grantFeats, releaseGrants } from "./feat-service.mjs";

/**
 * Starting, completing and removing a character's classes (spec 006, US2).
 * Contract: specs/006-classes-xp/contracts/foundry-api.md ("Serviços").
 */

const BONUS_TEMPLATE = "systems/dtd40k/templates/dialog/class-bonus.hbs";
const localize = (key) => game.i18n.localize(key);

/**
 * Classes of a character, in the order they were started.
 * @param {Actor} actor
 * @returns {Item[]}
 */
export function getClasses(actor) {
  return actor.items.filter((item) => item.type === "class").sort((a, b) => a.system.startedAt - b.system.startedAt);
}

/**
 * The class being worked on, if any.
 * @param {Actor} actor
 * @returns {Item|null}
 */
export function getCurrentClass(actor) {
  return getClasses(actor).find((item) => item.system.status === "current") ?? null;
}

/**
 * Feats of the character (all categories but Exalted Assets), for list matching.
 * @param {Actor} actor
 */
const ownedFeats = (actor) => actor.items.filter((item) => item.type === "feat" && item.system.category !== "exaltedAsset");

/**
 * Yes/no confirmation dialog.
 * @param {string} title
 * @param {string} content
 */
async function confirm(title, content) {
  return Boolean(await foundry.applications.api.DialogV2.confirm({ window: { title }, content, rejectClose: false }));
}

/**
 * Human-readable text of an entry check.
 * @param {object} problem
 * @returns {string}
 */
function describe(problem) {
  const skillName = (key) => localize(SKILLS[key].label);
  switch (problem.type) {
    case "missingSkills":
      return game.i18n.format("DTD.Class.Error.missingSkills", {
        list: problem.missing.map((req) => `${req.keys.map(skillName).join(` ${localize("DTD.Class.Or")} `)} ${req.value}`).join(", ")
      });
    case "missingFeats": return game.i18n.format("DTD.Class.Error.missingFeats", { list: problem.missing.join(", ") });
    case "schools": return game.i18n.format("DTD.Class.Warning.schools", { list: problem.schools.join(", ") });
    case "text": return game.i18n.format("DTD.Class.Warning.text", { text: problem.text });
    default: return game.i18n.format(`DTD.Class.Error.${problem.type}`, problem);
  }
}

/**
 * Start a class (FR-004, FR-005): check Level, prerequisites and the current class; the GM may start it
 * anyway. The new class becomes the current one.
 * @param {Actor} actor
 * @param {Item} classItem  dropped from a compendium, the sidebar or another actor
 * @returns {Promise<Item|null>}
 */
export async function startClass(actor, classItem) {
  if (actor.type !== "character") {
    ui.notifications.warn(localize("DTD.Class.NotCharacter"));
    return null;
  }
  const classes = getClasses(actor);
  const check = checkClassEntry({
    cls: classItem,
    level: actor.system.level,
    classes,
    skills: actor.system.skills,
    feats: ownedFeats(actor),
    creation: actor.system.creation.active
  });
  if (check.errors.length) {
    const message = check.errors.map(describe).join(" ");
    ui.notifications.warn(message);
    if (!game.user.isGM || !(await confirm(localize("DTD.Class.GMOverrideTitle"), `<p>${message}</p><p>${localize("DTD.Class.GMOverride")}</p>`))) {
      return null;
    }
  }
  if (check.warnings.length) {
    const message = check.warnings.map(describe).map((text) => `<p>${text}</p>`).join("");
    if (!(await confirm(localize("DTD.Class.ConfirmTitle"), message))) return null;
  }

  // When the GM overrides "complete the current class first", the open class is completed (with its bonus).
  const open = getCurrentClass(actor);
  if (open) await completeClass(actor, open);

  const data = classItem.toObject();
  delete data._id;
  delete data.folder;
  Object.assign(data.system, { status: "current", startedAt: Math.max(0, ...classes.map((item) => item.system.startedAt)) + 1 });
  data.system.completion.selection = { skill: "", specialty: "" };
  data.effects = [];
  const [created] = await actor.createEmbeddedDocuments("Item", [data]);
  if (created) await syncClassCompletion(actor);
  return created ?? null;
}

/**
 * Complete the current class when all its mandatory feats are owned (FR-008). Called after any feat is
 * created on the character (DtdItem#_onCreate) and after a class is started.
 * @param {Actor} actor
 */
export async function syncClassCompletion(actor) {
  const current = getCurrentClass(actor);
  if (!current) return;
  if (classProgress(current.system, ownedFeats(actor)).complete) await completeClass(actor, current);
}

/**
 * Mark a class as completed and apply its bonus (FR-008, FR-009): ask for the skill (and specialty)
 * when the bonus needs it, add the effects and grant the feats.
 * @param {Actor} actor
 * @param {Item} classItem
 */
export async function completeClass(actor, classItem) {
  const completion = classItem.system.completion;
  let selection = { skill: "", specialty: "" };
  if (["specialty", "skillDot"].includes(completion.automation)) {
    const options = completionSkillOptions(completion, actor.system.skills, actor.system.level);
    selection = await promptBonusChoice(classItem, options, completion.automation === "specialty");
    if (!selection) selection = { skill: "", specialty: "" };
  }
  const effects = buildCompletionEffects({ ...completion, selection }).map((effect) => ({
    name: game.i18n.format("DTD.Class.BonusEffect", { class: classItem.name, bonus: localize(`DTD.Class.Completion.${effect.bonus}`) }),
    img: classItem.img,
    transfer: true,
    changes: effect.changes,
    flags: { dtd40k: { classBonus: effect.bonus } }
  }));
  await classItem.update({ "system.status": "completed", "system.completion.selection": selection });
  if (effects.length) await classItem.createEmbeddedDocuments("ActiveEffect", effects);
  await grantFeats(actor, classItem);
  ui.notifications.info(game.i18n.format("DTD.Class.CompletedNotice", { class: classItem.name }));
}

/**
 * Undo the completion of a class (GM only, FR-011): its bonus and granted feats leave.
 * @param {Actor} actor
 * @param {Item} classItem
 */
export async function uncompleteClass(actor, classItem) {
  if (!game.user.isGM) return;
  // Only one class can be current: the one in progress must be removed first.
  const open = getCurrentClass(actor);
  if (open && open.id !== classItem.id) {
    ui.notifications.warn(game.i18n.format("DTD.Class.Error.otherCurrent", { name: open.name }));
    return;
  }
  const ids = classItem.effects.filter((effect) => effect.getFlag("dtd40k", "classBonus")).map((effect) => effect.id);
  if (ids.length) await classItem.deleteEmbeddedDocuments("ActiveEffect", ids);
  await releaseGrants(actor, classItem.id);
  await classItem.update({ "system.status": "current", "system.completion.selection": { skill: "", specialty: "" } });
}

/**
 * Remove a class after confirmation; its bonus and granted feats leave with it (FR-011).
 * @param {Actor} actor
 * @param {string} itemId
 */
export async function removeClass(actor, itemId) {
  const classItem = actor.items.get(itemId);
  if (!classItem) return;
  if (!(await confirm(localize("DTD.Class.Remove"), `<p>${game.i18n.format("DTD.Class.RemoveConfirm", { class: classItem.name })}</p>`))) return;
  await classItem.delete();
}

/**
 * Ask which skill (and specialty) a completion bonus goes to.
 * @param {Item} classItem
 * @param {string[]} skillKeys
 * @param {boolean} withSpecialty
 * @returns {Promise<{skill: string, specialty: string}|null>}
 */
async function promptBonusChoice(classItem, skillKeys, withSpecialty) {
  const content = await foundry.applications.handlebars.renderTemplate(BONUS_TEMPLATE, {
    intro: game.i18n.format("DTD.Class.BonusIntro", { class: classItem.name }),
    skills: skillKeys.map((key) => ({ key, label: localize(SKILLS[key].label) })).sort((a, b) => a.label.localeCompare(b.label)),
    withSpecialty
  });
  for (;;) {
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.format("DTD.Class.BonusTitle", { class: classItem.name }) },
      classes: ["dtd40k", "class-bonus-dialog"],
      position: { width: 440 },
      content,
      buttons: [
        {
          action: "confirm",
          label: localize("DTD.Exaltation.Confirm"),
          icon: "fa-solid fa-check",
          default: true,
          callback: (event, button) => ({
            skill: button.form.querySelector("select[name='skill']")?.value ?? "",
            specialty: button.form.querySelector("input[name='specialty']")?.value.trim() ?? ""
          })
        },
        { action: "cancel", label: localize("Cancel"), icon: "fa-solid fa-xmark" }
      ],
      rejectClose: false
    });
    if (!result || result === "cancel") return null;
    if (result.skill && (!withSpecialty || result.specialty)) return result;
    ui.notifications.warn(localize("DTD.Class.Error.bonusChoice"));
  }
}
