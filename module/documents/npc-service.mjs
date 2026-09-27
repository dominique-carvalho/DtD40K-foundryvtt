import { fearRating, regeneration } from "../rules/npc.mjs";
import { fearTest } from "./mental-service.mjs";

/**
 * NPC traits at the table: Regeneration at the start of the turn and the Fear Test card (spec 012, research R3).
 * Contract: specs/012-npcs-minions/contracts/foundry-api.md ("npc-service").
 */

const localize = (key) => game.i18n.localize(key);
const FEAR_TEMPLATE = "systems/dtd40k/templates/chat/npc-fear.hbs";

/**
 * Start of an NPC turn (FR-004): Regeneration heals up to the maximum. Called by DtdCombat#_onStartTurn on the GM.
 * @param {Combatant} combatant
 */
export async function regenerate(combatant) {
  const actor = combatant?.actor;
  if (actor?.type !== "npc") return;
  const amount = regeneration(actor.system.npc.traits);
  const missing = actor.system.hp.max - actor.system.hp.value;
  if (!amount || missing <= 0 || actor.statuses.has("dead")) return;
  const healed = Math.min(amount, missing);
  await actor.update({ "system.hp.value": actor.system.hp.value + healed });
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${game.i18n.format("DTD.Npc.Regenerated", { name: actor.name, hp: healed })}</p>` });
}

/**
 * Post a Fear card for an NPC with the Fear trait (FR-004): heroes click it to make the Fear Test of spec 008.
 * @param {Actor} actor
 * @returns {Promise<ChatMessage|null>}
 */
export async function fearCard(actor) {
  const rating = fearRating(actor.system.npc?.traits ?? []);
  if (!rating) return null;
  const content = await foundry.applications.handlebars.renderTemplate(FEAR_TEMPLATE, { name: actor.name, rating });
  return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content, flags: { dtd40k: { fear: { rating, name: actor.name } } } });
}

/**
 * The Fear Test of a card, for the user's character (or the controlled token's actor).
 * @param {ChatMessage} message
 */
export async function fearFromCard(message) {
  const fear = message.getFlag("dtd40k", "fear");
  if (!fear) return;
  const actor = canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor || actor.type !== "character" || !actor.isOwner) {
    ui.notifications.warn(localize("DTD.Npc.NoHero"));
    return;
  }
  await fearTest(actor, fear.rating);
}
