/**
 * Roll dialog (US3): TN, characteristic choice, modifiers, free raises, stunt level (+1k1 each),
 * specialty and roll mode. Foundry v13 DialogV2.
 */
const TEMPLATE = "systems/dtd40k/templates/dialog/roll-dialog.hbs";

/**
 * @typedef {object} RollOptions
 * @property {string|undefined} characteristic   chosen characteristic key (skill tests only)
 * @property {number|null} tn
 * @property {{rolled: number, kept: number, flat: number, freeRaises: number, stuntDice: number}} modifiers
 * @property {boolean} specialty                  reroll 1s once
 * @property {string} rollMode                    one of CONFIG.Dice.rollModes
 */

/**
 * Ask the user how to roll a test.
 * @param {object} args
 * @param {Actor} args.actor
 * @param {string} [args.skillKey]           skill key; omit for a characteristic test
 * @param {string} args.characteristicKey    default characteristic
 * @param {number|null} [args.tn=15]
 * @returns {Promise<RollOptions|null>}     null when the dialog is cancelled
 */
export async function promptRollOptions({ actor, skillKey, characteristicKey, tn = 15 }) {
  const { CHARACTERISTICS, SKILLS } = CONFIG.DTD;
  const system = actor.system;
  const isSkill = Boolean(skillKey);
  const trait = isSkill ? system.skills[skillKey] : system.characteristics[characteristicKey];
  const traitLabel = game.i18n.localize(isSkill ? SKILLS[skillKey].label : CHARACTERISTICS[characteristicKey].label);
  const currentMode = game.settings.get("core", "rollMode");

  const context = {
    summary: `${traitLabel} (${trait.value})`,
    tn: tn ?? "",
    characteristics: isSkill
      ? Object.entries(CHARACTERISTICS).map(([key, def]) => ({
        key,
        label: game.i18n.localize(def.label),
        value: system.characteristics[key].value,
        selected: key === characteristicKey
      }))
      : null,
    specialties: trait.specialties,
    specialtyList: trait.specialties.join(", "),
    rollModes: Object.entries(CONFIG.Dice.rollModes).map(([key, mode]) => ({
      key,
      label: mode.label ?? mode,
      selected: key === currentMode
    }))
  };

  const content = await foundry.applications.handlebars.renderTemplate(TEMPLATE, context);
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.format("DTD.Roll.Dialog.Title", { name: traitLabel }) },
    classes: ["dtd40k", "roll-dialog-app"],
    position: { width: 420 },
    content,
    rejectClose: false,
    buttons: [
      {
        action: "roll",
        label: "DTD.Roll.Dialog.Roll",
        icon: "fa-solid fa-dice-d10",
        default: true,
        callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
      },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });

  if (!result || typeof result !== "object") return null;
  return {
    characteristic: isSkill ? result.characteristic || characteristicKey : undefined,
    tn: result.tn ?? null,
    modifiers: {
      rolled: result.rolledMod ?? 0,
      kept: result.keptMod ?? 0,
      flat: result.flatMod ?? 0,
      freeRaises: result.freeRaises ?? 0,
      stuntDice: result.stuntDice ?? 0
    },
    specialty: Boolean(result.specialty),
    rollMode: result.rollMode || currentMode
  };
}
