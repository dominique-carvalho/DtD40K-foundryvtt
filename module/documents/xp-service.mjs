import { CHARACTERISTICS, MAGIC_SCHOOLS, MAX_RATING, SKILLS } from "../config.mjs";
import { fullName } from "../rules/feat.mjs";
import { advanceCost, canAdvance, undoPlan } from "../rules/xp.mjs";
import { getExaltation, setPowerStat } from "./exaltation-service.mjs";
import { getRace } from "./race-service.mjs";

/**
 * Spending and awarding XP (spec 006, US3). Contract: specs/006-classes-xp/contracts/foundry-api.md.
 */

const localize = (key) => game.i18n.localize(key);

/**
 * Classes and feats the eligibility rules read.
 * @param {Actor} actor
 */
function context(actor) {
  return {
    classes: actor.items.filter((item) => item.type === "class"),
    race: getRace(actor),
    owned: actor.items.filter((item) => item.type === "feat")
  };
}

/**
 * Yes/no confirmation dialog.
 * @param {string} title
 * @param {string} content
 */
async function confirm(title, content) {
  return Boolean(await foundry.applications.api.DialogV2.confirm({ window: { title }, content, rejectClose: false }));
}

/**
 * Refuse a purchase; the GM may allow it anyway, without charging (constitution IV).
 * @param {string} reason  DTD.XP.Error.<reason>
 * @param {object} [data]
 * @returns {Promise<boolean>}  true if the GM allowed it
 */
async function refuse(reason, data = {}) {
  const message = game.i18n.format(`DTD.XP.Error.${reason}`, data);
  ui.notifications.warn(message);
  if (!game.user.isGM) return false;
  return confirm(localize("DTD.XP.GMOverrideTitle"), `<p>${message}</p><p>${localize("DTD.XP.GMOverride")}</p>`);
}

/**
 * Add a purchase or an award to the XP ledger.
 * @param {Actor} actor
 * @param {object} entry
 */
export async function recordEntry(actor, entry) {
  const log = [...actor._source.system.xp.log, {
    id: foundry.utils.randomID(),
    type: "purchase",
    kind: "",
    key: "",
    label: "",
    from: 0,
    to: 0,
    cost: 0,
    itemId: "",
    reason: "",
    user: game.user.name,
    date: Date.now(),
    ...entry
  }];
  await actor.update({ "system.xp.log": log });
}

/**
 * Buy one point of a characteristic, a skill or the Power Stat in advance mode (FR-013, FR-014).
 * The stored (base) value goes up by one; the cost follows the class lists and Free Study.
 * @param {Actor} actor
 * @param {"characteristic"|"skill"|"powerStat"|"school"} kind
 * @param {string} [key]
 * @returns {Promise<boolean>}
 */
export async function advance(actor, kind, key = "") {
  const label = kind === "characteristic" ? localize(CHARACTERISTICS[key].label)
    : kind === "skill" ? localize(SKILLS[key].label)
      : kind === "school" ? localize(MAGIC_SCHOOLS[key].label)
        : getExaltation(actor)?.system.powerStat.name ?? localize("DTD.Exaltation.PowerStat");
  // Magic Schools (spec 009): stored rank, capped at the Level by canAdvance.
  const schoolPath = `system.magic.schools.${key}.value`;

  let from;
  if (kind === "powerStat") {
    const state = actor.system.exaltation;
    if (!state) return false;
    from = state.powerStat.value;
    // The Power Stat never goes above its cap (Level; Devotion for the Chosen).
    if (from >= state.powerStat.max) {
      ui.notifications.warn(game.i18n.format("DTD.XP.Error.atMax", { label }));
      return false;
    }
  } else if (kind === "school") {
    from = foundry.utils.getProperty(actor._source, schoolPath);
  } else {
    const path = `system.${kind === "characteristic" ? "characteristics" : "skills"}.${key}.value`;
    from = foundry.utils.getProperty(actor._source, path);
    const final = foundry.utils.getProperty(actor, path);
    if (final >= MAX_RATING) {
      ui.notifications.warn(game.i18n.format("DTD.XP.Error.atMax", { label }));
      return false;
    }
  }

  const check = canAdvance({ kind, key, ...context(actor), level: actor.system.level, from });
  let cost = advanceCost(kind, from) * check.multiplier;
  if (!check.allowed) {
    if (!(await refuse(check.reason, { label }))) return false;
    cost = 0;
  } else if (cost > actor.system.xp.totals.available) {
    ui.notifications.warn(game.i18n.format("DTD.XP.Error.notEnough", { cost, available: actor.system.xp.totals.available }));
    return false;
  }

  if (kind === "powerStat") await setPowerStat(actor, from + 1);
  else if (kind === "school") await actor.update({ [schoolPath]: from + 1 });
  else await actor.update({ [`system.${kind === "characteristic" ? "characteristics" : "skills"}.${key}.value`]: from + 1 });
  await recordEntry(actor, { kind, key, label: `${label} ${from} → ${from + 1}`, from, to: from + 1, cost });
  return true;
}

/**
 * Price of a feat, racial feat, asset or hindrance about to be added by drag (FR-018). Hindrances
 * cost nothing; assets always 100; feats follow the class lists (a refusal may be overridden by the GM,
 * free of charge).
 * @param {Actor} actor
 * @param {Item} feat
 * @param {object} selection
 * @returns {Promise<{ok: boolean, cost: number}>}
 */
export async function priceFeat(actor, feat, selection) {
  const category = feat.system.category;
  if (category === "hindrance") return { ok: true, cost: 0 };
  const name = fullName({ name: feat.name, system: { selection } });
  let cost = advanceCost(category === "asset" ? "asset" : "feat", 0);
  if (category !== "asset") {
    const probe = { name: feat.name, system: { ...feat.system, selection } };
    const check = canAdvance({ kind: "feat", feat: probe, ...context(actor) });
    if (!check.allowed) return { ok: await refuse(check.reason, { label: name }), cost: 0 };
  }
  const available = actor.system.xp.totals.available;
  if (cost > available) {
    ui.notifications.warn(game.i18n.format("DTD.XP.Error.notEnough", { cost, available }));
    return { ok: false, cost: 0 };
  }
  const ok = await confirm(localize("DTD.XP.Buy"), `<p>${game.i18n.format("DTD.XP.BuyConfirm", { label: name, cost, available })}</p>`);
  if (!ok) cost = 0;
  return { ok, cost };
}

/**
 * Undo an entry of the ledger (FR-016): owners undo the last one, the GM any. Purchases restore the
 * value if it is still the purchased one and delete bought items; the XP comes back.
 * @param {Actor} actor
 * @param {string} entryId
 */
export async function undoXp(actor, entryId) {
  const log = actor._source.system.xp.log;
  const index = log.findIndex((entry) => entry.id === entryId);
  if (index < 0) return;
  if (!game.user.isGM && index !== log.length - 1) {
    ui.notifications.warn(localize("DTD.XP.Error.onlyLast"));
    return;
  }
  const entry = log[index];
  if (!(await confirm(localize("DTD.XP.Undo"), `<p>${game.i18n.format(entry.type === "award" ? "DTD.XP.UndoAwardConfirm" : "DTD.XP.UndoConfirm", { label: entry.label || entry.reason, cost: entry.cost })}</p>`))) return;

  if (entry.type === "purchase") {
    const exaltation = getExaltation(actor);
    const current = entry.kind === "powerStat" ? exaltation?.system.powerStat.value ?? null
      : entry.kind === "characteristic" || entry.kind === "skill"
        ? foundry.utils.getProperty(actor._source, `system.${entry.kind === "characteristic" ? "characteristics" : "skills"}.${entry.key}.value`)
        : entry.kind === "school" ? foundry.utils.getProperty(actor._source, `system.magic.schools.${entry.key}.value`) : null;
    // A learned Spell Combo leaves with its purchase (spec 009).
    if (entry.kind === "combo") {
      await actor.update({ "system.magic.combos": actor._source.system.magic.combos.filter((c) => c.id !== entry.key) });
    }
    const plan = undoPlan(entry, current);
    if (plan.restore?.path === "powerStat") await exaltation.update({ "system.powerStat.value": plan.restore.value });
    else if (plan.restore) await actor.update({ [plan.restore.path]: plan.restore.value });
    else if (!["feat", "asset", "combo"].includes(entry.kind)) ui.notifications.info(localize("DTD.XP.RefundOnly"));
    if (plan.deleteItem && actor.items.has(plan.deleteItem)) await actor.items.get(plan.deleteItem).delete();
  }
  await actor.update({ "system.xp.log": actor._source.system.xp.log.filter((item) => item.id !== entryId) });
}

/**
 * Award XP (GM only), with a reason shown in the ledger (FR-016).
 * @param {Actor} actor
 * @param {number} amount
 * @param {string} reason
 */
export async function awardXp(actor, amount, reason) {
  if (!game.user.isGM || !Number.isFinite(amount) || amount === 0) return;
  await recordEntry(actor, { type: "award", cost: Math.round(amount), reason: reason?.trim() ?? "", label: reason?.trim() ?? "" });
}
