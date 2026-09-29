/**
 * The combat actions of the book and initiative order (spec 008, research R4/R6).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 423–430 (actions, summaries in our own words), p. 435 (Clear Jam), p. 442–444 (conditions),
 * p. 422 (initiative). Where the summary table and the action text disagree, the text wins (spec assumptions).
 */

const action = (key, name, type, subtypes, page, summary, automation = {}) => ({ key, name, type, subtypes, page, summary, automation });

/** The 38 combat actions. */
export const COMBAT_ACTIONS = [
  action("aidAnother", "Aid Another", "half", ["miscellaneous"], 425, "An adjacent ally gets +1k1 on their next Test; you need at least one dot in the skill. Not for spells, Fear or resisting poison; at most two helpers."),
  action("aim", "Aim", "varies", ["concentration"], 425, "Half Action: +1k0 on your next attack; Full Action: +2k1. Lost if you do anything else first or use a reaction.", { attack: { aim: true } }),
  action("allOutAttack", "All Out Attack", "full", ["attack", "melee"], 425, "Melee attack at +2k0, but no reactions until your next turn.", { attack: { melee: true, allOut: true }, effect: "allOutAttack" }),
  action("brace", "Brace", "half", ["miscellaneous"], 425, "Brace a heavy weapon before firing; moving loses it. Unbraced heavy weapons take −3k1."),
  action("bullRush", "Bull Rush", "half", ["attack", "melee", "movement"], 425, "Opposed Strength Tests; if you win, push the target 2 m, plus 2 m per raise.", { roll: { characteristic: "str" }, opposed: "bullRush" }),
  action("calledShot", "Called Shot", "full", ["attack", "concentration", "melee", "ranged"], 425, "Pick the hit location and attack at −2k0.", { attack: { calledShot: true } }),
  action("charge", "Charge", "full", ["attack", "melee", "movement", "provokes"], 425, "Move in a straight line (at least 4 m, up to 2× Speed) and make one melee attack at +1k0.", { attack: { melee: true, charge: true } }),
  action("delay", "Delay", "half", ["miscellaneous"], 426, "Hold a Half Action to use before your next turn; if it reacts to someone else's action, it goes first.", { delay: true }),
  action("disarm", "Disarm", "half", ["attack", "melee"], 426, "Opposed Weaponry Tests; with 2 or more raises the opponent drops the weapon.", { roll: { skill: "weaponry" }, opposed: "disarm" }),
  action("dodge", "Dodge", "reaction", ["movement", "defense"], 426, "When an attack would hit you and you are aware of it: Dexterity + Acrobatics; half the total is added to your Static Defense against it.", { reaction: "dodge" }),
  action("feint", "Feint", "half", ["attack", "melee"], 426, "Opposed Weaponry Test; on a win, the next melee attack you make on that foe cannot be dodged or parried.", { roll: { skill: "weaponry" }, opposed: "feint" }),
  action("fightDefensively", "Fight Defensively", "full", ["attack", "concentration", "melee", "ranged"], 426, "Attack at −1k0 and gain one extra reaction, only for Dodge or Parry.", { attack: { defensive: true }, effect: "fightDefensively" }),
  action("focusPower", "Focus Power", "varies", ["provokes"], 426, "Cast a spell: Test the characteristic and TN the spell gives."),
  action("fullAutoBurst", "Full Auto Burst", "full", ["attack", "ranged", "provokes"], 426, "Full-auto weapon: Ballistics at +2k1; each raise adds a hit, up to the ROF, each worth +1k0 damage.", { attack: { mode: "auto" } }),
  action("fullDefense", "Full Defense", "full", ["concentration", "defense"], 427, "No attacks; until your next turn you get two extra reactions and +10 Static Defense.", { effect: "fullDefense" }),
  action("grapple", "Grapple", "full", ["attack", "melee"], 427, "Brawl attack; on a hit you control the grapple and choose an option each turn with opposed Strength; the grappled target has its own options.", { attack: { melee: true, unarmed: true }, grapple: "enter" }),
  // The grapple, each turn (spec 017, p. 427).
  action("grappleControl", "Control Grapple", "full", ["melee"], 427, "Controller: opposed Strength; if you win, pick one option (attack with a one-handed weapon, throw down, push, ready, stand, use an item).", { grapple: "control" }),
  action("breakFree", "Break Free", "full", ["melee"], 427, "Grappled: opposed Strength; if you win, the grapple ends and you regain a Half Action.", { grapple: "breakFree" }),
  action("slipFree", "Slip Free", "full", ["melee"], 427, "Grappled: Dexterity TN 20; on a success the grapple ends and you regain a Half Action.", { grapple: "slipFree" }),
  action("takeControl", "Take Control", "full", ["melee"], 427, "Grappled: opposed Strength; if you win, you control the grapple and pick an option at once.", { grapple: "takeControl" }),
  action("healingSurge", "Healing Surge", "half", ["miscellaneous"], 428, "Spend Resource Points up to your Level to heal as many HP, and +5 Static Defense until your next turn.", { effect: "healingSurge" }),
  action("knockDown", "Knock Down", "half", ["attack", "melee"], 428, "Opposed Strength; if you win the target is knocked Prone; if it wins by 2 raises you fall.", { roll: { characteristic: "str" }, opposed: "knockDown" }),
  action("move", "Move", "varies", ["movement", "provokes"], 428, "Half Action: move your Speed in metres; Full Action: twice that. Leaving an engaged foe provokes."),
  action("multipleAttacks", "Multiple Attacks", "full", ["attack", "melee", "ranged"], 428, "With two weapons or a feat (Swift Attack, Lightning Attack, Double Tap): several attacks, each after the first costs a reaction.", { multiple: true }),
  action("opportunityAttack", "Opportunity Attack", "free", ["attack", "melee"], 429, "When an engaged foe takes a Provokes action, make a Standard Attack against it; once per turn.", { attack: { melee: true } }),
  action("overwatch", "Overwatch", "full", ["attack", "concentration", "ranged"], 429, "Set a 45° kill zone and a trigger for Suppressing Fire or a Full Auto Burst before your next turn; any action or reaction ends it.", { zone: "overwatch" }),
  action("parry", "Parry", "reaction", ["melee", "defense"], 429, "With a weapon that can parry: Weaponry or Brawl (skill k skill, +Level k0 if proficient); half the total is added to your Static Defense against that melee attack.", { reaction: "parry" }),
  action("ready", "Ready", "half", ["miscellaneous", "provokes"], 429, "Draw or put away an item, or a small task such as bandaging or poisoning a blade."),
  action("reload", "Reload", "varies", ["miscellaneous", "provokes"], 429, "Reload a ranged weapon; the time comes from its Reload value."),
  action("run", "Run", "full", ["movement", "provokes"], 429, "Move 6× Speed; until your next turn ranged attacks against you take −2k0 and melee attacks get +2k0.", { effect: "running" }),
  action("shift", "Shift", "half", ["movement"], 429, "Move your Dexterity in metres without provoking."),
  action("stand", "Stand", "half", ["movement", "provokes"], 429, "Get up; ends Prone.", { removes: "prone" }),
  action("standardAttack", "Standard Attack", "half", ["attack", "melee", "ranged"], 429, "One melee or ranged attack.", { attack: {} }),
  action("suppressingFire", "Suppressing Fire", "full", ["attack", "ranged"], 430, "Full-auto weapon: a 45° kill zone; everyone inside tests for Pinning; next turn one roll hits uncovered targets whose Static Defense it beats, up to the ROF.", { zone: "suppressing" }),
  action("tacticalAdvance", "Tactical Advance", "full", ["concentration", "movement"], 430, "Move from cover to cover, up to 2× Speed, keeping the cover you left during the move.", { tactical: true }),
  action("useSkill", "Use a Skill", "varies", ["concentration", "miscellaneous"], 430, "Use a skill; timing and Test come from the skill."),
  action("withdraw", "Withdraw", "full", ["concentration", "movement"], 430, "Leave melee with a half move, without provoking."),
  action("clearJam", "Clear Jam", "full", ["miscellaneous"], 435, "Tech-Use or Ballistics TN 15: the jam clears, the loaded ammunition is lost and the weapon must be reloaded.", { roll: { skill: "techUse", tn: 15 } }),
  action("dropProne", "Drop Prone", "free", ["movement"], 444, "Drop to the ground at will.", { adds: "prone" }),
  action("extinguishFlames", "Extinguish Flames", "full", ["miscellaneous"], 443, "While on fire: drop prone and Test Dexterity TN 15.", { roll: { characteristic: "dex", tn: 15 }, removesOnSuccess: "onFire", adds: "prone" }),
  action("staunchBleeding", "Staunch Bleeding", "full", ["miscellaneous"], 442, "Medicae TN 20 (30 while doing something strenuous) stops Blood Loss; someone else may try.", { roll: { skill: "medicae", tn: 20 }, removesOnSuccess: "bloodLoss" }),
  action("spendHeroPoint", "Spend Hero Point", "free", ["miscellaneous"], 420, "Reroll a failed Test, lower a TN by 5 before rolling, add a raise to a success, or end Stunned.")
];

/**
 * The d10 of an initiative result: initiative − Dex − Cmp − modifier (p. 422).
 * @param {{initiative: number, dex: number, cmp: number, mod?: number}} input
 */
export function initiativeDie({ initiative, dex, cmp, mod = 0 }) {
  return initiative - dex - cmp - mod;
}

/**
 * Initiative order (p. 422): higher initiative, then higher die, then higher Dexterity; still tied → 0 (reroll).
 * @param {{initiative: number|null, die: number, dex: number}} a
 * @param {{initiative: number|null, die: number, dex: number}} b
 * @returns {number}  negative when a goes first
 */
export function compareInitiative(a, b) {
  const ia = Number.isFinite(a.initiative) ? a.initiative : -Infinity;
  const ib = Number.isFinite(b.initiative) ? b.initiative : -Infinity;
  return (ib - ia) || (b.die - a.die) || (b.dex - a.dex);
}
