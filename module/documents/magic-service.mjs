import { MAGIC_SCHOOLS } from "../config.mjs";
import { postTest, rng } from "../dice/roll-service.mjs";
import { promptCastOptions } from "../apps/cast-dialog.mjs";
import { rollAndKeep } from "../rules/dice.mjs";
import {
  canLearn, castPool, comboTest, keywordCheck, perRaiseChange, phenomenaModifier, spellDamage, spellTn, tableRow, validPush
} from "../rules/magic.mjs";
import { formatPool, normalizePool } from "../rules/pool.mjs";
import { runTest } from "../rules/test.mjs";
import { advanceCost } from "../rules/xp.mjs";
import { rollValue, toggleCondition } from "./condition-service.mjs";
import { addInsanity } from "./mental-service.mjs";
import { combatantOf, takeAction } from "./turn-service.mjs";
import { recordEntry } from "./xp-service.mjs";

/**
 * Learning and casting spells, Psychic Phenomena, combos and sustained spells (spec 009, US2–US4; research R3–R7).
 * Contract: specs/009-magic/contracts/foundry-api.md ("magic-service").
 */

const localize = (key) => game.i18n.localize(key);
const TABLE_PACK = "dtd40k.combat-tables";
const CARD_TEMPLATE = "systems/dtd40k/templates/chat/spell-card.hbs";
const DAMAGE_TEMPLATE = "systems/dtd40k/templates/chat/damage-card.hbs";
const ACTION_TYPE = { half: "half", full: "full", reaction: "reaction", free: "free", halfOrReaction: "half" };

/**
 * Yes/no confirmation dialog.
 * @param {string} title
 * @param {string} content
 */
async function confirm(title, content) {
  return Boolean(await foundry.applications.api.DialogV2.confirm({ window: { title }, content, rejectClose: false }));
}

/** School ratings of a character. */
const schoolsOf = (actor) => Object.fromEntries(Object.entries(actor.system.magic.schools).map(([key, s]) => [key, s.value]));

/** Spells the character knows. */
const knownSpells = (actor) => actor.items.filter((item) => item.type === "spell");

/**
 * Learn a spell dragged onto the sheet (FR-007): a free slot of its school and a level up to the school rating;
 * the GM may allow more (Spell Book and the like).
 * @param {Actor} actor
 * @param {Item} spell
 * @returns {Promise<Item|null>}
 */
export async function learnSpell(actor, spell) {
  if (actor.type !== "character") return null;
  const check = canLearn({
    spell: { name: spell.name, ...spell.system }, schools: schoolsOf(actor),
    spells: knownSpells(actor).map((item) => ({ name: item.name, ...item.system })), extra: actor.system.magic.state.extra
  });
  if (!check.ok) {
    const message = game.i18n.format(`DTD.Magic.Refused.${check.reason}`, { spell: spell.name, school: localize(MAGIC_SCHOOLS[spell.system.school].label) });
    ui.notifications.warn(message);
    if (check.reason === "alreadyKnown" || !game.user.isGM || !(await confirm(localize("DTD.Magic.Learn"), `<p>${message}</p><p>${localize("DTD.Combat.GMOverride")}</p>`))) return null;
  }
  const data = spell.toObject();
  delete data._id;
  delete data.folder;
  data.system.learnedAt = actor.system.magic.schools[spell.system.school].value;
  const [created] = await actor.createEmbeddedDocuments("Item", [data]);
  return created ?? null;
}

/**
 * Cast a known spell or a learned combo (FR-008 to FR-013, FR-015).
 * @param {Actor} actor
 * @param {string} spellId
 * @param {{comboId?: string}} [options]
 * @returns {Promise<ChatMessage|null>}
 */
export async function castSpell(actor, spellId, { comboId } = {}) {
  const combo = comboId ? actor.system.magic.combos.find((c) => c.id === comboId) : null;
  const spells = combo
    ? combo.spells.map((name) => knownSpells(actor).find((item) => item.name === name)).filter(Boolean)
    : [actor.items.get(spellId)].filter(Boolean);
  if (!spells.length) return null;
  const main = spells[0];
  const inCombat = Boolean(combatantOf(actor));

  // Keywords (FR-010): Somatic when bound, Social in combat; reminders for Verbal, Focus, Material.
  for (const spell of spells) {
    const check = keywordCheck(spell.system, { statuses: actor.statuses, inCombat });
    if (check.blocked.length) {
      const message = game.i18n.format("DTD.Magic.Blocked", { spell: spell.name, keywords: check.blocked.map((k) => localize(`DTD.Magic.Keyword.${k}.label`)).join(", ") });
      ui.notifications.warn(message);
      if (!game.user.isGM || !(await confirm(spell.name, `<p>${message}</p><p>${localize("DTD.Combat.GMOverride")}</p>`))) return null;
    }
  }

  const system = actor.system;
  const target = [...game.user.targets][0]?.actor ?? null;
  const tested = system.magic.state.sanctioned;
  let schoolKey = main.system.school;
  let characteristic = MAGIC_SCHOOLS[schoolKey].characteristic;
  let tn = spellTn(main.system, { targetMd: target?.system.derived?.mentalDefense ?? null, modifier: system.modifiers.magic.tn });
  if (combo) {
    const test = comboTest(spells.map((s) => s.system), schoolsOf(actor), Object.fromEntries(Object.entries(system.characteristics).map(([k, c]) => [k, c.value])));
    schoolKey = test.school;
    characteristic = test.characteristic;
    tn = test.tn === null ? null : test.tn + system.modifiers.magic.tn;
  }
  const implementFocus = system.magic.state.hasImplement && actor.items.some((item) => item.type === "feat" && item.name === "Implement Focus");

  const options = await promptCastOptions({
    title: game.i18n.format("DTD.Magic.CastTitle", { spell: combo ? combo.name : main.name }),
    tn, tested, combo: Boolean(combo), implementFocus
  });
  if (!options) return null;
  if (options.strength === "push" && !validPush(options.push, tested)) {
    ui.notifications.warn(localize("DTD.Magic.BadPush"));
    return null;
  }

  // The spell's action (FR-013): the longest one in a combo.
  const actionOrder = ["free", "reaction", "half", "full"];
  const type = spells.map((s) => ACTION_TYPE[s.system.action]).sort((a, b) => actionOrder.indexOf(b) - actionOrder.indexOf(a))[0];
  if (!(await takeAction(actor, { key: `spell:${main.id}`, name: main.name, type }))) return null;

  const pool = castPool({
    school: system.magic.schools[schoolKey].value, characteristic: system.characteristics[characteristic].value,
    strength: options.strength, push: options.push
  });
  const testResult = runTest({
    base: { rolled: pool.rolled + system.modifiers.magic.rolled, kept: pool.kept + system.modifiers.magic.kept },
    tn: options.tn,
    specialty: options.implementReroll,
    rng,
    ...actor.withRollModifiers(options.modifiers)
  });
  const success = testResult.outcome ? testResult.outcome.success : true;
  const raises = testResult.outcome?.raises ?? 0;
  const keptExploded = testResult.dice.some((die) => die.kept && die.chain.length > 1);
  const phenomena = phenomenaModifier({
    strength: options.strength, push: options.push, tested, level: Math.max(...spells.map((s) => s.system.level)),
    keptExploded, comboSize: combo ? spells.length : 0
  });

  const casterLevel = system.magic.state.casterLevel;
  const rows = spells.map((spell) => ({
    name: spell.name,
    effect: spell.system.effect,
    perRaise: spell.system.perRaise,
    damage: spellDamage(spell.system, { casterLevel }),
    save: spell.system.save
  }));
  const extraContent = await foundry.applications.handlebars.renderTemplate(CARD_TEMPLATE, {
    strength: localize(`DTD.Magic.Strength.${options.strength}`) + (options.strength === "push" ? ` +${options.push}` : ""),
    success, raises, rows: rows.map((r) => ({ ...r, damageText: r.damage ? `${r.damage.rolled}k${r.damage.kept} ${r.damage.type}` : "" })),
    phenomena: phenomena.roll, phenomenaMod: phenomena.mod,
    canDamage: success && rows.some((r) => r.damage), canResist: success && rows.some((r) => r.save) && Boolean(target)
  });
  const label = `${combo ? combo.name : main.name} — ${localize(MAGIC_SCHOOLS[schoolKey].label)}`;
  const message = await postTest({
    actor, label, testResult, rollMode: options.rollMode, extraContent,
    flags: { spell: { actorUuid: actor.uuid, spellIds: spells.map((s) => s.id), raises, total: testResult.total, targetUuid: target?.uuid ?? "", success } }
  });

  if (success) {
    const created = await applySpellEffects(actor, spells, { raises, casterLevel, target, statusesToo: false });
    const concentration = spells.find((s) => s.system.duration.type === "concentration");
    if (concentration) await sustain(actor, concentration, created);
  }
  if (phenomena.roll) await rollPhenomena(actor, phenomena.mod);
  return message;
}

/**
 * Simple spell effects as Active Effects on the caster or the target (FR-012). Statuses of spells with a save wait
 * for the failed resistance.
 * @param {Actor} caster
 * @param {Item[]} spells
 * @param {{raises: number, casterLevel: number, target: Actor|null, statusesToo: boolean}} options
 * @returns {Promise<string[]>}  uuids of the effects created
 */
async function applySpellEffects(caster, spells, { raises, casterLevel, target, statusesToo }) {
  const created = [];
  const combat = game.combat?.started ? game.combat : null;
  for (const spell of spells) {
    const auto = spell.system.automation;
    if (!auto.target) continue;
    const recipient = auto.target === "self" ? caster : target ?? caster;
    const changes = auto.changes.map((c) => ({
      key: c.key, mode: 2,
      value: String(perRaiseChange({ value: c.value + c.perLevel * casterLevel, perRaise: c.perRaise, capLevelMultiplier: c.capLevelMultiplier }, { raises, casterLevel }))
    }));
    const statuses = spell.system.save && !statusesToo ? [] : auto.statuses;
    if (!changes.length && !statuses.length) continue;
    const d = spell.system.duration;
    const rounds = d.type === "rounds" ? (d.perLevel ? casterLevel : Math.max(1, d.value)) : 0;
    const [effect] = await recipient.createEmbeddedDocuments("ActiveEffect", [{
      name: spell.name, img: spell.img, changes, statuses,
      flags: { dtd40k: { spell: spell.name, casterUuid: caster.uuid, ...(rounds && combat ? { expiresRound: combat.round + rounds } : {}) } }
    }]);
    if (effect) created.push(effect.uuid);
  }
  return created;
}

/**
 * Keep a Concentration spell going (FR-014).
 * @param {Actor} actor
 * @param {Item} spell
 * @param {string[]} effects
 */
async function sustain(actor, spell, effects) {
  const list = [...actor._source.system.magic.sustained, {
    id: foundry.utils.randomID(), name: spell.name, spellId: spell.id, action: spell.system.duration.concentration || "half", effects
  }];
  await actor.update({ "system.magic.sustained": list });
}

/**
 * End a sustained spell and its effects.
 * @param {Actor} actor
 * @param {string} id
 */
export async function endSustained(actor, id) {
  const entry = actor.system.magic.sustained.find((s) => s.id === id);
  if (!entry) return;
  for (const uuid of entry.effects) {
    const effect = await foundry.utils.fromUuid(uuid);
    if (effect) await effect.delete();
  }
  await actor.update({ "system.magic.sustained": actor._source.system.magic.sustained.filter((s) => s.id !== id) });
}

/**
 * Start of the caster's turn (FR-014): each sustained spell spends its concentration action; without one it ends.
 * Called by DtdCombat#_onStartTurn on the active GM.
 * @param {Combatant} combatant
 */
export async function sustainTurn(combatant) {
  const actor = combatant?.actor;
  if (!actor || actor.type !== "character") return;
  for (const entry of actor.system.magic.sustained) {
    const ok = await takeAction(actor, { key: `sustain:${entry.id}`, name: entry.name, type: entry.action === "reaction" ? "reaction" : "half" });
    const text = game.i18n.format(ok ? "DTD.Magic.Sustaining" : "DTD.Magic.SustainEnds", { spell: entry.name });
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${text}</p>` });
    if (!ok) await endSustained(actor, entry.id);
  }
}

/**
 * Roll the damage of a spell card: a damage card with `magic`, so the combat Apply uses the target's Aura (FR-011).
 * @param {ChatMessage} message
 */
export async function rollSpellDamage(message) {
  const data = message.getFlag("dtd40k", "spell");
  const actor = data ? await foundry.utils.fromUuid(data.actorUuid) : null;
  if (!actor?.isOwner) return null;
  const casterLevel = actor.system.magic.state.casterLevel;
  let last = null;
  for (const id of data.spellIds) {
    const spell = actor.items.get(id);
    const damage = spell ? spellDamage(spell.system, { casterLevel }) : null;
    if (!damage) continue;
    const normalized = normalizePool({ rolled: damage.rolled, kept: damage.kept });
    const result = rollAndKeep(normalized, { rng });
    const content = await foundry.applications.handlebars.renderTemplate(DAMAGE_TEMPLATE, {
      label: game.i18n.format("DTD.Attack.DamageOf", { weapon: spell.name }),
      formula: formatPool(normalized),
      dice: result.dice.map((die) => ({ total: die.total, kept: die.kept, exploded: die.chain.length > 1, chainText: die.chain.join(" + ") })),
      total: result.total,
      type: damage.type ? localize(`DTD.DamageType.${damage.type}`) : "",
      pen: 0,
      location: localize("DTD.Location.body"),
      notes: [localize("DTD.Magic.SpellDamage")]
    });
    last = await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }), content,
      flags: { dtd40k: { damage: { total: result.total, pen: 0, type: damage.type, location: "body", magic: true, tearing: false, unarmed: false } } }
    });
  }
  return last;
}

/**
 * The target resists a spell with a Saving Throw (FR-010): Arcana + the save characteristic against the casting
 * total; on a failure the spell's conditions apply.
 * @param {ChatMessage} message
 */
export async function resistSpell(message) {
  const data = message.getFlag("dtd40k", "spell");
  const target = data?.targetUuid ? await foundry.utils.fromUuid(data.targetUuid) : null;
  if (!target?.isOwner) {
    ui.notifications.warn(localize("DTD.Combat.NotYourTarget"));
    return;
  }
  const caster = await foundry.utils.fromUuid(data.actorUuid);
  const spells = data.spellIds.map((id) => caster?.items.get(id)).filter((s) => s?.system.save);
  for (const spell of spells) {
    const roll = await target.rollSkill("arcana", {
      characteristic: spell.system.save, fastForward: true, tn: data.total, label: game.i18n.format("DTD.Magic.ResistLabel", { spell: spell.name })
    });
    const outcome = roll?.getFlag("dtd40k", "test")?.outcome;
    if (outcome && !outcome.success) {
      await applySpellEffects(caster, [spell], { raises: data.raises, casterLevel: caster.system.magic.state.casterLevel, target, statusesToo: true });
    }
  }
}

/**
 * A d100 table of the combat-tables pack by kind.
 * @param {"phenomena"|"perils"} kind
 */
async function warpTable(kind) {
  const pack = game.packs.get(TABLE_PACK);
  const index = await pack.getIndex({ fields: ["flags.dtd40k.table"] });
  const entry = index.find((e) => e.flags?.dtd40k?.table?.kind === kind);
  return entry ? pack.getDocument(entry._id) : null;
}

/**
 * Roll Psychic Phenomena (1d100 + modifier) and apply the simple results; 75+ rolls the Perils of the Warp (FR-009).
 * @param {Actor} actor
 * @param {number} mod
 * @param {"phenomena"|"perils"} [kind]
 */
export async function rollPhenomena(actor, mod, kind = "phenomena") {
  const table = await warpTable(kind);
  if (!table) return;
  const roll = await new Roll(`1d100 + ${Math.max(0, mod)}`).evaluate();
  const result = tableRow(table.results.contents.sort((a, b) => a.range[0] - b.range[0]), roll.total);
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<p><b>${table.name}</b>: ${roll.total}</p>${result.description}`,
    rolls: [roll]
  });
  const effect = result.getFlag("dtd40k", "effect") ?? {};
  for (const id of effect.statuses ?? []) await toggleCondition(actor, id, { active: true, rounds: effect.rounds ?? null });
  const hp = await rollValue(effect.hpLoss);
  if (hp) await actor.update({ "system.hp.value": Math.max(0, actor.system.hp.value - hp) });
  if (effect.test) {
    const msg = await actor.rollCharacteristic(effect.test.characteristic, { fastForward: true, tn: effect.test.tn, label: table.name });
    const outcome = msg?.getFlag("dtd40k", "test")?.outcome;
    if (outcome && !outcome.success) await toggleCondition(actor, effect.test.onFail, { active: true, rounds: effect.test.rounds ?? null });
  }
  const insanity = await rollValue(effect.insanity);
  if (insanity) await addInsanity(actor, insanity);
  if (effect.dead) await toggleCondition(actor, "dead", { active: true });
  if (effect.perils) await rollPhenomena(actor, 0, "perils");
}

/**
 * Learn a Spell Combo (FR-015): two or more known Combo-OK spells; 50 XP × the sum of their levels; not while the
 * character is being created.
 * @param {Actor} actor
 * @param {string[]} spellIds
 * @param {string} name
 */
export async function learnCombo(actor, spellIds, name) {
  const spells = spellIds.map((id) => actor.items.get(id)).filter(Boolean);
  if (spells.length < 2 || spells.some((s) => !s.system.keywords.includes("comboOk"))) {
    ui.notifications.warn(localize("DTD.Magic.ComboNeedsOk"));
    return;
  }
  if (actor.system.creation?.active) {
    ui.notifications.warn(localize("DTD.Magic.ComboNotAtCreation"));
    return;
  }
  const cost = advanceCost("combo", spells.reduce((sum, s) => sum + s.system.level, 0));
  if (cost > actor.system.xp.totals.available) {
    ui.notifications.warn(game.i18n.format("DTD.XP.Error.notEnough", { cost, available: actor.system.xp.totals.available }));
    return;
  }
  const label = name || spells.map((s) => s.name).join(" + ");
  if (!(await confirm(localize("DTD.Magic.LearnCombo"), `<p>${game.i18n.format("DTD.XP.BuyConfirm", { label, cost, available: actor.system.xp.totals.available })}</p>`))) return;
  const id = foundry.utils.randomID();
  await actor.update({ "system.magic.combos": [...actor._source.system.magic.combos, { id, name: label, spells: spells.map((s) => s.name) }] });
  await recordEntry(actor, { kind: "combo", key: id, label, from: 0, to: 1, cost });
}
