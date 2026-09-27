/**
 * Attack dialog (spec 007, research R7): the roll-dialog fields of the 001 plus the weapon options
 * (range, aim, fire mode, brace, one hand, thrown). Foundry v13 DialogV2.
 */
const TEMPLATE = "systems/dtd40k/templates/dialog/attack-dialog.hbs";

/**
 * @typedef {object} AttackOptions
 * @property {number|null} tn
 * @property {{rolled: number, kept: number, flat: number, freeRaises: number, stuntDice: number}} modifiers
 * @property {boolean} specialty
 * @property {string} rollMode
 * @property {{range: string, aim: number, mode: string, braced: boolean, oneHanded: boolean, thrown: boolean}} weapon
 * @property {string} ammoId   launcher: grenade or missile used
 */

/**
 * Ask how to attack.
 * @param {object} args
 * @param {Actor} args.actor
 * @param {string} args.title
 * @param {string} args.skillKey
 * @param {{melee: boolean, canThrow: boolean, auto: boolean, single: boolean, heavy: boolean, basic: boolean}} args.shape
 * @param {{id: string, name: string}[]} [args.ammo]  launcher ammunition carried
 * @param {number|null} [args.tn]
 * @param {object} [args.situation]  defaults from the target (spec 008)
 * @param {object} [args.action]     combat action (calledShot shows the location choice)
 * @returns {Promise<AttackOptions|null>}
 */
export async function promptAttackOptions({ actor, title, skillKey, shape, ammo = [], tn = null, situation = {}, action = {} }) {
  const currentMode = game.settings.get("core", "rollMode");
  const skill = actor.system.skills[skillKey];
  const content = await foundry.applications.handlebars.renderTemplate(TEMPLATE, {
    tn: tn ?? "",
    shape,
    ammo,
    specialtyList: skill.specialties.join(", "),
    ranges: ["pointBlank", "short", "normal", "long", "extreme"].map((key) => ({ key, selected: key === "normal" })),
    situation,
    calledShot: Boolean(action.calledShot),
    aimDefault: action.aim ? 1 : 0,
    locations: ["head", "body", "gizzards", "leftArm", "rightArm", "leftLeg", "rightLeg"],
    rollModes: Object.entries(CONFIG.Dice.rollModes).map(([key, mode]) => ({
      key, label: mode.label ?? mode, selected: key === currentMode
    }))
  });
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title },
    classes: ["dtd40k", "roll-dialog-app", "attack-dialog-app"],
    position: { width: 440 },
    content,
    rejectClose: false,
    buttons: [
      {
        action: "roll",
        label: "DTD.Roll.Dialog.Roll",
        icon: "fa-solid fa-crosshairs",
        default: true,
        callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
      },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!result || typeof result !== "object") return null;
  return {
    tn: result.tn ?? null,
    modifiers: {
      rolled: result.rolledMod ?? 0,
      kept: result.keptMod ?? 0,
      flat: result.flatMod ?? 0,
      freeRaises: result.freeRaises ?? 0,
      stuntDice: result.stuntDice ?? 0
    },
    specialty: Boolean(result.specialty),
    rollMode: result.rollMode || currentMode,
    weapon: {
      range: result.range || "normal",
      aim: Number(result.aim) || 0,
      mode: result.mode || "single",
      braced: Boolean(result.braced),
      oneHanded: Boolean(result.oneHanded),
      thrown: Boolean(result.thrown)
    },
    ammoId: result.ammoId || "",
    situation: {
      advantage: Boolean(result.advantage),
      targetProne: Boolean(result.targetProne),
      targetRan: Boolean(result.targetRan),
      intoMelee: Boolean(result.intoMelee),
      gangUp: Number(result.gangUp) || 0,
      terrain: result.terrain || "",
      calledLocation: result.calledLocation || ""
    }
  };
}
