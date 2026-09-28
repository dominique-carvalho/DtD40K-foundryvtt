import { chaseLeader, chaseModifiers } from "../rules/vehicle.mjs";
import { pilotOf } from "./vehicle-service.mjs";

/**
 * Chases and races (spec 013, US4; research R5; p. 362): the state lives on the chase card; each round the GM rolls
 * everyone's chosen skill, the single best total gains a leg; handling the round's obstacle well gives 2 raises and
 * repeating last round's skill costs 2 checks; after the last round the leader wins.
 * Contract: specs/013-vehicles/contracts/foundry-api.md ("chase-service").
 */

const CARD_TEMPLATE = "systems/dtd40k/templates/chat/chase-card.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);

/**
 * Who rolls for a participant: a vehicle's pilot, else the actor itself.
 * @param {Actor} actor
 */
const rollerOf = (actor) => (actor?.type === "vehicle" ? pilotOf(actor) : actor);

/** Default skill of a participant: the vehicle's control skill, else Athletics. */
const defaultSkill = (actor) => (actor?.type === "vehicle" ? actor.system.drive.controlSkill : "athletics");

/**
 * Card content for the chase state.
 * @param {object} chase
 */
async function render(chase) {
  const leader = chase.done ? chaseLeader(chase.participants.map((p) => p.legs)) : -1;
  return foundry.applications.handlebars.renderTemplate(CARD_TEMPLATE, {
    ...chase,
    roundText: format("DTD.Chase.RoundOf", { round: Math.min(chase.round, chase.rounds), rounds: chase.rounds }),
    participants: chase.participants.map((p) => ({
      ...p, skillLabel: p.lastSkill ? localize(CONFIG.DTD.SKILLS[p.lastSkill]?.label ?? p.lastSkill) : "—"
    })),
    winner: chase.done ? (leader >= 0 ? chase.participants[leader].name : localize("DTD.Chase.NoWinner")) : ""
  });
}

/**
 * Open a chase (FR-011).
 * @param {Actor[]} actors  vehicles (their pilot rolls) or characters
 * @param {{rounds?: number}} [options]
 * @returns {Promise<ChatMessage|null>}
 */
export async function startChase(actors, { rounds = 4 } = {}) {
  const unique = [...new Map(actors.filter(Boolean).map((a) => [a.uuid, a])).values()];
  if (unique.length < 2) {
    ui.notifications.warn(localize("DTD.Chase.NeedTwo"));
    return null;
  }
  const chase = {
    rounds, round: 1, done: false, last: [],
    participants: unique.map((a) => ({ uuid: a.uuid, name: a.name, legs: 0, lastSkill: "", lastTotal: null }))
  };
  return ChatMessage.create({ content: await render(chase), flags: { dtd40k: { chase } } });
}

/**
 * Chase with the controlled and targeted tokens (the GM's scene control button).
 */
export async function startChaseFromCanvas() {
  const tokens = [...(canvas.tokens?.controlled ?? []), ...game.user.targets];
  return startChase(tokens.map((t) => t.actor));
}

/**
 * Mark that a participant handled this round's obstacle well (+2 raises on the next roll).
 * @param {ChatMessage} message
 * @param {string} uuid
 */
export async function markObstacle(message, uuid) {
  const chase = foundry.utils.deepClone(message.getFlag("dtd40k", "chase"));
  if (!chase || chase.done || !game.user.isGM) return;
  const p = chase.participants.find((x) => x.uuid === uuid);
  if (!p) return;
  p.obstacle = !p.obstacle;
  await message.update({ content: await render(chase), "flags.dtd40k.chase": chase });
}

/**
 * Roll the round (GM): the skill of each participant, with the obstacle and repeated-skill modifiers; the single best
 * total gains a leg.
 * @param {ChatMessage} message
 */
export async function rollChaseRound(message) {
  const chase = foundry.utils.deepClone(message.getFlag("dtd40k", "chase"));
  if (!chase || chase.done || !game.user.isGM) return;
  const actors = await Promise.all(chase.participants.map((p) => foundry.utils.fromUuid(p.uuid)));
  const skills = Object.entries(CONFIG.DTD.SKILLS).map(([key, def]) => ({ key, label: localize(def.label) }));
  const rows = chase.participants.map((p, i) => {
    const current = p.lastSkill || defaultSkill(actors[i]);
    const options = skills.map((s) => `<option value="${s.key}" ${s.key === current ? "selected" : ""}>${s.label}</option>`).join("");
    const roller = rollerOf(actors[i]);
    return `<div class="form-group"><label>${foundry.utils.escapeHTML?.(p.name) ?? p.name}${roller && roller !== actors[i] ? ` (${roller.name})` : ""}</label>
      <select name="skill${i}">${options}</select>
      <label class="checkbox"><input type="checkbox" name="obstacle${i}" ${p.obstacle ? "checked" : ""}> ${localize("DTD.Chase.Obstacle")}</label></div>`;
  }).join("");
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: `${localize("DTD.Chase.Title")} — ${format("DTD.Chase.RoundOf", { round: chase.round, rounds: chase.rounds })}` },
    classes: ["dtd40k"], position: { width: 520 }, rejectClose: false,
    content: `${rows}<p class="hint">${localize("DTD.Chase.Hint")}</p>`,
    buttons: [
      { action: "roll", label: "DTD.Chase.RollRound", icon: "fa-solid fa-flag-checkered", default: true, callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!choice || typeof choice !== "object") return;

  const totals = [];
  for (const [i, p] of chase.participants.entries()) {
    const actor = actors[i];
    const roller = rollerOf(actor);
    const skill = choice[`skill${i}`];
    const mods = chaseModifiers({ obstacle: Boolean(choice[`obstacle${i}`]), repeated: Boolean(p.lastSkill) && p.lastSkill === skill });
    // Maneuver adds to the pilot's control rolls (p. 358).
    const flat = -5 * mods.checks + (actor?.type === "vehicle" && skill === actor.system.drive.controlSkill ? actor.system.maneuver : 0);
    let total = 0;
    if (roller && CONFIG.DTD.SKILLS[skill]) {
      const roll = await roller.rollSkill(skill, {
        fastForward: true, tn: null, modifiers: { flat, freeRaises: mods.freeRaises },
        label: `${localize("DTD.Chase.Title")} — ${p.name}`
      });
      total = roll?.getFlag("dtd40k", "test")?.total ?? 0;
    }
    totals.push(total);
    Object.assign(p, { lastSkill: skill, lastTotal: total, obstacle: false });
  }
  const leader = chaseLeader(totals);
  if (leader >= 0) chase.participants[leader].legs += 1;
  chase.last = chase.participants.map((p, i) => ({ name: p.name, total: totals[i], ahead: i === leader }));
  chase.round += 1;
  chase.done = chase.round > chase.rounds;
  await message.update({ content: await render(chase), "flags.dtd40k.chase": chase });
}
