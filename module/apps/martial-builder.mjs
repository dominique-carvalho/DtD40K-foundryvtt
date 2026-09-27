import { MARTIAL_SCHOOLS } from "../config.mjs";
import { attackCost, budget, options as builderOptions, points } from "../rules/martial.mjs";
import { costLabel } from "./martial-school-sheet.mjs";

/**
 * Special Attack / Trick Shot builder (spec 010, FR-007 to FR-009; pp. 261, 273): name, base action, Advantages
 * with purchases or a cost choice, Restrictions, and the style point budget updated as the player picks.
 * Foundry v13 DialogV2.
 */
const TEMPLATE = "systems/dtd40k/templates/dialog/martial-builder.hbs";
const localize = (key) => game.i18n.localize(key);

/** Rows of the builder for a list of options, with the current picks. */
function rows(list, picks, prefix) {
  return list.map((option, index) => {
    const pick = picks.find((p) => p.ref === option.ref);
    const variable = option.variableCost?.length ? option.variableCost : null;
    return {
      index, prefix, ref: option.ref, name: option.name, effect: option.effect,
      source: option.school ? `${localize(MARTIAL_SCHOOLS[option.school].label)} ${option.rank}` : localize("DTD.Martial.Universal"),
      cost: costLabel(option),
      perPoint: option.perPoint,
      count: pick?.count ?? 0,
      checked: Boolean(pick),
      variable: variable?.includes(0) ? null : variable?.map((c) => ({ value: c, selected: pick?.choice === c })),
      free: Boolean(variable?.includes(0)),
      choice: pick?.choice ?? 0
    };
  });
}

/**
 * Read the picks of one list from the form.
 * @param {HTMLFormElement} form
 * @param {object[]} list  options
 * @param {string} prefix  "adv" | "res"
 * @returns {{ref: string, count: number, choice: number}[]}
 */
function readPicks(form, list, prefix) {
  const picks = [];
  list.forEach((option, index) => {
    const control = form.elements[`${prefix}-${index}`];
    if (!control) return;
    const count = control.type === "checkbox" ? (control.checked ? 1 : 0) : Math.max(0, Number(control.value) || 0);
    if (!count) return;
    const choiceControl = form.elements[`${prefix}-${index}-choice`];
    const choice = choiceControl ? Math.max(0, Number(choiceControl.value) || 0) : 0;
    picks.push({ ref: option.ref, count, choice });
  });
  return picks;
}

/** Style points of a list of picks. */
const sum = (picks, list) => picks.reduce((total, pick) => total + points(list.find((o) => o.ref === pick.ref), pick.count, pick.choice), 0);

/**
 * Open the builder.
 * @param {{actor: Actor, schools: object, ranks: Record<string, number>, kind: "special"|"trick", attack?: object|null}} args
 * @returns {Promise<{name: string, kind: string, action: string, advantages: object[], restrictions: object[]}|null>}
 */
export async function promptBuilder({ actor, schools, ranks, kind, attack = null }) {
  const list = builderOptions({ schools, ranks, kind });
  const level = kind === "trick" ? actor.system.martial.levels.gunslingerLevel : actor.system.martial.levels.adeptLevel;
  const paid = attack?.paid ?? 0;
  const content = await foundry.applications.handlebars.renderTemplate(TEMPLATE, {
    name: attack?.name ?? "",
    kindLabel: localize(`DTD.Martial.AttackKind.${kind}`),
    level,
    actions: list.actions.map((a) => ({ key: a.key, name: a.name.replace(/^Action \((.*)\)$/, "$1"), selected: a.key === (attack?.action ?? "standardAttack") })),
    advantages: rows(list.advantages, attack?.advantages ?? [], "adv"),
    restrictions: rows(list.restrictions, attack?.restrictions ?? [], "res")
  });

  /** Budget line, updated on every change. */
  const refresh = (form) => {
    const advantages = sum(readPicks(form, list.advantages, "adv"), list.advantages);
    const restrictions = sum(readPicks(form, list.restrictions, "res"), list.restrictions);
    const check = budget({ advantages, restrictions, level });
    const line = form.querySelector(".martial-budget");
    if (!line) return;
    line.textContent = game.i18n.format("DTD.Martial.BudgetLine", {
      advantages, restrictions, level, max: 2 * level, cost: attackCost({ points: advantages, paid })
    }) + (check.ok ? "" : ` — ${game.i18n.format(`DTD.Martial.Budget.${check.reason}`, { level, missing: check.missing })}`);
    line.classList.toggle("warning", !check.ok);
  };

  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.format("DTD.Martial.BuilderTitle", { kind: localize(`DTD.Martial.AttackKind.${kind}`) }) },
    classes: ["dtd40k", "roll-dialog-app", "martial-builder-app"],
    position: { width: 640, height: 720 },
    content,
    rejectClose: false,
    render: (event, dialog) => {
      const root = dialog instanceof HTMLElement ? dialog : dialog?.element ?? event?.target?.element;
      const form = root?.querySelector("form") ?? root;
      if (!form) return;
      form.addEventListener("change", () => refresh(form));
      form.addEventListener("input", () => refresh(form));
      refresh(form);
    },
    buttons: [
      {
        action: "save", label: "DTD.Martial.Save", icon: "fa-solid fa-floppy-disk", default: true,
        callback: (event, button) => {
          const form = button.form;
          return {
            name: form.elements.name.value.trim(),
            action: form.elements.action.value,
            advantages: readPicks(form, list.advantages, "adv"),
            restrictions: readPicks(form, list.restrictions, "res")
          };
        }
      },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!result || typeof result !== "object") return null;
  if (!result.name) {
    ui.notifications.warn(localize("DTD.Martial.NeedName"));
    return null;
  }
  return { ...result, kind };
}
