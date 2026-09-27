import { refuteBonus, socialOutcome } from "../rules/social.mjs";
import { toggleCondition } from "./condition-service.mjs";
import { requestGm } from "./damage-service.mjs";

/**
 * Social combat (spec 008, US4; research R9): social attacks against Mental Defense, Resolve, Jaded, Refute.
 * Contract: specs/008-combat/contracts/foundry-api.md ("social-service").
 */

const localize = (key) => game.i18n.localize(key);
const TEMPLATE = "systems/dtd40k/templates/chat/social-attack.hbs";

/**
 * Make a social attack against the targeted character (FR-018): characteristic + social skill vs Mental Defense.
 * @param {Actor} actor
 * @param {{characteristic: "cha"|"fel", skill: string}} choice
 */
export async function socialAttack(actor, { characteristic, skill }) {
  const target = [...game.user.targets][0]?.actor;
  if (target?.type !== "character") {
    ui.notifications.warn(localize("DTD.Combat.NoTarget"));
    return;
  }
  const md = target.system.derived.mentalDefense;
  const message = await actor.rollSkill(skill, { characteristic, tn: md, label: game.i18n.format("DTD.Social.AttackLabel", { target: target.name }) });
  const test = message?.getFlag("dtd40k", "test");
  if (!test) return;
  const content = await foundry.applications.handlebars.renderTemplate(TEMPLATE, {
    target: target.name, md, total: test.total, success: Boolean(test.outcome?.success)
  });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    flags: { dtd40k: { social: { targetUuid: target.uuid, total: test.total, md, success: Boolean(test.outcome?.success), resolved: null } } }
  });
}

/**
 * The target answers a successful social attack (FR-018): spend 1 Resolve (up to 4 a scene, then Jaded) or comply;
 * Refute adds half its total to Mental Defense.
 * @param {ChatMessage} message
 * @param {"spend"|"comply"|"refute"} choice
 */
export async function resolveSocial(message, choice) {
  const data = message.getFlag("dtd40k", "social");
  if (!data || data.resolved) return;
  const target = await foundry.utils.fromUuid(data.targetUuid);
  if (!target?.isOwner) {
    ui.notifications.warn(localize("DTD.Combat.NotYourTarget"));
    return;
  }
  let resolved = choice;
  let text;
  if (choice === "refute") {
    const roll = await target.rollSkill("scrutiny", { characteristic: "wis", fastForward: true, tn: null, label: localize("DTD.Social.Refute") });
    const total = roll?.getFlag("dtd40k", "test")?.total ?? 0;
    const md = data.md + refuteBonus(total);
    if (data.total < md) text = game.i18n.format("DTD.Social.Refuted", { name: target.name, md });
    else {
      text = game.i18n.format("DTD.Social.RefuteFailed", { name: target.name, md });
      resolved = null;
    }
  } else if (choice === "spend") {
    const outcome = socialOutcome({ drained: target.system.resolve.drainedScene, resolve: target.system.resolve.value });
    if (outcome.jaded) {
      await toggleCondition(target, "jaded", { active: true });
      text = game.i18n.format("DTD.Social.Jaded", { name: target.name });
      resolved = "comply";
    } else if (!outcome.canSpend) {
      text = game.i18n.format("DTD.Social.NoResolve", { name: target.name });
      resolved = "comply";
    } else {
      await target.update({ "system.resolve.value": target.system.resolve.value - 1, "system.resolve.drainedScene": target.system.resolve.drainedScene + 1 });
      text = game.i18n.format("DTD.Social.Spent", { name: target.name });
    }
  } else {
    text = game.i18n.format("DTD.Social.Complied", { name: target.name });
  }
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: target }), content: `<p>${text}</p>` });
  if (resolved) {
    if (message.isOwner) await message.setFlag("dtd40k", "social", { ...data, resolved });
    else requestGm("markSocial", { messageId: message.id, resolved });
  }
}

/**
 * New scene: the Resolve drained by social attacks and Jaded reset (p. 446).
 * @param {Actor} actor
 */
export async function resetSocialScene(actor) {
  await actor.update({ "system.resolve.drainedScene": 0 });
  if (actor.statuses.has("jaded")) await toggleCondition(actor, "jaded", { active: false });
}
