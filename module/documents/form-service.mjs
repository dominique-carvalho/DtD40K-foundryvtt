import { takeAction } from "./turn-service.mjs";

/**
 * Alternate forms of NPCs (spec 022, US5, research R11): shifts such as the Zoanoid Warform (cost from the Resource
 * Stat, an action, a duration in rounds) and variants such as the Elemental's composition (chosen, no cost). The
 * active form is laid over the stat block by NpcData#prepareBaseData; its weapons carry `flags.dtd40k.form`.
 * Contract: specs/022-npc-traits/contracts/foundry-api.md.
 */

const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);

/**
 * Warn about a refusal; the GM may go on anyway (constitution IV).
 * @param {string} message
 */
async function refuseUnlessGM(message) {
  ui.notifications.warn(message);
  if (!game.user.isGM) return false;
  return Boolean(await foundry.applications.api.DialogV2.confirm({
    window: { title: localize("DTD.Npc.Forms") }, content: `<p>${message}</p><p>${localize("DTD.Combat.GMOverride")}</p>`, rejectClose: false
  }));
}

/** Chat line about the actor. */
const say = (actor, text) => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${text}</p>` });

/**
 * Take a form, or go back to the base form with an empty id (FR-016). A shift spends its cost from the Resource Stat
 * and its action; a variant is just chosen.
 * @param {Actor} actor
 * @param {string} formId
 */
export async function switchForm(actor, formId) {
  if (actor?.type !== "npc" || !actor.isOwner) return;
  const npc = actor.system.npc;
  if (!formId) {
    if (!npc.activeForm) return;
    const previous = npc.forms.find((f) => f.id === npc.activeForm);
    await actor.update({ "system.npc.activeForm": "", "system.npc.formRounds": 0 });
    await say(actor, format("DTD.Npc.FormEnds", { name: actor.name, form: previous?.name ?? "" }));
    return;
  }
  const form = npc.forms.find((f) => f.id === formId);
  if (!form || form.id === npc.activeForm) return;
  if (form.kind === "variant") {
    await actor.update({ "system.npc.activeForm": form.id, "system.npc.formRounds": 0 });
    await say(actor, format("DTD.Npc.VariantChosen", { name: actor.name, form: form.name }));
    return;
  }
  const resource = npc.resource;
  if (form.cost && resource.value < form.cost
    && !(await refuseUnlessGM(format("DTD.Npc.NoResource", { name: actor.name, resource: resource.type || localize("DTD.Npc.Resource"), cost: form.cost })))) return;
  if (form.action && !(await takeAction(actor, { key: "shift", name: form.name, type: form.action }))) return;
  await actor.update({
    "system.npc.activeForm": form.id,
    "system.npc.formRounds": form.duration,
    "system.npc.resource.value": Math.max(0, resource.value - form.cost)
  });
  await say(actor, format("DTD.Npc.FormTaken", { name: actor.name, form: form.name, cost: form.cost, resource: resource.type, rounds: form.duration || "—" }));
}

/**
 * End of the NPC's turn: one round of a timed form passes; at 0 it goes back to the base form.
 * @param {Actor} actor
 */
export async function tickForm(actor) {
  if (actor?.type !== "npc") return;
  const npc = actor.system.npc;
  if (!npc.activeForm || npc.formRounds <= 0) return;
  if (npc.formRounds > 1) return actor.update({ "system.npc.formRounds": npc.formRounds - 1 });
  await switchForm(actor, "");
}

/**
 * Spend or regain points of the Resource Stat (FR-017), with a chat line.
 * @param {Actor} actor
 * @param {number} delta  negative to spend
 */
export async function adjustNpcResource(actor, delta) {
  if (actor?.type !== "npc" || !actor.isOwner) return;
  const resource = actor.system.npc.resource;
  const value = Math.clamp(resource.value + delta, 0, resource.max || Infinity);
  if (value === resource.value) return;
  await actor.update({ "system.npc.resource.value": value });
  await say(actor, format(delta < 0 ? "DTD.Npc.ResourceSpent" : "DTD.Npc.ResourceRegained", {
    name: actor.name, resource: resource.type || localize("DTD.Npc.Resource"), value, max: resource.max
  }));
}

/**
 * A new scene (the end of a combat): the uses per scene of the NPC's abilities come back.
 * @param {Actor} actor
 */
export async function resetAbilityUses(actor) {
  if (actor?.type !== "npc") return;
  const list = actor._source.system.npc.abilities;
  if (!list.some((a) => a.uses?.value > 0)) return;
  await actor.update({ "system.npc.abilities": list.map((a) => ({ ...a, uses: { ...a.uses, value: 0 } })) });
}

/**
 * Whether an item belongs to a form that is not active (its weapons are hidden until the form is taken).
 * @param {Item} item
 */
export function inactiveFormItem(item) {
  const form = item.getFlag?.("dtd40k", "form");
  return Boolean(form) && item.actor?.system?.npc?.activeForm !== form;
}
