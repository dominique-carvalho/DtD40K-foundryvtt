import { criticalPlan } from "../rules/critical.mjs";
import { fearTn, insanityThresholds, traumaTn } from "../rules/mental.mjs";
import { rollValue, toggleCondition } from "./condition-service.mjs";

/**
 * Fear and Insanity (spec 008, US4; research R9).
 * Contract: specs/008-combat/contracts/foundry-api.md ("mental-service").
 */

const TABLE_PACK = "dtd40k.combat-tables";
const localize = (key) => game.i18n.localize(key);

/**
 * A table of the pack by kind (shock or trauma).
 * @param {string} kind
 */
async function tableOf(kind) {
  const pack = game.packs.get(TABLE_PACK);
  const index = await pack.getIndex({ fields: ["flags.dtd40k.table"] });
  const entry = index.find((e) => e.flags?.dtd40k?.table?.kind === kind);
  return entry ? pack.getDocument(entry._id) : null;
}

/**
 * Draw a table with 1d10 + checks and apply the simple effects of the result.
 * @param {Actor} actor
 * @param {"shock"|"trauma"} kind
 * @param {number} checks
 */
async function drawWithChecks(actor, kind, checks) {
  const table = await tableOf(kind);
  if (!table) return;
  const roll = new Roll(`1d10 + ${Math.max(0, checks)}`);
  const draw = await table.draw({ roll, displayChat: true });
  const result = draw.results[0];
  const plan = criticalPlan(result?.getFlag("dtd40k", "effect"));
  for (const id of plan.statuses) await toggleCondition(actor, id, { active: true, rounds: plan.rounds });
  const insanity = await rollValue(plan.insanity);
  if (insanity) await addInsanity(actor, insanity);
}

/**
 * Fear Test (FR-019): Willpower against the Fear rating's TN; in combat a failure rolls the Shock Table
 * (1d10 + 1 per Check); out of combat −1k1 near the source and +1d5 Insanity.
 * @param {Actor} actor
 * @param {number} rating  1–5
 * @param {{inCombat?: boolean}} [options]
 */
export async function fearTest(actor, rating, { inCombat = Boolean(game.combat?.started) } = {}) {
  const tn = fearTn(rating);
  const message = await actor.rollCharacteristic("wil", { tn, label: game.i18n.format("DTD.Mental.FearLabel", { rating }) });
  const outcome = message?.getFlag("dtd40k", "test")?.outcome;
  if (!outcome || outcome.success) return;
  if (inCombat) return drawWithChecks(actor, "shock", outcome.checks ?? 0);
  const points = await rollValue("1d5");
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${game.i18n.format("DTD.Mental.FearOutside", { points })}</p>` });
  await addInsanity(actor, points);
}

/**
 * Add Insanity points (FR-020): a Trauma Test every 10 (failure rolls Mental Traumas), a derangement every 20,
 * removal from play at 100.
 * @param {Actor} actor
 * @param {number} points
 */
export async function addInsanity(actor, points) {
  const before = actor.system.insanity.value;
  const after = Math.min(100, before + Math.max(0, points));
  await actor.update({ "system.insanity.value": after });
  const crossed = insanityThresholds(before, after);
  for (let i = 0; i < crossed.traumaTests; i++) {
    const message = await actor.rollCharacteristic("wil", {
      fastForward: true, tn: traumaTn(after), label: localize("DTD.Mental.TraumaTest")
    });
    const outcome = message?.getFlag("dtd40k", "test")?.outcome;
    if (outcome && !outcome.success) await drawWithChecks(actor, "trauma", outcome.checks ?? 0);
  }
  if (crossed.derangements) {
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${game.i18n.format("DTD.Mental.Derangement", { name: actor.name, n: crossed.derangements })}</p>` });
  }
  if (crossed.removed) {
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p>${game.i18n.format("DTD.Mental.Removed", { name: actor.name })}</p>` });
  }
}
