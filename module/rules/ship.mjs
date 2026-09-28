/**
 * Ships: Build Points, custom hulls, consoles, slots, weapon profiles, Crew pools, shields and Disruption, the
 * Spelljammer Crit Chart, ramming, boarding, fighters, Warp travel, bombardment and repairs (spec 014, research R2–R11).
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 386–415; specs/014-ships/contracts/rules-api.md. Table texts in our own words.
 */
import { CUSTOMIZATION, SHIP_BUDGETS, SHIP_WEAPON_TYPES } from "../config.mjs";

const action = (key, department, name, skill, stat, tn, timing, crew, page, summary) => ({ key, department, name, skill, stat, tn, timing, crew, page, summary });
const crit = (from, to, key, name, effect, mechanics) => ({ range: [from, to], key, name, effect, mechanics });
const row = (from, to, key, name, effect, mechanics = {}) => ({ range: [from, to], key, name, effect, mechanics });
const lookup = (table, n) => table.find((r) => n >= r.range[0] && n <= r.range[1]) ?? (n < table[0].range[0] ? table[0] : table.at(-1));

/** The 23 ship actions (pp. 404–406): department, skill, ship stat added, TN, timing and whether Crew is committed. */
export const SHIP_ACTIONS = [
  action("braceForImpact", "command", "Brace for Impact", "command", "", 15, "action", false, 404, "On success, this round's Crit Chart rolls against the ship are at -1, plus a further -1 per two raises."),
  action("picardSpeech", "command", "Picard Speech", "command", "", 25, "action", false, 404, "On success, each department keeps one extra die this round. Usable once per session."),
  action("micromanage", "command", "Micromanage", "command", "", 15, "action", false, 404, "Pick a department; on success it gets +1k0 on one skill test this round, plus +1k0 per two raises."),
  action("hail", "command", "Hail", "", "", null, "action", false, 404, "Open communications and start social combat with the other captain, if they listen; anger them and they may just shoot."),
  action("move", "manoeuver", "Move", "", "", null, "action", false, 404, "Move half or full Speed, then turn up to 45 degrees. No test."),
  action("adjustSpeed", "manoeuver", "Adjust Speed", "pilot", "acceleration", 20, "action", true, 404, "Move half or full Speed, then test; success changes this move by 1 VU up or down, plus 1 more per raise."),
  action("adjustHeading", "manoeuver", "Adjust Heading", "pilot", "maneuverability", 25, "action", true, 404, "Move half Speed and turn up to 45 degrees; on a successful test turn another 45 degrees."),
  action("evasiveManoeuvers", "manoeuver", "Evasive Manoeuvers", "pilot", "maneuverability", null, "reaction", true, 404, "When attacked, if some Crew have not acted yet, the pilot spends a reaction: roll and add half the result to Static Defense against that attack. Repeatable with more reactions."),
  action("rammingSpeed", "manoeuver", "Ramming Speed!", "pilot", "maneuverability", "target", "free", true, 404, "If the turn ends within 1 VU and facing the target, test; on success the target takes class damage plus the rammer's Speed, bypassing shields. The rammer takes half the rolled damage and each ship rolls a Crit at +3."),
  action("fireEverything", "tactical", "Fire Everything", "ballistics", "", "target", "action", true, 404, "Fire any number of weapons at targets in range and arc; each attack roll may use up to 10 Crew."),
  action("snipe", "tactical", "Snipe", "ballistics", "", "target", "action", true, 405, "Fire one weapon at any ship beyond normal range; the target's Static Defense rises by 2 for each VU past the weapon's range."),
  action("boardingParty", "tactical", "Boarding Party", "", "", "opposed", "action", true, 405, "Dispatch as many as 10 Crew plus one officer onto a ship no farther than 1 VU (a Tactical Officer sent is lost to your ship). Each round start both sides commit up to 10 Crew to an opposed Melee test; the loser loses half its committed Crew plus 1 per check, max 10. Officers can be captured or killed; nobody retreats until one side wins."),
  action("deployFightercraft", "tactical", "Deploy Fightercraft", "", "", null, "action", true, 405, "Requires Fighter Bay. Commit 1-10 Crew to spawn a squad of that many fighters beside the ship."),
  action("targetSubsystem", "tactical", "Target Subsystem", "ballistics", "", "target", "action", true, 405, "If the target has no shields, or you ran Active Augury this turn, fire one weapon at a chosen weapon or console, ignoring shields. A hit damages the hull and disables the part until an Emergency Repair beats a TN set by the damage dealt."),
  action("overchargeWeapons", "engineering", "Overcharge Weapons", "techUse", "", 15, "action", true, 405, "On success your next attack deals +1k1 damage, plus +1k0 per two raises."),
  action("overchargeShields", "engineering", "Overcharge Shields", "techUse", "", 15, "action", true, 405, "On success the shield regenerates immediately, plus 1d10 more per two raises. Useless on a collapsed shield."),
  action("overchargeEngines", "engineering", "Overcharge Engines", "techUse", "", 15, "action", true, 406, "Your following Manoeuver adds half Speed of extra movement; each two raises add 1 Speed to that extra move."),
  action("emergencyRepair", "engineering", "Emergency Repair", "crafts", "", 15, "action", true, 406, "On success gain 1d10 temporary hull, lost before real hull and not stacking (highest applies); +1d10 per two raises. Alternatively test Crafts against an effect's stated TN to clear it."),
  action("activeAugury", "arcana", "Active Augury", "arcana", "sensors", 15, "action", true, 406, "Scan a ship: learn one detail (weapons, consoles, or remaining hull/shield/crew), plus one per two raises; or search for a specific object or person."),
  action("spellJamming", "arcana", "Spell Jamming", "arcana", "sensors", null, "action", true, 406, "Swamp a target's sensors and helm: it fails all Arcana tests and cannot communicate unless it rolls above your result, which ends the jam. One target at a time; no Crew needed to maintain."),
  action("silentRunning", "arcana", "Silent Running", "arcana", "", null, "action", true, 406, "Only if not yet detected. Each round commit Crew and test; enemies using Active Augury must beat that total to find you. Any action except Move or Silent Running reveals the ship."),
  action("triage", "arcana", "Triage", "medicae", "", 15, "action", true, 406, "Stimulants keep failing crew going: gain 1 temporary Crew plus 1 per two raises; these are lost first and vanish at scene end."),
  action("restartShields", "arcana", "Restart Shields", "arcana", "sensors", 15, "action", true, 406, "Emergency power cycle with two modes. Cycle Shields: switch off, return next turn with Disruption cleared, same Capacity, and regenerate at once. Reboot Shields: revive a collapsed shield next turn at 0 Capacity, then regenerate at once.")
];

/** The Spelljammer Crit Chart (p. 409): 1d10 + the weapon's Crit and modifiers. */
export const SHIP_CRIT = [
  crit(-99, 0, "armorScuffing", "Armor Scuffing", "Cosmetic scraping and jostled crew; no game effect.", {}),
  crit(1, 1, "powerSurge", "Power Surge", "Sparking conduits; lose 1 Crew.", {"crewLoss":1}),
  crit(2, 2, "minorDamage", "Minor Damage", "Attacker picks a console; it is disabled until repaired.", {"repairTn":15,"disable":true,"persistent":true}),
  crit(3, 3, "radiationLeak", "Radiation Leak", "Every round, as it ends, 1 Crew dies until fixed.", {"repairTn":15,"crewLossPerRound":1,"persistent":true}),
  crit(4, 4, "sensorsDamaged", "Sensors Damaged", "Sensors -20 until repaired.", {"repairTn":15,"sensors":-20,"persistent":true}),
  crit(5, 5, "ventingPlasma", "Venting Plasma", "No Overcharge actions until repaired; lose 1d5 Crew.", {"crewLoss":"1d5","repairTn":15,"blocks":["overcharge"],"persistent":true}),
  crit(6, 6, "bridgeRattled", "Bridge Rattled", "No Command Actions until repaired; lose 1 Crew.", {"crewLoss":1,"repairTn":15,"blocks":["command"],"persistent":true}),
  crit(7, 7, "thrustersDamaged", "Thrusters Damaged", "Adjust Heading and Evasive Manoeuvers unavailable until repaired.", {"repairTn":20,"blocks":["adjustHeading","evasiveManoeuvers"],"persistent":true}),
  crit(8, 8, "hullCracked", "Hull Cracked", "Extra 1d10 Hull Strength lost; lose 2 Crew.", {"crewLoss":2,"hullLoss":"1d10"}),
  crit(9, 9, "systemFailure", "System Failure", "Attacker picks a console to disable until repaired; lose 2 Crew.", {"crewLoss":2,"repairTn":25,"disable":true,"persistent":true}),
  crit(10, 10, "weaponsOffline", "Weapons Offline", "No weapon can fire until the relays are repaired.", {"repairTn":25,"blocks":["weapons"],"persistent":true}),
  crit(11, 11, "hullBreached", "Hull Breached", "Lose 1d10 crew; further crit rolls are +2 until repaired.", {"crewLoss":"1d10","repairTn":25,"critModifier":2,"persistent":true}),
  crit(12, 12, "enginesCrippled", "Engines Crippled", "Adrift: no Manoeuver actions until repaired; instead the ship drifts forward at half Speed.", {"repairTn":30,"blocks":["manoeuver"],"persistent":true}),
  crit(13, 99, "secondaryExplosion", "Secondary Explosion", "Extra 1d10 Hull and 1d10 Crew lost; roll the chart again, applying the weapon's Crit to the new roll.", {"crewLoss":"1d10","hullLoss":"1d10","rollAgain":true})
];

/** Warp voyage time and difficulty (p. 411). */
export const WARP_VOYAGE = {
  neighboring: { tn: 10, distance: "Neighboring Sphere", warpTime: "1d10 minutes", realTime: "1d10 hours" },
  nearby: { tn: 15, distance: "Nearby", warpTime: "1d10 hours", realTime: "1d10 days" },
  moderate: { tn: 20, distance: "Moderate", warpTime: "1d10 days", realTime: "1d10 weeks" },
  farAway: { tn: 25, distance: "Far Away", warpTime: "1d10 weeks", realTime: "1d10 months" },
  opposite: { tn: 30, distance: "Opposite Side of the Wheel", warpTime: "4d10 weeks", realTime: "4d10 months" }
};

/** Warp travel encounters (p. 412): 1d10 + modifiers. */
export const WARP_ENCOUNTERS = [
  row(-99, 2, "allsWell", "All's Well", "An uneventful trip."),
  row(3, 3, "messagesFromTheWarp", "Messages From the Warp", "The Astropath picks up a brief warp message of unknown origin; roll 1d10 for its intent. Replying is possible only briefly.", { subtable: ["Warning","Order","Threat","Plea","Query","Lost Prayer","Meeting Place","Innocuous Information","Relevant Interception","Meaningless Rambling"] }),
  row(4, 4, "tongues", "Tongues", "For the whole journey everyone speaks only an incomprehensible daemonic tongue.", {"duration":"journey"}),
  row(5, 5, "corruptedMachineSpirit", "Corrupted Machine Spirit", "The ship gains a stubborn will and refuses orders until rebooted, placated or persuaded; it gets less stable with each later encounter."),
  row(6, 6, "nightmare", "Nightmare", "Each crew member tests Con at TN 25; on failure, hellish visions strike whenever they rest: +1d10 Insanity and no sleep benefits, including wound recovery. A Chief Medical Officer rolling 6+ on 1d10 brews a sleep aid.", {"test":"Constitution","tn":25,"insanity":"1d10","counter":{"officer":"Chief Medical Officer","roll":"1d10 >= 6"}}),
  row(7, 7, "theVanishing", "The Vanishing", "1d5 Crew disappear along with all memory of them; only empty posts and belongings hint at it.", {"crewLoss":"1d5"}),
  row(8, 8, "torpor", "Torpor", "Crew slip into comas: Crew temporarily drops by 1d10 and each character gains 1d10 fatigue that stays until the ship is back in the Materium.", {"tempCrewLoss":"1d10","fatigue":"1d10","until":"return to Materium"}),
  row(9, 9, "dejaVu", "Deja Vu", "The same dream repeats nightly and its events increasingly start coming true."),
  row(10, 10, "theEnd", "The End", "Each crew member tests Composure at TN 25; on failure they are haunted by visions of their own death: +1d10 Insanity and all Hero Points lost. A Chaplain rolling 6+ on 1d10 holds a sermon that removes 1d10 Insanity and restores all Hero Points.", {"test":"Composure","tn":25,"insanity":"1d10","loseAllHeroPoints":true,"counter":{"officer":"Chaplain","roll":"1d10 >= 6","restoreInsanity":"1d10","restoreHeroPoints":"all"}}),
  row(11, 99, "perilous", "Perilous Encounter", "Something bigger intervenes: roll 1d5 on Perilous Encounters or the SM runs a custom scene.", {"rollOn":"Perilous Encounter"})
];

/** Perilous encounters (p. 413): 1d5. */
export const WARP_PERILOUS = [
  row(1, 1, "timeWarp", "Time Warp", "The ship emerges before it departed; the rolled real time now measures how far into the past it went."),
  row(2, 2, "mysteriousStranger", "Mysterious Stranger", "A deceptive stowaway offers aid on your next task in return for an odd favor. Roll 1d5 for origin and 1d5 for intent.", { subtables: {"source":["Daemon (Always Malicious)","Exalted","Astral Projection","Vengeful Spirit","Mortal"],"intent":["Very Trustworthy","Mostly Trustworthy","Mixed","Untrustworthy","Malicious"]} }),
  row(3, 3, "plague", "Plague", "A Nurgle disease spreads. Close contact with a carrier during a scene calls for a Con test at TN 25 (failure: Diseased); touching a contaminated place or item calls for TN 15. An extra symptom comes from a 1d10 roll or SM invention. A Chief Medical Officer rolling 6+ on 1d10 contains it."),
  row(4, 4, "sabotage", "Sabotage", "A possessed crew member tries to wreck a ship system, possibly forcing a port stop. Roll 1d10 or pick the target system periodically. A Chief Security Officer rolling 6+ on 1d10 catches them."),
  row(5, 5, "webInTheWay", "Web in the Way", "The ship drops out inside the Webway, realm of the Dark Eldarin and Lolth, where a force of 1d5-1 Dark Eldarin Escorts lies in wait.")
];


/** Ramming damage by the rammer's hull class (p. 404). */
export const RAM_DAMAGE = { escort: { rolled: 2, kept: 2 }, destroyer: { rolled: 3, kept: 3 }, cruiser: { rolled: 4, kept: 4 }, battleship: { rolled: 5, kept: 5 } };

/** How some torpedoes change a surface bombardment (p. 410). */
export const BOMBARD_TORPEDOES = {
  micro: "Blast of 1 km and 8k4 damage.",
  highAct: "Roll the scatter twice and keep either.",
  rift: "Twice the area, and daemons pour through.",
  cruise: "Can hit the inner planets from the sphere wall."
};

/** Build Points of the Holdings rating (p. 386); above 5 the table stops at 250. */
export const shipBudget = (holdings) => (holdings <= 0 ? 0 : SHIP_BUDGETS[Math.min(5, holdings)]);

/** Static Defense: 10 + Maneuverability + Acceleration (p. 387). */
export const staticDefense = ({ maneuverability, acceleration }) => 10 + maneuverability + acceleration;

/** Initiative bonus: Sensors + Acceleration, rolled with 1d10 (p. 403). */
export const initiativeBonus = ({ sensors, acceleration }) => sensors + acceleration;

/**
 * A custom hull (pp. 392–393): the base frame plus its Customization Point purchases. Limits give warnings only.
 * @param {object} base  hull fields of the base frame
 * @param {Record<string, number>} upgrades  purchases by CUSTOMIZATION key
 * @returns {{stats: object, cpSpent: number, cpMax: number, warnings: {key: string, kind: string}[]}}
 */
export function customHull(base, upgrades = {}) {
  const stats = structuredClone(base);
  const warnings = [];
  let cpSpent = 0;
  for (const [key, def] of Object.entries(CUSTOMIZATION)) {
    const n = Math.max(0, upgrades[key] ?? 0);
    if (!n) continue;
    cpSpent += n * def.cp;
    if (n > def.limit) warnings.push({ key, kind: "upgradeLimit" });
    let value;
    if (def.stat === "forward" || def.stat === "rear") value = stats.weapons[def.stat] += n * def.step;
    else if (def.stat === "universal" || def.stat === "nonUniversal") value = stats.consoles[def.stat] += n * def.step;
    else value = stats[def.stat] += n * def.step;
    if (value > def.total) warnings.push({ key, kind: "totalLimit" });
  }
  const cpMax = base.customizationPoints ?? 0;
  if (cpSpent > cpMax) warnings.push({ key: "cp", kind: "cp" });
  return { stats, cpSpent, cpMax, warnings };
}

/**
 * Sum of the numeric bonuses of the installed consoles (`automation`), times their quantity.
 * @param {{automation?: object, quantity?: number}[]} consoles
 * @returns {Record<string, number>}
 */
export function consoleBonuses(consoles) {
  const out = {};
  for (const c of consoles) {
    for (const [key, value] of Object.entries(c.automation ?? {})) {
      if (typeof value === "number") out[key] = (out[key] ?? 0) + value * Math.max(1, c.quantity ?? 1);
    }
  }
  return out;
}

/**
 * Final ship stats: hull, console bonuses and lasting critical effects.
 * @param {object} hull  hull fields (standard hull, or the stats of customHull)
 * @param {Record<string, number>} bonuses  consoleBonuses
 * @param {string[]} crits  keys of the lasting critical effects
 */
export function shipStats(hull, bonuses, crits) {
  const b = (k) => bonuses[k] ?? 0;
  const sensorsCrit = crits.reduce((n, key) => n + (SHIP_CRIT.find((r) => r.key === key)?.mechanics.sensors ?? 0), 0);
  return {
    hullClass: hull.class,
    crew: hull.crew + b("crewBonus"),
    hullStrength: hull.hullStrength + b("hullStrengthBonus"),
    maneuverability: hull.maneuverability + b("maneuverabilityBonus"),
    acceleration: hull.acceleration + b("accelerationBonus"),
    speed: hull.speed + b("speedBonus"),
    sensors: hull.sensors + b("sensors") + sensorsCrit,
    consoles: { ...hull.consoles },
    weapons: { ...hull.weapons }
  };
}

/**
 * Profile of a weapon pattern with a weapon type (p. 397): damage dice, Disruption, Accuracy and Crit add up;
 * "half" range rounds down (at least 1), "double" doubles; cost at least 5 BP; Disruption at least 0.
 * @param {object} pattern
 * @param {string} typeKey  SHIP_WEAPON_TYPES key
 */
export function weaponProfile(pattern, typeKey) {
  const known = Boolean(SHIP_WEAPON_TYPES[typeKey]);
  const t = known ? SHIP_WEAPON_TYPES[typeKey] : SHIP_WEAPON_TYPES.las;
  const range = t.range === "half" ? Math.max(1, Math.floor(pattern.range / 2)) : t.range === "double" ? pattern.range * 2 : pattern.range;
  return {
    ...pattern,
    typeKey: known ? typeKey : "las",
    dam: { rolled: Math.max(1, pattern.dam.rolled + t.dam), kept: pattern.dam.kept },
    dis: Math.max(0, pattern.dis + t.dis),
    acc: pattern.acc + t.acc,
    crit: pattern.crit + t.crit,
    range,
    cost: Math.max(5, pattern.cost + t.cost)
  };
}

/**
 * Build Points spent: every part's cost × quantity; weapons by their profile; torpedoes in sets of 5 warheads (p. 398).
 * @param {{category: string, cost?: number, quantity?: number, weapon?: object}[]} parts
 */
export function bpSpent(parts) {
  return parts.reduce((sum, p) => {
    // The pattern cost is the item cost on a ship (or inside the profile).
    if (p.category === "weapon") return sum + weaponProfile({ ...p.weapon, cost: p.weapon.cost ?? p.cost ?? 0 }, p.weapon.typeKey).cost;
    if (p.category === "torpedo") return sum + (p.cost ?? 0) * Math.ceil(Math.max(1, p.quantity ?? 1) / 5);
    if (p.category === "weaponType") return sum;
    return sum + (p.cost ?? 0) * Math.max(1, p.quantity ?? 1);
  }, 0);
}

/**
 * Console and weapon slots (p. 399): a console takes a slot of its type, else a Universal one; Universal consoles take
 * Universal slots. A custom hull's non-universal slots are split by type in `split`.
 * @param {object} hull  final hull fields
 * @param {object[]} parts
 * @param {Record<string, number>} split  non-universal slots by type (custom hulls)
 */
export function slotUsage(hull, parts, split = {}) {
  const types = ["arcana", "command", "engineering", "tactical"];
  const consoles = Object.fromEntries([...types, "universal"].map((t) => [t, { used: 0, max: (hull.consoles[t] ?? 0) + (types.includes(t) ? split[t] ?? 0 : 0) }]));
  let overflow = 0;
  for (const p of parts.filter((x) => x.category === "console")) {
    for (let i = 0; i < Math.max(1, p.quantity ?? 1); i++) {
      const t = p.console.type;
      if (t !== "universal" && consoles[t].used < consoles[t].max) consoles[t].used++;
      else if (consoles.universal.used < consoles.universal.max) consoles.universal.used++;
      else overflow++;
    }
  }
  const mountOf = (p) => (p.category === "weapon" ? p.weapon.mount : p.category === "torpedoTube" ? p.tube.mount : null);
  const weapons = { forward: { used: 0, max: hull.weapons.forward }, rear: { used: 0, max: hull.weapons.rear } };
  for (const p of parts) {
    const mount = mountOf(p);
    if (mount && weapons[mount]) weapons[mount].used += p.category === "weapon" ? 1 : Math.max(1, p.quantity ?? 1);
  }
  const warnings = [];
  if (overflow) warnings.push("consoles");
  if (weapons.forward.used > weapons.forward.max) warnings.push("forwardWeapons");
  if (weapons.rear.used > weapons.rear.max) warnings.push("rearWeapons");
  const splitTotal = types.reduce((n, t) => n + (split[t] ?? 0), 0);
  if (splitTotal > (hull.consoles.nonUniversal ?? 0)) warnings.push("nonUniversalSplit");
  return { consoles, weapons, warnings };
}

/**
 * Dice of a ship action (p. 403): committed Crew rolled (1–10), the officer's dots kept (at least 1), the ship stat
 * the action names added.
 */
export function shipPool({ crew, kept, stat = 0 }) {
  return { rolled: Math.max(1, Math.min(10, crew)), kept: Math.max(1, kept), flat: stat };
}

/** Crew still free this round. */
export const crewAvailable = ({ max, temp = 0, committed = 0, deployed = 0 }) => Math.max(0, max + temp - committed - deployed);

/** Commit n Crew: temporary Crew (Triage) goes first. */
export function commitCrew({ temp = 0, committed = 0 }, n) {
  const fromTemp = Math.min(temp, n);
  return { temp: temp - fromTemp, committed: committed + n - fromTemp };
}

/**
 * A hit on the shield (pp. 407–408): damage comes off Capacity; at 0 the shield collapses and the excess is lost; a
 * shield that holds gains the weapon's Disruption. A collapsed shield lets everything through to the hull.
 */
export function shieldHit({ value, disruption, collapsed, damage, dis }) {
  if (collapsed || value <= 0) return { value: 0, disruption, collapsed: true, toHull: damage };
  const left = value - damage;
  if (left <= 0) return { value: 0, disruption, collapsed: true, toHull: 0 };
  return { value: left, disruption: disruption + dis, collapsed: false, toHull: 0 };
}

/** Regeneration at the start of the ship's turn: Regeneration − Disruption, up to the Capacity (p. 407). */
export function shieldRegen({ value, max, regen, disruption, collapsed }) {
  if (collapsed) return value;
  return Math.min(max, value + Math.max(0, regen - disruption));
}

/**
 * A hit on a Multiphasic shield: it strikes the outermost standing layer, as shieldHit; with every layer down the
 * damage reaches the hull.
 * @param {{value: number, disruption: number}[]} layers  outermost first
 */
export function multiphasicHit(layers, damage, dis) {
  const next = layers.map((l) => ({ ...l }));
  const i = next.findIndex((l) => l.value > 0);
  if (i < 0) return { layers: next, toHull: damage };
  const r = shieldHit({ value: next[i].value, disruption: next[i].disruption, collapsed: false, damage, dis });
  next[i] = { value: r.value, disruption: r.disruption };
  return { layers: next, toHull: 0 };
}

/** Multiphasic regeneration goes to the outermost standing layer that is not full. */
export function multiphasicRegen(layers, max, regen) {
  const next = layers.map((l) => ({ ...l }));
  const i = next.findIndex((l) => l.value > 0 && l.value < max);
  if (i >= 0) next[i].value = Math.min(max, next[i].value + Math.max(0, regen - next[i].disruption));
  return next;
}

/** Row of the Crit Chart for a total (1d10 + modifiers; ≤0 and 13+ are the ends). */
export const critRow = (total) => lookup(SHIP_CRIT, total);

/**
 * Modifier of the next Crit Chart roll: lasting criticals (Hull Breached +2), consoles (Reinforced Bulkheads −3) and
 * Brace for Impact (`braced` = its penalty).
 */
export function critModifier({ crits = [], bonuses = {}, braced = 0 }) {
  const fromCrits = crits.reduce((n, key) => n + (SHIP_CRIT.find((r) => r.key === key)?.mechanics.critModifier ?? 0), 0);
  return fromCrits + (bonuses.critModifier ?? 0) - braced;
}

/**
 * Ramming Speed! (p. 404): class damage plus the rammer's Speed, past the shields; the rammer takes half and both roll
 * the Crit Chart at +3. A Ramming Prow adds 1k1, spares the rammer and gives +2 more on the target's roll.
 */
export function ramDamage(hullClass, { prow = false, speed = 0 } = {}) {
  const base = RAM_DAMAGE[hullClass] ?? RAM_DAMAGE.escort;
  return {
    rolled: base.rolled + (prow ? 1 : 0), kept: base.kept + (prow ? 1 : 0), flat: speed,
    crit: 3, targetCrit: prow ? 5 : 3, selfDamage: !prow
  };
}

/** Crew lost by the side that loses a boarding round (p. 405): half of what it committed plus 1 per check, at most 10. */
export const boardingLoss = ({ committed, checks }) => Math.min(10, Math.floor(committed / 2) + Math.max(0, checks));

/** Boarding range in VU (p. 405). */
export function boardingRange({ assaultShuttles = false, teleportarium = false, targetShielded = true } = {}) {
  if (teleportarium && !targetShielded) return 5;
  if (assaultShuttles) return 3;
  return 1;
}

/** A fighter squadron attacks with one die per craft, keeping the Tactical Officer's Ballistics (p. 407). */
export const fighterPool = ({ count, ballistics }) => ({ rolled: Math.max(1, count), kept: Math.max(1, ballistics) });

/** Fighter damage: XkX with X = half the squadron, rounding down, at least 1. */
export function fighterDamage(count) {
  const x = Math.max(1, Math.floor(count / 2));
  return { rolled: x, kept: x };
}

/** Voyage time and difficulty (p. 411). */
export const warpVoyage = (distance) => WARP_VOYAGE[distance] ?? WARP_VOYAGE.moderate;

/** Step 2 (Charting the Course) sets the modifier of step 3: −10 on a failure, +5 per raise on a success. */
export const warpCourse = ({ success, raises = 0 }) => (success ? 5 * raises : -10);

/**
 * Step 3 (Steering the Vessel): one encounter; success halves the time per two raises; failure rolls the encounter at
 * +2 and two or more checks leave the ship off course. Without a Portal Relay the time doubles.
 */
export function warpSteer({ outcome, relay }) {
  const success = Boolean(outcome.success);
  return {
    encounters: 1,
    timeDivisor: success ? 2 ** Math.floor((outcome.raises ?? 0) / 2) : 1,
    encounterModifier: success ? 0 : 2,
    offCourse: !success && (outcome.checks ?? 0) >= 2,
    timeMultiplier: relay ? 1 : 2
  };
}

/** Modifier of the encounter roll (pp. 394, 399, 411). */
export function warpEncounterModifier({ chaplain = false, warpsbane = false, ancientHelm = false, failed = false } = {}) {
  return (chaplain ? -1 : 0) + (warpsbane ? -2 : 0) + (ancientHelm ? 2 : 0) + (failed ? 2 : 0);
}

/** Row of the Warp encounter table (1d10 + modifiers; 11+ is perilous). */
export const warpEncounter = (total) => lookup(WARP_ENCOUNTERS, total);

/** Row of the perilous encounter table (1d5). */
export const warpPerilous = (d5) => lookup(WARP_PERILOUS, d5);

/** Scatter of a missed bombardment in km (p. 410): 1k1 plus 1k0 per check. */
export const bombardScatter = (checks) => ({ rolled: 1 + Math.max(0, checks), kept: 1 });

/** Field repairs (p. 410): 1k1 Hull plus 1k1 per raise. */
export const fieldRepair = (raises) => ({ rolled: 1 + Math.max(0, raises), kept: 1 + Math.max(0, raises) });

/** Emergency Repair (p. 406): d10s of temporary Hull, 1 plus 1 per two raises. */
export const emergencyRepair = (raises) => 1 + Math.floor(Math.max(0, raises) / 2);
