import { flyingFall } from "../rules/npc-traits.mjs";
import { applyFall } from "./hazard-service.mjs";

/**
 * Flyers that fall (spec 022, research R5): a token in the air that becomes Stunned, Unconscious or Prone offers the GM
 * a fall (spec 018). The book links no height to the fall categories, so the GM picks one; the token lands.
 */

const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);

/**
 * After a status is applied: a whispered card for the GM for every airborne token of the actor.
 * @param {ActiveEffect} effect
 */
export async function offerFlightFall(effect) {
  const actor = effect.parent;
  if (!(actor instanceof Actor)) return;
  for (const status of effect.statuses ?? []) {
    for (const token of actor.getActiveTokens(false, true)) {
      if (!flyingFall({ elevation: token.elevation ?? 0, status })) continue;
      const content = `<div class="dtd40k hazard-card"><p><i class="fa-solid fa-feather-pointed" inert></i> <strong>${format("DTD.Npc.FlightFall", { name: token.name, elevation: token.elevation, status: localize(`DTD.Condition.${status}`) })}</strong></p>`
        + `<div class="card-buttons"><button type="button" class="gm-only" data-dtd-action="flightFall" data-token-uuid="${token.uuid}"><i class="fa-solid fa-person-falling" inert></i> ${localize("DTD.Npc.FlightFallButton")}</button></div></div>`;
      await ChatMessage.create({ content, speaker: ChatMessage.getSpeaker({ actor }), whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id) });
      return;
    }
  }
}

/**
 * GM: pick the fall category, roll the fall (018) and bring the token down.
 * @param {ChatMessage} message
 * @param {{tokenUuid: string}} dataset
 */
export async function flightFall(message, { tokenUuid }) {
  if (!game.user.isGM) return;
  const token = await foundry.utils.fromUuid(tokenUuid);
  if (!token) return;
  const options = ["short", "long", "fatal"].map((key) => `<option value="${key}">${localize(`DTD.Hazard.Fall.${key}`)}</option>`).join("");
  const category = await foundry.applications.api.DialogV2.wait({
    classes: ["dtd40k"],
    window: { title: localize("DTD.Npc.FlightFallButton") },
    content: `<p>${format("DTD.Npc.FlightFallPick", { name: token.name, elevation: token.elevation })}</p><select name="category">${options}</select>`,
    buttons: [
      { action: "fall", label: localize("DTD.Npc.FlightFallButton"), default: true, callback: (event, button) => button.form.elements.category.value },
      { action: "cancel", label: localize("Cancel") }
    ],
    rejectClose: false
  });
  if (!category || category === "cancel") return;
  await applyFall([token], { category, intentional: false });
  await token.update({ elevation: 0 });
}
