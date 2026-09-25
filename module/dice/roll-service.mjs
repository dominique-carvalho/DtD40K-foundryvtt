/**
 * Foundry adapter for Roll & Keep tests: randomness, display Roll (chat + Dice So Nice)
 * and the chat card. Roll & Keep semantics live in module/rules (research R2).
 */
import { formatPool } from "../rules/pool.mjs";

const CARD_TEMPLATE = "systems/dtd40k/templates/chat/roll-card.hbs";

/** Uniform random source shared with Foundry core dice. */
export const rng = () => CONFIG.Dice.randomUniform();

/**
 * Build an already-evaluated Roll mirroring a Roll & Keep result, so chat messages and
 * Dice So Nice show the real faces. Kept dice faces are active; dropped dice, rerolled 1s
 * and 10s worth 0 (zero characteristic) are inactive, so roll.total equals the test total.
 * @param {import("../rules/test.mjs").TestResult} test
 * @returns {Roll}
 */
export function buildDisplayRoll(test) {
  const { Die, NumericTerm, OperatorTerm } = foundry.dice.terms;
  const results = [];
  for (const die of test.dice) {
    for (const face of die.rerolled ?? []) results.push({ result: face, active: false, discarded: true, rerolled: true });
    die.chain.forEach((face, i) => {
      const worthless = test.flags.zeroCharacteristic && face === 10;
      const active = die.kept && !worthless;
      const result = { result: face, active };
      if (!active) result.discarded = true;
      if (i < die.chain.length - 1) result.exploded = true;
      results.push(result);
    });
  }
  const terms = [new Die({ number: results.length, faces: 10, results })];
  const flat = test.pool.flat;
  if (flat) terms.push(new OperatorTerm({ operator: flat > 0 ? "+" : "-" }), new NumericTerm({ number: Math.abs(flat) }));
  for (const term of terms.slice(1)) term._evaluated = true;
  return Roll.fromTerms(terms);
}

/**
 * Data for the chat card template.
 * @param {string} label
 * @param {import("../rules/test.mjs").TestResult} test
 */
function cardContext(label, test) {
  return {
    label,
    formula: formatPool(test.pool),
    conversion: test.pool.conversion,
    dice: test.dice.map((die) => ({
      chainText: die.chain.join(" + "),
      exploded: die.chain.length > 1,
      total: die.total,
      kept: die.kept,
      rerolled: die.rerolled?.join(", ")
    })),
    flat: test.pool.flat,
    total: test.total,
    tn: test.tn,
    outcome: test.outcome,
    untrained: test.flags.untrained,
    zeroCharacteristic: test.flags.zeroCharacteristic,
    specialty: test.flags.specialty
  };
}

/**
 * Post a test result to chat.
 * @param {object} args
 * @param {Actor} args.actor
 * @param {string} args.label                 localized test name, e.g. "Weaponry + Dexterity"
 * @param {import("../rules/test.mjs").TestResult} args.testResult
 * @param {string} [args.rollMode]            one of CONFIG.Dice.rollModes (v13); defaults to core setting
 * @returns {Promise<ChatMessage>}
 */
export async function postTest({ actor, label, testResult, rollMode }) {
  const roll = buildDisplayRoll(testResult);
  const content = await foundry.applications.handlebars.renderTemplate(CARD_TEMPLATE, cardContext(label, testResult));
  const mode = rollMode ?? game.settings.get("core", "rollMode");
  const chatData = {
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls: [roll],
    content,
    sound: CONFIG.sounds.dice,
    flags: { dtd40k: { test: { ...testResult, label, actorUuid: actor.uuid } } }
  };
  ChatMessage.applyRollMode(chatData, mode);
  return ChatMessage.create(chatData, { rollMode: mode });
}
