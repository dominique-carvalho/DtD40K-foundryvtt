import { UNTIL_NEXT_TURN } from "../config.mjs";
import { immunities } from "../rules/npc.mjs";
import { fatigueCheck, rest as restRule } from "../rules/healing.mjs";

/**
 * Conditions, Fatigue, death and rest (spec 008, US3; research R3/R8).
 * Contract: specs/008-combat/contracts/foundry-api.md ("condition-service").
 */

const localize = (key) => game.i18n.localize(key);

/**
 * Roll a number or a dice formula ("1d5").
 * @param {string|number|null} value
 * @returns {Promise<number>}
 */
export async function rollValue(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  const roll = await new Roll(String(value)).evaluate();
  return roll.total;
}

/**
 * Turn a condition on or off. `rounds` makes it end at the start of the character's turn that many rounds later;
 * `untilTurnOf` ends it at the start of that combatant's next turn (action effects).
 * @param {Actor} actor
 * @param {string} id  status id
 * @param {{active?: boolean, rounds?: string|number|null, untilTurnOf?: string}} [options]
 * @returns {Promise<ActiveEffect|boolean|undefined>}
 */
export async function toggleCondition(actor, id, { active, rounds = null, untilTurnOf } = {}) {
  const on = active ?? !actor.statuses.has(id);
  if (!on) return actor.toggleStatusEffect(id, { active: false });
  // Undead and Stuff of Nightmares ignore stun and bleeding (spec 012, p. 522).
  if (actor.type === "npc" && immunities(actor.system.npc.traits).includes(id)) {
    const name = game.i18n.localize(CONFIG.statusEffects.find((s) => s.id === id)?.name ?? id);
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${game.i18n.format("DTD.Npc.Immune", { name: actor.name, condition: name })}</p>` });
    return undefined;
  }
  const existing = actor.effects.find((effect) => effect.statuses.has(id));
  const effect = existing ?? await actor.toggleStatusEffect(id, { active: true, overlay: id === "dead" });
  if (!(effect instanceof ActiveEffect)) return effect;
  const combat = game.combat;
  const flags = {};
  const n = await rollValue(rounds);
  if (n > 0 && combat?.started) flags.expiresRound = combat.round + n;
  if (n > 0) flags.rounds = n;
  if (untilTurnOf || UNTIL_NEXT_TURN.includes(id)) {
    flags.untilTurnOf = untilTurnOf ?? combat?.combatants.find((c) => c.actor === actor)?.id ?? "";
  }
  if (Object.keys(flags).length) await effect.update({ "flags.dtd40k": flags });
  return effect;
}

/**
 * In Cover (spec 017, FR-014; p. 433): ask the Armor Points and the covered locations, stored on the actor's tokens
 * where the damage of spec 008 reads them.
 * @param {Actor} actor
 */
export async function promptCover(actor) {
  const { COVER_AP } = CONFIG.DTD;
  const locations = ["head", "body", "gizzards", "arms", "legs"];
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("DTD.Condition.inCover") }, rejectClose: false,
    content: `<div class="form-group"><label>${game.i18n.localize("DTD.Cover.Ap")}</label><select name="ap">${COVER_AP.map((ap) => `<option value="${ap}">${ap}</option>`).join("")}</select></div>
      <fieldset><legend>${game.i18n.localize("DTD.Cover.Locations")}</legend>${locations.map((loc) => `<label><input type="checkbox" name="loc-${loc}" ${loc === "head" ? "" : "checked"}> ${game.i18n.localize(`DTD.Location.${loc}`)}</label>`).join(" ")}</fieldset>`,
    buttons: [{ action: "ok", label: "DTD.Cover.Set", default: true, callback: (event, button) => ({
      ap: Number(button.form.elements.ap.value), locations: locations.filter((loc) => button.form.elements[`loc-${loc}`].checked)
    }) }]
  });
  if (choice) await setCover(actor, choice);
}

/**
 * Store (or clear) the cover of an actor on its tokens.
 * @param {Actor} actor
 * @param {{ap: number, locations: string[]}|null} cover
 */
export async function setCover(actor, cover) {
  for (const token of actor.getActiveTokens(false, true)) {
    if (!token.isOwner) continue;
    if (cover) await token.setFlag("dtd40k", "cover", cover);
    else if (token.getFlag("dtd40k", "cover")) await token.unsetFlag("dtd40k", "cover");
  }
}

/**
 * Add Fatigue; above Constitution the character falls Unconscious and Fatigue returns to Con (p. 443).
 * @param {Actor} actor
 * @param {number} amount
 */
export async function addFatigue(actor, amount) {
  if (!amount) return;
  const con = actor.system.characteristics.con.value;
  const check = fatigueCheck({ fatigue: actor.system.fatigue.value + amount, con });
  await actor.update({ "system.fatigue.value": check.fatigue });
  if (check.unconscious) {
    await toggleCondition(actor, "unconscious", { active: true });
    ui.notifications.info(game.i18n.format("DTD.Combat.FatigueOut", { name: actor.name, hours: check.hours }));
  }
}

/**
 * Burn a Hero Point to survive (p. 420): −1 to the maximum for good; Dead becomes Unconscious.
 * @param {Actor} actor
 * @returns {Promise<boolean>}
 */
export async function burnHeroPoint(actor) {
  const hero = actor.system.heroPoints;
  if (hero.max < 1) {
    ui.notifications.warn(localize("DTD.Combat.NoHeroPoint"));
    return false;
  }
  await actor.update({ "system.heroPoints.max": hero.max - 1, "system.heroPoints.value": Math.min(hero.value, hero.max - 1) });
  await toggleCondition(actor, "dead", { active: false });
  await toggleCondition(actor, "unconscious", { active: true });
  ui.notifications.info(game.i18n.format("DTD.Combat.HeroPointBurned", { name: actor.name }));
  return true;
}

/**
 * GM rest dialog (FR-017): heals by the wound state.
 * @param {Actor} actor
 */
export async function rest(actor) {
  if (!game.user.isGM) return;
  const content = await foundry.applications.handlebars.renderTemplate("systems/dtd40k/templates/dialog/rest-dialog.hbs", {
    state: localize(`DTD.Combat.Wound.${actor.system.combat.woundState}`)
  });
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.format("DTD.Combat.RestTitle", { name: actor.name }) },
    classes: ["dtd40k", "rest-dialog-app"],
    content,
    rejectClose: false,
    buttons: [
      { action: "ok", label: "DTD.Combat.Rest", icon: "fa-solid fa-bed", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!choice || typeof choice !== "object") return;
  const system = actor.system;
  const healed = restRule({
    state: system.combat.woundState, period: choice.period || "day", count: Number(choice.count) || 1,
    full: Boolean(choice.full), medical: Boolean(choice.medical), con: system.characteristics.con.value
  });
  const hp = Math.min(system.hp.max, system.hp.value + healed.hp);
  const critical = Math.max(0, system.critical.value - healed.critical);
  await actor.update({ "system.hp.value": hp, "system.critical.value": critical });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p>${game.i18n.format("DTD.Combat.Rested", { name: actor.name, hp: hp - system.hp.value, critical: system.critical.value - critical })}</p>`
  });
}
