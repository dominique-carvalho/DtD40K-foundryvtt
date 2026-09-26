import { postTest, rng } from "../dice/roll-service.mjs";
import { acquisitionTn, strainRoll } from "../rules/acquisition.mjs";
import { runTest } from "../rules/test.mjs";
import { evaluateOutcome } from "../rules/results.mjs";
import { addEquipment } from "./equipment-service.mjs";

/**
 * Acquiring items with a Wealth Test (spec 007, US4; research R9).
 * Contract: specs/007-equipment/contracts/foundry-api.md ("acquisition-service").
 */

const DIALOG_TEMPLATE = "systems/dtd40k/templates/dialog/acquire-dialog.hbs";
const CARD_TEMPLATE = "systems/dtd40k/templates/chat/acquire-card.hbs";
const localize = (key) => game.i18n.localize(key);

/** Key of the tries at one item (name, craftsmanship, piece). */
const attemptKey = (name, craftsmanship, piece) => `${name}|${craftsmanship}|${piece ? "piece" : "suit"}`;

/**
 * Earlier tries at an item.
 * @param {Actor} actor
 * @param {string} key
 */
const attemptsOf = (actor, key) => actor.system.wealth.attempts.find((entry) => entry.key === key)?.count ?? 0;

/**
 * Open the Wealth Test for an item (FR-021 to FR-023).
 * @param {Actor} actor
 * @param {Item} item  from a compendium, the sidebar or the character's inventory
 * @returns {Promise<ChatMessage|null>}
 */
export async function acquire(actor, item) {
  if (actor.type !== "character") return null;
  const wealth = actor.system.wealth.effective;
  if (wealth <= 0 && item.system.rarity !== "worthless") {
    ui.notifications.warn(localize("DTD.Acquire.NoWealth"));
    if (!game.user.isGM) return null;
    const give = await foundry.applications.api.DialogV2.confirm({
      window: { title: localize("DTD.Acquire.Title") },
      content: `<p>${localize("DTD.Acquire.NoWealth")}</p><p>${localize("DTD.Acquire.GMGive")}</p>`,
      rejectClose: false
    });
    if (give) await addEquipment(actor, item, { starting: false });
    return null;
  }

  const isArmor = item.type === "armor";
  const content = await foundry.applications.handlebars.renderTemplate(DIALOG_TEMPLATE, {
    item,
    wealth,
    isArmor,
    craftsmanship: Object.keys(CONFIG.DTD.CRAFTSMANSHIP).map((key) => ({ key, selected: key === "common" })),
    pieces: CONFIG.DTD.ARMOR_PIECES
  });
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.format("DTD.Acquire.TitleItem", { item: item.name }) },
    classes: ["dtd40k", "acquire-dialog-app"],
    position: { width: 420 },
    content,
    rejectClose: false,
    buttons: [
      {
        action: "roll",
        label: "DTD.Acquire.Roll",
        icon: "fa-solid fa-coins",
        default: true,
        callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
      },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!choice || typeof choice !== "object") return null;

  const craftsmanship = choice.craftsmanship || "common";
  const piece = isArmor ? choice.piece || "" : "";
  const key = attemptKey(item.name, craftsmanship, piece);
  const { tn, rarity, time } = acquisitionTn({
    rarity: item.system.rarity, piece: Boolean(piece), craftsmanship, attempts: attemptsOf(actor, key)
  });
  const testResult = runTest({ base: { rolled: wealth, kept: wealth }, tn, rng });
  const success = Boolean(testResult.outcome?.success);
  const raises = testResult.outcome?.raises ?? 0;

  let strain = { strained: false, roll: 0, penalty: 0 };
  if (success) {
    strain = strainRoll({ tn, wealth, raises, d10: Math.floor(rng() * 10) + 1 });
    await gain(actor, item, { craftsmanship, piece, strain });
  } else {
    await recordAttempt(actor, key);
  }

  const extraContent = await foundry.applications.handlebars.renderTemplate(CARD_TEMPLATE, {
    item: item.name,
    rarity: localize(CONFIG.DTD.RARITIES[rarity].label),
    time: localize(time),
    craftsmanship: localize(`DTD.Craftsmanship.${craftsmanship}`),
    piece: piece ? localize(`DTD.Location.${piece}`) : "",
    success,
    strain,
    canSpendLiquid: !success && actor.system.wealth.liquid > 0,
    liquid: actor.system.wealth.liquid
  });
  return postTest({
    actor,
    label: game.i18n.format("DTD.Acquire.Label", { item: item.name }),
    testResult,
    extraContent,
    flags: { acquire: { actorUuid: actor.uuid, itemUuid: item.uuid, craftsmanship, piece, tn, wealth, total: testResult.total, key, done: success } }
  });
}

/**
 * The item joins the inventory; a strain penalty is kept until the GM ends it (the largest one counts).
 * @param {Actor} actor
 * @param {Item} item
 * @param {{craftsmanship: string, piece: string, strain: {penalty: number}}} choice
 */
async function gain(actor, item, { craftsmanship, piece, strain }) {
  await addEquipment(actor, item, { starting: false, overrides: { craftsmanship, ...(piece ? { piece } : {}) } });
  if (strain.penalty > actor.system.wealth.strain) await actor.update({ "system.wealth.strain": strain.penalty });
}

/**
 * Count a failed try at an item (+5 TN next time, p. 316).
 * @param {Actor} actor
 * @param {string} key
 */
async function recordAttempt(actor, key) {
  const attempts = foundry.utils.deepClone(actor._source.system.wealth.attempts);
  const entry = attempts.find((a) => a.key === key);
  if (entry) entry.count += 1;
  else attempts.push({ key, count: 1 });
  await actor.update({ "system.wealth.attempts": attempts });
}

/**
 * Spend Liquid Wealth on a failed acquisition card: +1 per point (p. 316) (FR-022).
 * @param {ChatMessage} message
 */
export async function spendLiquid(message) {
  const data = message.getFlag("dtd40k", "acquire");
  if (!data || data.done) return;
  const actor = await foundry.utils.fromUuid(data.actorUuid);
  if (!actor?.isOwner) return;
  const available = actor.system.wealth.liquid;
  const needed = Math.max(1, data.tn - data.total);
  const points = await foundry.applications.api.DialogV2.prompt({
    window: { title: localize("DTD.Acquire.Liquid") },
    content: `<p>${game.i18n.format("DTD.Acquire.LiquidPrompt", { needed, available })}</p>
      <input type="number" name="points" value="${Math.min(needed, available)}" min="1" max="${available}">`,
    ok: { label: "DTD.Acquire.Spend", callback: (event, button) => Number(button.form.elements.points.value) || 0 },
    rejectClose: false
  });
  if (!points || points < 1) return;
  const spent = Math.min(points, available);
  const total = data.total + spent;
  await actor.update({ "system.wealth.liquid": available - spent });
  const outcome = evaluateOutcome(total, data.tn);
  await message.setFlag("dtd40k", "acquire", { ...data, total, done: outcome.success });
  const item = await foundry.utils.fromUuid(data.itemUuid);
  let strain = { strained: false, penalty: 0 };
  if (outcome.success && item) {
    strain = strainRoll({ tn: data.tn, wealth: data.wealth, raises: outcome.raises, d10: Math.floor(rng() * 10) + 1 });
    await gain(actor, item, { craftsmanship: data.craftsmanship, piece: data.piece, strain });
  }
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p>${game.i18n.format(outcome.success ? "DTD.Acquire.LiquidSuccess" : "DTD.Acquire.LiquidFailure", {
      points: spent, total, tn: data.tn, item: item?.name ?? ""
    })}</p>${strain.strained ? `<p>${game.i18n.format("DTD.Acquire.Strain", { roll: strain.roll, penalty: strain.penalty })}</p>` : ""}`
  });
}

/**
 * GM ends the Wealth Strain penalty (end of the next session) (FR-023).
 * @param {Actor} actor
 */
export async function endStrain(actor) {
  if (game.user.isGM) await actor.update({ "system.wealth.strain": 0 });
}
