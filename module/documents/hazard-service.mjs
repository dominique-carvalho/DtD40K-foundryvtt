import { ENCOUNTER_XP } from "../config.mjs";
import { rng } from "../dice/roll-service.mjs";
import {
  breathLimit, encounterXp, fallCategory, fallReduction, fallWounds, hazardImmunity, marchDistance, marchTn, suffocationStep
} from "../rules/hazards.mjs";
import { buildCharacteristicPool } from "../rules/pool.mjs";
import { runTest } from "../rules/test.mjs";
import { hitLocation } from "../rules/weapon.mjs";
import { addFatigue, toggleCondition } from "./condition-service.mjs";
import { requestGm } from "./gm-socket.mjs";
import { awardXp } from "./xp-service.mjs";

/**
 * Hazards and encounter XP (spec 018): the GM tool for falls, suffocation and forced marches on the selected tokens,
 * their chat cards, and the group XP award. Contract: specs/018-hazards-xp/contracts/foundry-api.md.
 */

const DIALOG_TEMPLATE = "systems/dtd40k/templates/apps/hazard-dialog.hbs";
const XP_TEMPLATE = "systems/dtd40k/templates/apps/xp-dialog.hbs";
const DAMAGE_TEMPLATE = "systems/dtd40k/templates/chat/damage-card.hbs";
const HAZARD_TEMPLATE = "systems/dtd40k/templates/chat/hazard-card.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
const render = (path, data) => foundry.applications.handlebars.renderTemplate(path, data);
const d = (faces) => Math.floor(rng() * faces) + 1;

/** What spares an actor (research R6). */
function immunityOf(actor, underwater = false) {
  return hazardImmunity({
    exaltation: actor.items.find((item) => item.type === "exaltation")?.name ?? "",
    traits: (actor.system.npc?.traits ?? []).map((trait) => trait.key),
    equipped: actor.items.filter((item) => item.system?.equipped).map((item) => item.name),
    underwater
  });
}

/** Tokens the GM selected that belong to characters or NPCs. */
function selectedTokens() {
  const tokens = (canvas.tokens?.controlled ?? []).map((token) => token.document)
    .filter((token) => ["character", "npc"].includes(token.actor?.type));
  if (!tokens.length) ui.notifications.warn(localize("DTD.Hazard.NoTokens"));
  return tokens;
}

/**
 * GM tool (FR-001): the hazard, its parameters and the tokens with their detected immunity, which the GM may change.
 */
export async function openHazardTool() {
  if (!game.user.isGM) return;
  const tokens = selectedTokens();
  if (!tokens.length) return;
  const rows = tokens.map((token) => ({ uuid: token.uuid, name: token.name, ...immunityOf(token.actor) }));
  const content = await render(DIALOG_TEMPLATE, { rows });
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: localize("DTD.Hazard.Title") }, classes: ["dtd40k"], content, rejectClose: false,
    buttons: [{
      action: "ok", label: "DTD.Hazard.Apply", default: true,
      callback: (event, button) => {
        const f = button.form.elements;
        return {
          hazard: f.hazard.value, category: f.category.value, intentional: f.intentional.checked, mode: f.mode.value,
          underwater: f.underwater.checked,
          immune: Object.fromEntries(rows.map((row) => [row.uuid, { breath: f[`breath-${row.uuid}`].checked, fatigue: f[`fatigue-${row.uuid}`].checked }]))
        };
      }
    }]
  });
  if (!choice) return;
  if (choice.hazard === "fall") return applyFall(tokens, choice);
  // Amphibious breathes under water (research R6).
  if (choice.underwater) for (const token of tokens) if (immunityOf(token.actor, true).breath) choice.immune[token.uuid].breath = true;
  return startHazard(choice.hazard, tokens, choice);
}

/**
 * A fall on each token (FR-002 to FR-004): a damage card of direct Impact wounds, the fatal fall's Critical Damage at
 * a random location, Catfall one step lower; Acrobatics offered on an intentional fall that is not fatal.
 * @param {TokenDocument[]} tokens
 * @param {{category: "short"|"long"|"fatal", intentional: boolean}} options
 */
export async function applyFall(tokens, { category, intentional }) {
  for (const token of tokens) {
    const actor = token.actor;
    const catfall = actor.hasFeat("Catfall");
    const final = fallCategory({ category, catfall });
    if (!final) {
      await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${format("DTD.Hazard.CatfallSafe", { name: actor.name })}</p>` });
      continue;
    }
    const dice = { d10: d(10), d5a: d(5), d5b: d(5) };
    const { wounds, extraCritical } = fallWounds({ category: final, ...dice });
    const location = hitLocation(d(10));
    const canReduce = intentional && final !== "fatal";
    const notes = [localize("DTD.Hazard.Direct")];
    if (catfall) notes.push(format("DTD.Hazard.Catfall", { name: actor.name }));
    if (extraCritical) notes.push(format("DTD.Hazard.FatalCritical", { value: extraCritical }));
    const content = await render(DAMAGE_TEMPLATE, {
      label: format("DTD.Hazard.FallOf", { name: actor.name, category: localize(`DTD.Hazard.Fall.${final}`) }),
      formula: final === "long" ? "1d10" : final === "fatal" ? "1d5 + 1d5" : "1",
      dice: final === "short" ? [] : [{ total: final === "long" ? dice.d10 : dice.d5a, kept: true }],
      total: wounds, type: localize("DTD.DamageType.I"), pen: 0, location: localize(`DTD.Location.${location}`), notes
    }) + (canReduce ? `<div class="card-buttons"><button type="button" data-dtd-action="fallAcrobatics"><i class="fa-solid fa-person-falling" inert></i> ${localize("DTD.Hazard.Acrobatics")}</button></div>` : "");
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }), content,
      flags: { dtd40k: {
        damage: {
          total: wounds, pen: 0, type: "I", location, tearing: false, unarmed: false, magic: false, raises: 0, blast: 0,
          resolve: { direct: true, extraCritical }, tokenUuids: [token.uuid]
        },
        fall: { category: final, intentional, actorUuid: actor.uuid, reduced: false }
      } }
    });
  }
}

/**
 * Acrobatics TN 15 on an intentional fall (FR-003): the owner rolls; the wounds drop by 1 plus 1 per raise, once.
 * @param {ChatMessage} message
 */
export async function fallAcrobatics(message) {
  const fall = message.getFlag("dtd40k", "fall");
  const actor = fall ? await foundry.utils.fromUuid(fall.actorUuid) : null;
  if (!actor?.isOwner || fall.reduced) return;
  const roll = await actor.rollSkill("acrobatics", { fastForward: true, tn: 15, label: localize("DTD.Hazard.Acrobatics") });
  const outcome = roll?.getFlag("dtd40k", "test")?.outcome;
  if (!outcome) return;
  const reduce = fallReduction({ category: fall.category, intentional: fall.intentional, success: outcome.success, raises: outcome.raises ?? 0 });
  if (game.user.isGM || message.isOwner) await reduceFall(message, reduce);
  else requestGm("hazard", { messageId: message.id, op: "fallReduce", reduce });
}

/**
 * Take the Acrobatics result off the fall card (GM or author).
 * @param {ChatMessage} message
 * @param {number} reduce
 */
export async function reduceFall(message, reduce) {
  const damage = message.getFlag("dtd40k", "damage");
  const total = Math.max(0, damage.total - reduce);
  await message.update({
    content: message.content.replace(/<div class="card-buttons">[\s\S]*?fallAcrobatics[\s\S]*?<\/div>/, `<p class="notification info">${format("DTD.Hazard.Reduced", { reduce, total })}</p>`),
    "flags.dtd40k.damage.total": total,
    "flags.dtd40k.fall.reduced": true
  });
}

/** A Constitution Test at a TN, rolled without its own card. */
const conTest = (actor, tn) => runTest({
  base: buildCharacteristicPool({ characteristic: actor.system.characteristics.con.value }), tn, rng, ...actor.withRollModifiers({})
});

/** Card context of a suffocation or forced march. */
async function hazardContent(hazard) {
  const march = hazard.kind === "march";
  return render(HAZARD_TEMPLATE, {
    title: localize(march ? "DTD.Hazard.March" : "DTD.Hazard.Suffocation"),
    mode: march ? "" : localize(`DTD.Hazard.Mode.${hazard.mode}`),
    step: hazard.step, unit: localize(march ? "DTD.Hazard.Hour" : hazard.mode === "strenuous" ? "DTD.Hazard.Round" : "DTD.Hazard.Minute"),
    nextTn: march ? marchTn(hazard.step + 1) : 10, done: hazard.done, march,
    people: hazard.people.map((p) => ({
      ...p, stateLabel: localize(`DTD.Hazard.State.${p.state}`),
      breathLeft: march ? null : Math.max(0, p.limit - hazard.step),
      distance: march ? marchDistance({ speed: p.speed, hours: hazard.step }) : null
    }))
  });
}

/**
 * Start a suffocation or a forced march (FR-005, FR-006): one card, advanced by the GM one interval at a time.
 * @param {"suffocation"|"march"} kind
 * @param {TokenDocument[]} tokens
 * @param {{mode: "conserve"|"strenuous", immune: Record<string, {breath: boolean, fatigue: boolean}>}} options
 */
export async function startHazard(kind, tokens, { mode, immune }) {
  const hazard = {
    kind, mode, step: 0, done: false,
    people: tokens.map((token) => ({
      actorUuid: token.actor.uuid, name: token.name, immune: Boolean(immune[token.uuid]?.[kind === "march" ? "fatigue" : "breath"]), state: "ok", last: "",
      limit: breathLimit({ con: token.actor.system.characteristics.con.value, mode }), speed: token.actor.system.derived?.speed ?? 0
    }))
  };
  await ChatMessage.create({ content: await hazardContent(hazard), flags: { dtd40k: { hazard } } });
}

/**
 * The next interval of a suffocation or hour of a forced march (GM).
 * @param {ChatMessage} message
 */
export async function hazardStep(message) {
  const hazard = foundry.utils.deepClone(message.getFlag("dtd40k", "hazard"));
  if (!game.user.isGM || !hazard || hazard.done) return;
  hazard.step += 1;
  for (const person of hazard.people) {
    const actor = await foundry.utils.fromUuid(person.actorUuid);
    if (!actor || person.immune || person.state === "dead") continue;
    if (hazard.kind === "march") {
      const test = conTest(actor, marchTn(hazard.step));
      person.last = format(test.outcome?.success ? "DTD.Hazard.Passed" : "DTD.Hazard.Failed", { total: test.total, tn: marchTn(hazard.step) });
      if (!test.outcome?.success) await addFatigue(actor, 1);
      if (actor.statuses.has("unconscious")) person.state = "out";
      continue;
    }
    const stage = suffocationStep({ step: hazard.step, limit: person.limit });
    if (stage.test) {
      const test = conTest(actor, 10);
      person.last = format(test.outcome?.success ? "DTD.Hazard.Passed" : "DTD.Hazard.Failed", { total: test.total, tn: 10 });
      if (!test.outcome?.success) await addFatigue(actor, 1);
      // Knocked out by Fatigue: the breath still runs out on schedule.
      if (actor.statuses.has("unconscious")) person.state = "out";
    } else if (stage.unconscious) {
      await toggleCondition(actor, "unconscious", { active: true });
      person.state = "out";
      person.last = localize("DTD.Hazard.OutOfBreath");
    } else {
      const hp = Math.max(0, actor.system.hp.value - stage.hpLoss);
      await actor.update({ "system.hp.value": hp });
      person.last = format("DTD.Hazard.HpLoss", { hp });
      if (hp <= 0) {
        await toggleCondition(actor, "dead", { active: true });
        person.state = "dead";
      }
    }
  }
  await message.update({ content: await hazardContent(hazard), "flags.dtd40k.hazard": hazard });
}

/**
 * End a suffocation (air again) or a forced march (GM).
 * @param {ChatMessage} message
 */
export async function endHazard(message) {
  const hazard = message.getFlag("dtd40k", "hazard");
  if (!game.user.isGM || !hazard) return;
  const next = { ...hazard, done: true };
  await message.update({ content: await hazardContent(next), "flags.dtd40k.hazard": next });
}

/**
 * Group XP award (FR-009): Encounter Difficulty or the session award for each checked character, plus an optional
 * bonus as its own ledger entry.
 */
export async function openXpDialog() {
  if (!game.user.isGM) return;
  const inCombat = new Set(game.combat?.combatants.map((c) => c.actor?.id).filter(Boolean) ?? []);
  // Every character is listed; those in the current combat (or else with a player owner) come checked.
  const characters = game.actors.filter((actor) => actor.type === "character");
  if (!characters.length) {
    ui.notifications.warn(localize("DTD.Xp.NoCharacters"));
    return;
  }
  const content = await render(XP_TEMPLATE, {
    difficulties: Object.entries(ENCOUNTER_XP).map(([key, xp]) => ({ key, xp, label: localize(`DTD.Xp.Difficulty.${key}`) })),
    characters: characters.map((actor) => ({ id: actor.id, name: actor.name, checked: inCombat.size ? inCombat.has(actor.id) : actor.hasPlayerOwner }))
  });
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: localize("DTD.Xp.Title") }, classes: ["dtd40k"], content, rejectClose: false,
    buttons: [{
      action: "ok", label: "DTD.Xp.Award", default: true,
      callback: (event, button) => {
        const f = button.form.elements;
        return {
          kind: f.kind.value, difficulty: f.difficulty.value, bonus: Number(f.bonus.value) || 0, reason: f.reason.value.trim(),
          ids: characters.filter((actor) => f[`char-${actor.id}`]?.checked).map((actor) => actor.id)
        };
      }
    }]
  });
  if (!choice?.ids.length) return;
  const amount = encounterXp(choice.kind, choice.difficulty);
  const label = choice.kind === "session" ? localize("DTD.Xp.Session") : format("DTD.Xp.Encounter", { difficulty: localize(`DTD.Xp.Difficulty.${choice.difficulty}`) });
  const names = [];
  for (const id of choice.ids) {
    const actor = game.actors.get(id);
    await awardXp(actor, amount, label);
    if (choice.bonus) await awardXp(actor, choice.bonus, choice.reason || localize("DTD.Xp.Bonus"));
    names.push(actor.name);
  }
  await ChatMessage.create({
    content: `<p><b>${label}</b>: ${amount} XP${choice.bonus ? ` + ${choice.bonus} (${choice.reason || localize("DTD.Xp.Bonus")})` : ""} — ${names.join(", ")}</p>`
  });
}
