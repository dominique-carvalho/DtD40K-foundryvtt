import { postTest, rng } from "../dice/roll-service.mjs";
import { minionDamage, squadPool } from "../rules/minions.mjs";
import { runTest } from "../rules/test.mjs";

/**
 * Minion Squads: attacks, damage, casualties and teaming with a hero (spec 012, US3; research R5).
 * Contract: specs/012-npcs-minions/contracts/foundry-api.md ("minion-service").
 */

const localize = (key) => game.i18n.localize(key);
const ATTACK_TEMPLATE = "systems/dtd40k/templates/chat/minion-attack.hbs";
const DAMAGE_TEMPLATE = "systems/dtd40k/templates/chat/damage-card.hbs";

/**
 * Attack of a squad (FR-007): (minions attacking)k(Threat Rating) against the target's Static Defense; a hit offers
 * the damage card.
 * @param {Actor} squad
 * @param {"melee"|"ranged"} kind
 * @param {{attacking?: number, tn?: number|null}} [options]
 * @returns {Promise<ChatMessage|null>}
 */
export async function attack(squad, kind = "melee", { attacking, tn } = {}) {
  const system = squad.system;
  const profile = system[kind];
  if (!profile?.rating) {
    ui.notifications.warn(localize("DTD.Minion.NoAttack"));
    return null;
  }
  if (system.count <= 0) {
    ui.notifications.warn(localize("DTD.Minion.Defeated"));
    return null;
  }
  const target = [...game.user.targets][0]?.actor ?? null;
  const pool = squadPool({ count: system.count, attacking: attacking ?? system.count, threatRating: system.threatRating });
  const testResult = runTest({ base: pool, tn: tn ?? target?.system?.derived?.staticDefense ?? 15, rng });
  const hit = testResult.outcome ? testResult.outcome.success : true;
  const raises = testResult.outcome?.raises ?? 0;
  const extraContent = await foundry.applications.handlebars.renderTemplate(ATTACK_TEMPLATE, {
    weapon: profile.weapon, rating: profile.rating, type: profile.type ? localize(`DTD.DamageType.${profile.type}`) : "",
    hit, damage: hit ? minionDamage({ rating: profile.rating, raises }) : 0, kind: localize(`DTD.Minion.${kind}`),
    range: kind === "ranged" ? system.range : 0
  });
  const label = `${squad.name} — ${profile.weapon || localize(`DTD.Minion.${kind}`)}`;
  return postTest({
    actor: squad, label, testResult, extraContent,
    flags: { minion: { squadUuid: squad.uuid, kind, raises, hit, targetUuid: target?.uuid ?? "" } }
  });
}

/**
 * Damage of a squad hit (FR-007): 5 × (Damage Rating + raises), no roll, as a damage card of spec 008.
 * @param {ChatMessage} message
 * @returns {Promise<ChatMessage|null>}
 */
export async function rollMinionDamage(message) {
  const data = message.getFlag("dtd40k", "minion");
  const squad = data ? await foundry.utils.fromUuid(data.squadUuid) : null;
  if (!squad?.isOwner || !data.hit) return null;
  const profile = squad.system[data.kind];
  const total = minionDamage({ rating: profile.rating, raises: data.raises });
  const content = await foundry.applications.handlebars.renderTemplate(DAMAGE_TEMPLATE, {
    label: game.i18n.format("DTD.Attack.DamageOf", { weapon: profile.weapon || squad.name }),
    formula: game.i18n.format("DTD.Minion.DamageFormula", { rating: profile.rating, raises: data.raises }),
    dice: [], total,
    type: profile.type ? localize(`DTD.DamageType.${profile.type}`) : "",
    pen: 0,
    location: localize("DTD.Location.body"),
    notes: [localize("DTD.Minion.NoRoll")]
  });
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: squad }), content,
    flags: { dtd40k: { damage: { total, pen: 0, type: profile.type, location: "body", magic: false, tearing: false, unarmed: false } } }
  });
}

/**
 * Remove minions (FR-008); a squad with none left is defeated.
 * @param {Actor} squad
 * @param {number} n
 * @returns {Promise<{before: number, after: number}>}
 */
export async function removeMinions(squad, n) {
  const before = squad.system.count;
  const after = Math.max(0, before - Math.max(0, n));
  await squad.update({ "system.count": after });
  const key = after === 0 ? "DTD.Minion.AllDown" : "DTD.Minion.Removed";
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: squad }), content: `<p>${game.i18n.format(key, { name: squad.name, n: before - after, left: after })}</p>` });
  return { before, after };
}

/**
 * Team the squad with a hero (FR-009), or release it.
 * @param {Actor} squad
 * @param {Actor|null} hero
 */
export async function setAlly(squad, hero) {
  await squad.update({ "system.allyUuid": hero?.uuid ?? "" });
}

/**
 * Minion squads teamed with a character (for the skill roll bonus).
 * @param {Actor} actor
 * @returns {{threatRating: number, count: number}[]}
 */
export function alliesOf(actor) {
  return game.actors.filter((a) => a.type === "minionSquad" && a.system.allyUuid === actor.uuid)
    .map((a) => ({ threatRating: a.system.threatRating, count: a.system.count }));
}
