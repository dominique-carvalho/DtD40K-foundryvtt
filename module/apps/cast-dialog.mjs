import { maxPush } from "../rules/magic.mjs";

/**
 * Focus Power dialog (spec 009, research R5): casting strength, Push, TN, dice modifiers, the Implement Focus reroll
 * and the roll mode. Foundry v13 DialogV2.
 */
const TEMPLATE = "systems/dtd40k/templates/dialog/cast-dialog.hbs";

/**
 * @param {{title: string, tn: number|null, tested: boolean, combo: boolean, implementFocus: boolean}} args
 * @returns {Promise<{strength: string, push: number, tn: number|null, modifiers: object, implementReroll: boolean, rollMode: string}|null>}
 */
export async function promptCastOptions({ title, tn, tested, combo, implementFocus }) {
  const currentMode = game.settings.get("core", "rollMode");
  const content = await foundry.applications.handlebars.renderTemplate(TEMPLATE, {
    tn: tn ?? "",
    maxPush: maxPush(tested),
    tested,
    combo,
    implementFocus,
    strengths: ["fettered", "unfettered", "push"].filter((key) => !(combo && key === "fettered")).map((key) => ({ key, selected: key === "unfettered" })),
    rollModes: Object.entries(CONFIG.Dice.rollModes).map(([key, mode]) => ({ key, label: mode.label ?? mode, selected: key === currentMode }))
  });
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title },
    classes: ["dtd40k", "roll-dialog-app", "cast-dialog-app"],
    position: { width: 420 },
    content,
    rejectClose: false,
    buttons: [
      { action: "cast", label: "DTD.Magic.Cast", icon: "fa-solid fa-wand-sparkles", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!result || typeof result !== "object") return null;
  return {
    strength: result.strength || "unfettered",
    push: Number(result.push) || 0,
    tn: result.tn === "" || result.tn === undefined || result.tn === null ? null : Number(result.tn),
    modifiers: { rolled: result.rolledMod ?? 0, kept: result.keptMod ?? 0, flat: result.flatMod ?? 0, freeRaises: result.freeRaises ?? 0, stuntDice: result.stuntDice ?? 0 },
    implementReroll: Boolean(result.implementReroll),
    rollMode: result.rollMode || currentMode
  };
}
