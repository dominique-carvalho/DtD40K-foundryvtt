/**
 * Reactions, defensive actions and situational attack modifiers (spec 008, research R6/R7).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 425–430 (actions), pp. 433–436 (Combat Advantage, ganging up, terrain, running targets,
 * shooting into melee, two weapons), pp. 442–444 (conditions).
 */

/**
 * Dodge (p. 426): Dexterity + Acrobatics as a skill Test; −2k0 while Prone, −1k0 on difficult terrain.
 * @param {{dex: number, acrobatics: number, prone?: boolean, difficultTerrain?: boolean}} input
 * @returns {{rolled: number, kept: number}}  modifiers to add to the skill pool
 */
export function dodgeModifiers({ prone = false, difficultTerrain = false } = {}) {
  return { rolled: (prone ? -2 : 0) + (difficultTerrain ? -1 : 0), kept: 0 };
}

/**
 * Parry (p. 429): Weaponry or Brawl, skill k skill, +Level k0 when proficient.
 * @param {{skill: number, level: number, proficient: boolean}} input
 * @returns {{rolled: number, kept: number}}
 */
export function parryPool({ skill, level, proficient }) {
  return { rolled: skill + (proficient ? level : 0), kept: skill };
}

/**
 * Half the Dodge or Parry total is added to Static Defense against that attack (pp. 426, 429).
 * @param {number} sd
 * @param {number} total
 */
export function defendedSd(sd, total) {
  return sd + Math.floor(Math.max(0, total) / 2);
}

/**
 * Does the attack still hit the raised Static Defense?
 * @param {{attackTotal: number, sd: number, requiredRaises?: number}} input
 */
export function stillHits({ attackTotal, sd, requiredRaises = 0 }) {
  return attackTotal >= sd + 5 * requiredRaises;
}

/**
 * Reactions per round: 1, plus effect bonuses (Full Defense +2, Fight Defensively +1, Resource Point +1);
 * none after All Out Attack; none while Stunned, Helpless or Unconscious.
 * @param {Set<string>|string[]} statuses
 * @param {number} [bonus]  `modifiers.combat.reactions`
 */
export function reactionsMax(statuses, bonus = 0) {
  const has = (id) => (statuses instanceof Set ? statuses.has(id) : statuses.includes(id));
  if (has("allOutAttack") || has("stunned") || has("helpless") || has("unconscious") || has("dead")) return 0;
  return 1 + Math.max(0, bonus);
}

/**
 * What the conditions of a character mean in combat (pp. 442–444).
 * @param {Set<string>|string[]} statuses
 */
export function combatFlags(statuses) {
  const has = (id) => (statuses instanceof Set ? statuses.has(id) : statuses.includes(id));
  return {
    cannotAct: has("stunned") || has("unconscious") || has("dead") || has("helpless"),
    grantsAdvantage: ["surprised", "stunned", "blinded", "restrained", "helpless", "unconscious"].some(has),
    grantsAdvantageMelee: has("prone"),
    helpless: has("helpless") || has("unconscious"),
    autoFailBallistics: has("blinded"),
    noDodge: has("lostLeg") || has("stunned") || has("helpless") || has("unconscious"),
    movementBlocked: has("immobilized") || has("grappled"),
    halfActionsOnly: has("pinned")
  };
}

/**
 * Situational attack modifiers (pp. 433–436).
 * @param {{advantage?: boolean, gangUp?: 0|2|3, targetRan?: boolean, intoMelee?: boolean, terrain?: ""|"difficult"|"arduous",
 *   calledShot?: boolean, targetProne?: boolean, melee: boolean, pointBlank?: boolean, allOut?: boolean, charge?: boolean,
 *   defensive?: boolean, darkness?: boolean, attackerDarkSight?: boolean}} options
 * @returns {{rolled: number, kept: number, freeRaises: number, requiredRaises: number, tn: number, notes: string[]}}  tn: added to
 *   the target number (darkness as concealment, p. 433; spec 022)
 */
export function situationModifiers(options) {
  const out = { rolled: 0, kept: 0, freeRaises: 0, requiredRaises: 0, tn: 0, notes: [] };
  const add = (rolled, note) => {
    out.rolled += rolled;
    out.notes.push(note);
  };
  const { melee } = options;
  let advantage = Boolean(options.advantage);
  if (options.targetProne && (melee || options.pointBlank)) advantage = true;
  if (options.targetProne && !melee && !options.pointBlank) {
    out.requiredRaises += 1;
    out.notes.push("targetProneRanged");
  }
  if (advantage) {
    out.freeRaises += 1;
    out.notes.push("advantage");
  }
  if (melee && options.gangUp === 2) add(2, "gangUp2");
  if (melee && options.gangUp === 3) add(3, "gangUp3");
  if (options.targetRan) add(melee ? 2 : -2, "targetRan");
  if (!melee && options.intoMelee && !advantage) {
    out.requiredRaises += 2;
    out.notes.push("intoMelee");
  }
  if (options.terrain === "difficult" && melee) add(-1, "difficultTerrain");
  if (options.terrain === "arduous") add(-2, "arduousTerrain");
  if (options.calledShot) add(-2, "calledShot");
  if (options.allOut && melee) add(2, "allOutAttack");
  if (options.charge && melee) add(1, "charge");
  if (options.defensive) add(-1, "fightDefensively");
  if (options.darkness && !options.attackerDarkSight) {
    out.tn += 5;
    out.notes.push("darkness");
  }
  return out;
}

/**
 * Two-weapon penalty per attack (p. 435): −3k0, 1 less with Ambidextrous, 2 less with Two Weapon Fighting.
 * @param {{twoWeapons: boolean, ambidextrous?: boolean, twoWeaponFighting?: boolean}} input
 * @returns {number}  rolled dice to subtract
 */
export function multipleAttackPenalty({ twoWeapons, ambidextrous = false, twoWeaponFighting = false }) {
  if (!twoWeapons) return 0;
  return Math.max(0, 3 - (ambidextrous ? 1 : 0) - (twoWeaponFighting ? 2 : 0));
}
