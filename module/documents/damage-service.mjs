import { criticalPlan, criticalTableKey } from "../rules/critical.mjs";
import { resolveDamage } from "../rules/damage.mjs";
import { addFatigue, rollValue, toggleCondition } from "./condition-service.mjs";
import { removeMinions } from "./minion-service.mjs";
import { casualties } from "../rules/minions.mjs";

/**
 * Applying damage to targets and critical effects (spec 008, US1; research R1/R2).
 * Contract: specs/008-combat/contracts/foundry-api.md ("damage-service").
 */

const TABLE_PACK = "dtd40k.combat-tables";
const APPLIED_TEMPLATE = "systems/dtd40k/templates/chat/damage-applied.hbs";
const localize = (key) => game.i18n.localize(key);

/** The active GM, who performs requests on actors the player does not own. */
const activeGm = () => game.users.activeGM;

/**
 * Ask the active GM to do something (research R1).
 * @param {string} action
 * @param {object} payload
 */
export function requestGm(action, payload) {
  if (!activeGm()) {
    ui.notifications.warn(localize("DTD.Combat.NoGM"));
    return;
  }
  game.socket.emit("system.dtd40k", { action, payload, user: game.user.id });
  ui.notifications.info(localize("DTD.Combat.SentToGM"));
}

/**
 * Tokens the damage goes to: the user's targets, else the controlled tokens.
 * @returns {TokenDocument[]}
 */
function damageTargets() {
  const targets = [...game.user.targets];
  const tokens = targets.length ? targets : canvas.tokens?.controlled ?? [];
  return tokens.map((token) => token.document ?? token);
}

/**
 * Apply a damage card to its targets (FR-001 to FR-004). Players' requests on actors they do not own go to the GM.
 * @param {ChatMessage} message
 * @param {string[]} [tokenUuids]  defaults to the user's targets
 */
export async function applyDamage(message, tokenUuids) {
  const damage = message.getFlag("dtd40k", "damage");
  if (!damage) return;
  const uuids = tokenUuids ?? damageTargets().map((token) => token.uuid);
  if (!uuids.length) {
    ui.notifications.warn(localize("DTD.Combat.NoTarget"));
    return;
  }
  const tokens = await Promise.all(uuids.map((uuid) => foundry.utils.fromUuid(uuid)));
  const foreign = tokens.filter((token) => token?.actor && !token.actor.isOwner);
  if (foreign.length && !game.user.isGM) {
    requestGm("applyDamage", { messageId: message.id, tokenUuids: uuids });
    return;
  }
  const applied = [];
  const squads = [];
  for (const token of tokens) {
    const actor = token?.actor;
    // Minion Squads have no hit points: the hit removes minions (spec 012, FR-008).
    if (actor?.type === "minionSquad") {
      const before = actor.system.count;
      await removeMinions(actor, casualties({ raises: damage.raises ?? 0, blast: damage.blast ?? 0 }));
      squads.push({ actorUuid: actor.uuid, minion: true, before: { count: before } });
      continue;
    }
    if (actor?.type !== "character" && actor?.type !== "npc") {
      if (token) ui.notifications.warn(game.i18n.format("DTD.Combat.NotCharacter", { name: token.name }));
      continue;
    }
    applied.push(await applyTo(actor, token, damage));
  }
  if (!applied.length) return;
  const content = await foundry.applications.handlebars.renderTemplate(APPLIED_TEMPLATE, { rows: applied.map((a) => a.row) });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: applied[0].actor }),
    content,
    flags: { dtd40k: { applied: [...applied.map((a) => a.undo), ...squads] } }
  });
}

/**
 * Resolve and apply the damage to one actor.
 * @param {Actor} actor
 * @param {TokenDocument} token
 * @param {{total: number, pen: number, type: string, location: string, magic?: boolean, tearing?: boolean, unarmed?: boolean}} damage
 */
async function applyTo(actor, token, damage) {
  const system = actor.system;
  const cover = token.getFlag?.("dtd40k", "cover") ?? null;
  const result = resolveDamage({
    total: damage.total, pen: damage.pen, location: damage.location, magic: damage.magic, tearing: damage.tearing,
    unarmed: damage.unarmed, armor: system.armor.locations, aura: system.modifiers.combat.aura,
    resilience: system.derived.resilience, hp: system.hp.value, critical: system.critical.value, cover,
    // Special Attacks (spec 010): armor ignored or doubled, Resilience lowered or halved, no Critical Damage.
    ...(damage.resolve ?? {})
  });
  const before = { hp: system.hp.value, critical: system.critical.value, fatigue: system.fatigue.value, effects: actor.effects.map((e) => e.id) };
  await actor.update({ "system.hp.value": system.hp.value - result.hpLoss, "system.critical.value": result.critical });
  if (result.coverHit && cover) await token.setFlag("dtd40k", "cover", { ...cover, ap: Math.max(0, cover.ap - 1) });
  if (result.fatigue) await addFatigue(actor, result.fatigue);
  let critical = null;
  if (result.criticalGain > 0) critical = await applyCritical(actor, { type: damage.type, location: damage.location, row: result.row });
  return {
    actor,
    row: {
      name: actor.name,
      location: localize(`DTD.Location.${damage.location}`),
      total: damage.total,
      effective: result.effective,
      // The Resilience actually used (Special Attacks may lower or halve it, spec 010).
      resilience: result.steps.find((step) => step.label === "resilience")?.value ?? Math.max(1, system.derived.resilience),
      hpLoss: result.hpLoss,
      criticalGain: result.criticalGain,
      critical: result.critical,
      fatigue: result.fatigue,
      coverHit: result.coverHit,
      criticalText: critical?.text ?? "",
      criticalTable: critical?.table ?? ""
    },
    undo: { actorUuid: actor.uuid, tokenUuid: token.uuid, before, cover }
  };
}

/**
 * Apply the critical effect of the row for the damage type and location (FR-002).
 * @param {Actor} actor
 * @param {{type: string, location: string, row: number}} hit
 * @returns {Promise<{text: string, table: string}|null>}
 */
export async function applyCritical(actor, { type, location, row }) {
  const key = criticalTableKey(type, location);
  const pack = game.packs.get(TABLE_PACK);
  const index = await pack.getIndex({ fields: ["flags.dtd40k.table"] });
  const entry = index.find((e) => e.flags?.dtd40k?.table?.type === key.type && e.flags.dtd40k.table.location === key.location);
  if (!entry) return null;
  const table = await pack.getDocument(entry._id);
  const result = table.results.find((r) => r.range[0] <= row && row <= r.range[1]);
  if (!result) return null;
  const plan = criticalPlan(result.getFlag("dtd40k", "effect"));
  const notes = [];
  for (const id of plan.statuses) await toggleCondition(actor, id, { active: true, rounds: plan.rounds });
  const fatigue = await rollValue(plan.fatigue);
  if (fatigue) {
    await addFatigue(actor, fatigue);
    notes.push(game.i18n.format("DTD.Combat.FatigueGained", { n: fatigue }));
  }
  for (const test of plan.tests) {
    const message = await actor.rollCharacteristic(test.characteristic, {
      fastForward: true, tn: test.tn, label: game.i18n.format("DTD.Combat.CriticalTest", { table: table.name })
    });
    const outcome = message?.getFlag("dtd40k", "test")?.outcome;
    if (outcome && !outcome.success) {
      await toggleCondition(actor, test.onFail, { active: true, rounds: test.rounds ?? null });
      notes.push(game.i18n.format("DTD.Combat.TestFailed", { condition: localize(`DTD.Condition.${test.onFail}`) }));
    }
  }
  if (plan.dead) await toggleCondition(actor, "dead", { active: true });
  if (plan.halfAction) notes.push(localize("DTD.Combat.HalfActionOnly"));
  const text = `${result.description}${notes.length ? `<p>${notes.join(" · ")}</p>` : ""}`;
  return { text, table: `${table.name} ${row}` };
}

/**
 * Undo an applied-damage card — GM only (FR-004): HP, Critical Damage, Fatigue and cover come back; effects
 * created by it are removed.
 * @param {ChatMessage} message
 */
export async function undoDamage(message) {
  if (!game.user.isGM) return;
  const list = message.getFlag("dtd40k", "applied") ?? [];
  for (const entry of list) {
    const actor = await foundry.utils.fromUuid(entry.actorUuid);
    if (!actor) continue;
    if (entry.minion) {
      await actor.update({ "system.count": entry.before.count });
      continue;
    }
    const added = actor.effects.filter((effect) => !entry.before.effects.includes(effect.id)).map((effect) => effect.id);
    if (added.length) await actor.deleteEmbeddedDocuments("ActiveEffect", added);
    await actor.update({ "system.hp.value": entry.before.hp, "system.critical.value": entry.before.critical, "system.fatigue.value": entry.before.fatigue });
    if (entry.cover) {
      const token = await foundry.utils.fromUuid(entry.tokenUuid);
      await token?.setFlag("dtd40k", "cover", entry.cover);
    }
  }
  await message.setFlag("dtd40k", "undone", true);
}
