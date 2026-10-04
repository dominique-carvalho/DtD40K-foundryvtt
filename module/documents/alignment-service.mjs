import { PANTHEONS, SKILLS } from "../config.mjs";
import { afterFailure, alignmentCheck, changeAlignment, degenerationRow, recover } from "../rules/alignment.mjs";

/**
 * Alignment on the character: the deity, Alignment Checks, raising Devotion, Degeneration and changing alignment
 * (spec 011, US3–US4; research R5/R6). Contract: specs/011-backgrounds-alignment/contracts/foundry-api.md.
 */

const localize = (key) => game.i18n.localize(key);
const TABLE_PACK = "dtd40k.combat-tables";
const FEAT_PACK = "dtd40k.feats";
const DIALOG = "systems/dtd40k/templates/dialog/alignment-check.hbs";

/**
 * Yes/no confirmation dialog.
 * @param {string} title
 * @param {string} content
 */
async function confirm(title, content) {
  return Boolean(await foundry.applications.api.DialogV2.confirm({ window: { title }, content, rejectClose: false }));
}

/** The character's deity item, if any. */
export const getDeity = (actor) => actor.items.find((item) => item.type === "deity") ?? null;

/**
 * Drop of a deity (FR-011): the first one becomes the alignment; another one asks to change alignment (FR-015):
 * same pantheon −2 Devotion (min 1), another pantheon Devotion 4 and a Degeneration at 7; only once (GM override).
 * @param {Actor} actor
 * @param {Item} deity
 * @returns {Promise<Item|null>}
 */
export async function setAlignment(actor, deity) {
  if (actor.type !== "character" || !actor.isOwner) return null;
  const current = getDeity(actor);
  if (current?.system.key === deity.system.key) {
    ui.notifications.info(game.i18n.format("DTD.Alignment.AlreadyAligned", { deity: deity.name }));
    return null;
  }
  const data = deity.toObject();
  delete data._id;
  delete data.folder;
  if (!current) {
    const [created] = await actor.createEmbeddedDocuments("Item", [data]);
    return created ?? null;
  }
  const devotion = actor.system.devotion.value;
  const plan = changeAlignment({ fromPantheon: current.system.pantheon, toPantheon: deity.system.pantheon, devotion, changes: actor.system.alignment.changes });
  if (plan.refused) {
    const message = localize("DTD.Alignment.OnlyOnce");
    ui.notifications.warn(message);
    if (!game.user.isGM || !(await confirm(localize("DTD.Alignment.Change"), `<p>${message}</p><p>${localize("DTD.XP.GMOverride")}</p>`))) return null;
    Object.assign(plan, changeAlignment({ fromPantheon: current.system.pantheon, toPantheon: deity.system.pantheon, devotion, changes: 0 }));
  }
  const ask = game.i18n.format(plan.degenerationAt ? "DTD.Alignment.ChangeOther" : "DTD.Alignment.ChangeSame", {
    from: current.name, to: deity.name, devotion: plan.devotion
  });
  if (!(await confirm(localize("DTD.Alignment.Change"), `<p>${ask}</p>`))) return null;
  await current.delete();
  const [created] = await actor.createEmbeddedDocuments("Item", [data]);
  await actor.update({ "system.devotion.value": plan.devotion, "system.alignment.changes": actor._source.system.alignment.changes + 1 });
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${ask}</p>` });
  if (plan.degenerationAt) await applyDegeneration(actor, plan.degenerationAt);
  return created ?? null;
}

/**
 * Ask the bonus and roll mode of an Alignment Check.
 * @param {string} title
 * @returns {Promise<{bonus: number, rollMode: string}|null>}
 */
async function promptCheck(title) {
  const currentMode = game.settings.get("core", "rollMode");
  const content = await foundry.applications.handlebars.renderTemplate(DIALOG, {
    rollModes: Object.entries(CONFIG.Dice.rollModes).map(([key, mode]) => ({ key, label: mode.label ?? mode, selected: key === currentMode }))
  });
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title },
    classes: ["dtd40k", "roll-dialog-app"],
    content,
    rejectClose: false,
    buttons: [
      { action: "roll", label: "DTD.Roll.Dialog.Roll", icon: "fa-solid fa-dice-d10", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!result || typeof result !== "object") return null;
  return { bonus: Number(result.bonus) || 0, rollMode: result.rollMode || currentMode };
}

/**
 * Roll one check and post it.
 * @param {Actor} actor
 * @param {{bonus: number, rollMode: string, devotion: number, label: string}} options
 * @returns {Promise<{pass: boolean, total: number}>}
 */
async function rollOnce(actor, { bonus, rollMode, devotion, label }) {
  const roll = await new Roll("1d10").evaluate();
  const totalBonus = bonus + (actor.system.modifiers.alignmentCheck ?? 0);
  const result = alignmentCheck({ d10: roll.total, bonus: totalBonus, devotion });
  const text = game.i18n.format(result.pass ? "DTD.Alignment.Passed" : "DTD.Alignment.Failed", {
    d10: roll.total, bonus: totalBonus, total: result.total, devotion
  });
  const chat = { speaker: ChatMessage.getSpeaker({ actor }), content: `<p><b>${label}</b></p><p>${text}</p>`, rolls: [roll] };
  ChatMessage.applyRollMode(chat, rollMode);
  await ChatMessage.create(chat);
  return result;
}

/**
 * Alignment Check (FR-012) or raising Devotion (FR-013). A failed check costs a Devotion point; at 6 or less a
 * second check decides the Degeneration; at 0 the character leaves play. Raising: a pass gains a point and cures the
 * Degeneration of the point left.
 * @param {Actor} actor
 * @param {{recover?: boolean, options?: {bonus: number, rollMode: string}}} [params]
 * @returns {Promise<boolean|null>}  pass, or null when cancelled
 */
export async function rollAlignmentCheck(actor, { recover: raising = false, options = null } = {}) {
  if (!actor.isOwner) return null;
  const title = localize(raising ? "DTD.Alignment.Recover" : "DTD.Alignment.Check");
  const chosen = options ?? (await promptCheck(title));
  if (!chosen) return null;
  const devotion = actor.system.devotion.value;
  const first = await rollOnce(actor, { ...chosen, devotion, label: title });

  if (raising) {
    const plan = recover({ pass: first.pass, devotion });
    if (plan.devotion !== devotion) await actor.update({ "system.devotion.value": plan.devotion });
    if (plan.cures !== null) await cureDegeneration(actor, plan.cures);
    return first.pass;
  }
  if (first.pass) return true;

  const plan = afterFailure(devotion);
  await actor.update({ "system.devotion.value": plan.devotion });
  if (plan.outOfPlay) {
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${game.i18n.format("DTD.Alignment.OutOfPlay", { name: actor.name })}</p>` });
    return false;
  }
  if (plan.second) {
    const second = await rollOnce(actor, { ...chosen, devotion: plan.devotion, label: localize("DTD.Alignment.SecondCheck") });
    if (!second.pass) await applyDegeneration(actor, plan.devotion);
  }
  return false;
}

/** The Degeneration table of the combat-tables pack. */
async function degenerationTable() {
  const pack = game.packs.get(TABLE_PACK);
  const index = await pack.getIndex({ fields: ["flags.dtd40k.table"] });
  const entry = index.find((e) => e.flags?.dtd40k?.table?.kind === "degeneration");
  return entry ? pack.getDocument(entry._id) : null;
}

/** Active Effect data of a Degeneration. */
function effectData(name, id, changes) {
  return {
    name: `${localize("DTD.Alignment.Degeneration")}: ${name}`, img: "icons/svg/skull.svg",
    changes: changes.map((c) => ({ key: c.key, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: String(c.value) })),
    flags: { dtd40k: { degeneration: id } }
  };
}

/**
 * Roll a Degeneration and write it at a Devotion point (FR-017, FR-018): repeated results are rolled again; simple
 * effects are applied (characteristic −1, Night Terrors, a minor derangement, −2k0 on social Tests).
 * @param {Actor} actor
 * @param {number} point
 * @param {{roll?: number}} [options]  roll: a forced 1d100 result (GM)
 * @returns {Promise<object|null>}  the record
 */
export async function applyDegeneration(actor, point, { roll: forced } = {}) {
  const table = await degenerationTable();
  if (!table) return null;
  const results = table.results.contents.sort((a, b) => a.range[0] - b.range[0]);
  const owned = actor.system.alignment.degenerations.map((d) => d.name);
  const hasNightTerrors = actor.hasFeat("Night Terrors");
  let row = null;
  let rolled = 0;
  for (let attempt = 0; attempt < 30 && !row; attempt++) {
    rolled = attempt === 0 && forced ? forced : (await new Roll("1d100").evaluate()).total;
    row = degenerationRow(results, rolled, owned);
    if (row?.getFlag("dtd40k", "effect")?.hindrance && hasNightTerrors) row = null;
  }
  if (!row) return null;
  const name = row.getFlag("dtd40k", "name");
  const effect = row.getFlag("dtd40k", "effect") ?? {};
  const id = foundry.utils.randomID();
  const record = { id, point, name, row: rolled, characteristic: "", effectIds: [], itemIds: [], derangement: "" };

  if (effect.characteristic) {
    const [created] = await actor.createEmbeddedDocuments("ActiveEffect", [effectData(name, id, [{ key: `system.characteristics.${effect.characteristic}.value`, value: effect.value }])]);
    if (created) record.effectIds.push(created.id);
    record.characteristic = effect.characteristic;
  }
  if (effect.social) {
    const social = Object.entries(SKILLS).filter(([, s]) => s.group === "social").map(([key]) => ({ key: `system.modifiers.rolls.skills.${key}.rolled`, value: effect.social.rolled }));
    const [created] = await actor.createEmbeddedDocuments("ActiveEffect", [effectData(name, id, social)]);
    if (created) record.effectIds.push(created.id);
  }
  if (effect.hindrance) {
    const pack = game.packs.get(FEAT_PACK);
    const entry = pack?.index.find((e) => e.name === effect.hindrance);
    if (entry) {
      const data = (await pack.getDocument(entry._id)).toObject();
      delete data._id;
      delete data.folder;
      // Given by the Degeneration: no hindrance XP (spec 011).
      data.system.xpGranted = 0;
      data.flags = { ...(data.flags ?? {}), dtd40k: { ...(data.flags?.dtd40k ?? {}), degeneration: id } };
      const [created] = await actor.createEmbeddedDocuments("Item", [data]);
      if (created) record.itemIds.push(created.id);
    }
  }
  if (effect.derangement) {
    const list = [...actor._source.system.insanity.derangements, { name, severity: effect.derangement }];
    await actor.update({ "system.insanity.derangements": list });
    record.derangement = name;
  }
  await actor.update({ "system.alignment.degenerations": [...actor._source.system.alignment.degenerations, record] });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><b>${localize("DTD.Alignment.Degeneration")}</b> (${rolled}) — ${game.i18n.format("DTD.Alignment.WrittenAt", { point })}</p>${row.description}`
  });
  return record;
}

/**
 * Cure the Degenerations written at a Devotion point (FR-013, p. 285): their effects, items and derangement leave.
 * @param {Actor} actor
 * @param {number} point
 */
export async function cureDegeneration(actor, point) {
  const records = actor._source.system.alignment.degenerations.filter((d) => d.point === point);
  if (!records.length) return;
  for (const record of records) {
    const effects = record.effectIds.filter((id) => actor.effects.has(id));
    if (effects.length) await actor.deleteEmbeddedDocuments("ActiveEffect", effects);
    const items = record.itemIds.filter((id) => actor.items.has(id));
    if (items.length) await actor.deleteEmbeddedDocuments("Item", items);
    if (record.derangement) {
      const list = [...actor._source.system.insanity.derangements];
      const index = list.findIndex((d) => d.name === record.derangement);
      if (index >= 0) list.splice(index, 1);
      await actor.update({ "system.insanity.derangements": list });
    }
  }
  await actor.update({ "system.alignment.degenerations": actor._source.system.alignment.degenerations.filter((d) => d.point !== point) });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p>${game.i18n.format("DTD.Alignment.Cured", { names: records.map((r) => r.name).join(", "), point })}</p>`
  });
}

/** Pantheon label of a deity. */
export const pantheonLabel = (deity) => localize(PANTHEONS[deity.system.pantheon]?.label ?? "");
