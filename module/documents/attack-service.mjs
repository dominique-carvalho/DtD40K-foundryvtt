import { onHitCritical } from "./ability-service.mjs";
import { promptAttackOptions } from "../apps/attack-dialog.mjs";
import { postTest, rng } from "../dice/roll-service.mjs";
import { rollAndKeep } from "../rules/dice.mjs";
import { unstableDamage } from "../rules/weapon-creation.mjs";
import { afterJam, checkAmmo, spendAmmo, spendLauncherAmmo } from "./ammo-service.mjs";
import { formatPool, normalizePool } from "../rules/pool.mjs";
import { runTest } from "../rules/test.mjs";
import { toggleCondition } from "./condition-service.mjs";
import { isAmorphous } from "../rules/npc.mjs";
import { combatFlags, situationModifiers } from "../rules/defense.mjs";
import { distance3d, outOfRange } from "../rules/npc-traits.mjs";
import {
  UNARMED, attackPool, attackSkill, damagePool, effectiveQualities, fullAutoHits, hitLocation, isJammed, isProficient
} from "../rules/weapon.mjs";

/**
 * Weapon attacks and damage (spec 007, US3; research R5, R7).
 * Contract: specs/007-equipment/contracts/foundry-api.md ("attack-service").
 */

const EXTRA_TEMPLATE = "systems/dtd40k/templates/chat/attack-card.hbs";
const DAMAGE_TEMPLATE = "systems/dtd40k/templates/chat/damage-card.hbs";
const localize = (key) => game.i18n.localize(key);

/**
 * Sub-categories of the character's Weapon Proficiency feats.
 * @param {Actor} actor
 */
const proficiencyChoices = (actor) => actor.items
  .filter((item) => item.type === "feat" && item.name.startsWith("Weapon Proficiency"))
  .map((item) => item.system.selection?.subcategory).filter(Boolean);

/**
 * Weapon Focus / Weapon Specialization for this weapon: the feat's sub-category names the weapon or its group.
 * @param {Actor} actor
 * @param {string} featName
 * @param {Item|object} weapon
 */
function hasWeaponFeat(actor, featName, weapon) {
  const names = [weapon.name, weapon.system?.group].filter(Boolean).map((name) => name.toLowerCase());
  return actor.items.some((item) => item.type === "feat" && item.name.startsWith(featName)
    && names.includes(item.system.selection?.subcategory?.toLowerCase()));
}

/**
 * Profile of the weapon for the pure rules.
 * @param {Item|null} item  null: unarmed
 */
/**
 * Out-of-range warning between the attacker's token and the target's, with elevation (spec 022, research R4).
 * Only warns: the book has no 3D rules.
 * @param {Actor} actor
 * @param {Token|undefined} targetToken
 * @param {object} weapon
 * @param {boolean} melee
 * @returns {string}
 */
function rangeWarning(actor, targetToken, weapon, melee) {
  const own = actor.getActiveTokens()[0];
  if (!canvas?.ready || !own || !targetToken) return "";
  const planar = canvas.grid.measurePath([own.center, targetToken.center]).distance;
  const elevation = Math.abs((own.document.elevation ?? 0) - (targetToken.document.elevation ?? 0));
  const distance = distance3d({ planar, elevation });
  const range = weapon.range?.strMultiplier ? weapon.range.strMultiplier * actor.system.characteristics.str.value : weapon.range?.value ?? 0;
  const band = outOfRange({ distance, melee, reach: Math.max(2, canvas.grid.distance), range });
  return band ? game.i18n.format(`DTD.Npc.Range.${band}`, { distance }) : "";
}

function profileOf(item) {
  if (!item) return { ...UNARMED, name: localize("DTD.Attack.Unarmed") };
  return { name: item.name, ...item.system };
}

/**
 * Launcher ammunition carried: grenades or missiles of the character.
 * @param {Actor} actor
 * @param {string} ammoGroup
 */
function ammoFor(actor, ammoGroup) {
  if (!ammoGroup) return [];
  return actor.items.filter((item) => item.type === "weapon" && item.system.group === "Grenades and Missiles"
    && item.system.quantity > 0 && (ammoGroup === "missile" ? /missile/i.test(item.name) : item.system.weaponType === "thrown"))
    .map((item) => ({ id: item.id, name: item.name, quantity: item.system.quantity }));
}

/** Mods of a custom weapon (spec 015): their attack conditions (Red-Dot Sight, Breacher…) apply on the roll. */
const modsOf = (item) => item?.system.custom?.build?.mods ?? [];

/**
 * Pools shown on the sheet for a weapon (no options).
 * @param {Actor} actor
 * @param {Item|null} item
 * @returns {{attack: string, damage: string, skill: string}}
 */
export function weaponPools(actor, item) {
  const weapon = profileOf(item);
  const mods = modsOf(item);
  const skill = attackSkill(weapon);
  const attack = attackPool({
    weapon, skill: actor.system.skills[skill].value, level: actor.system.level,
    proficient: actor.type === "npc" || isProficient(weapon, proficiencyChoices(actor)), focus: item ? hasWeaponFeat(actor, "Weapon Focus", item) : false, mods
  });
  const damage = damagePool({
    weapon, str: actor.system.characteristics.str.value,
    specialization: item ? hasWeaponFeat(actor, "Weapon Specialization", item) : false, mods
  });
  return {
    attack: formatPool(normalizePool(attack)),
    damage: weapon.damage.kept ? formatPool(normalizePool(damage)) : "",
    skill
  };
}

/**
 * Roll an attack with a weapon of the character, or unarmed (FR-014 to FR-018).
 * @param {Actor} actor
 * @param {string} itemId  "unarmed" for the default unarmed attack
 * @param {{fastForward?: boolean, action?: object, preset?: object, penalty?: number}} [options]
 *   action: attack options of a combat action (spec 008: allOut, charge, calledShot, defensive, mode, aim);
 *   preset: options of an earlier attack to reuse without the dialog (Multiple Attacks); penalty: rolled dice to
 *   subtract (two weapons); special: a Special Attack or Trick Shot (spec 010: `martial-service`, `attackModifiers`);
 *   weaponOwner + vehicle: a weapon mounted on a vehicle, fired by this crew member with their own skill but without
 *   proficiency, weapon feats or effect bonuses, always braced; full auto costs a Reaction (spec 013, p. 360)
 * @returns {Promise<ChatMessage|null>}
 */
export async function rollAttack(actor, itemId, { fastForward = false, action = {}, preset = null, penalty = 0, special = null, weaponOwner = null, vehicle = false } = {}) {
  const owner = weaponOwner ?? actor;
  const item = itemId === "unarmed" ? null : owner.items.get(itemId);
  if (itemId !== "unarmed" && !item) return null;
  if (item?.system.custom?.status) {
    ui.notifications.warn(game.i18n.format(`DTD.WeaponBuilder.Unfinished.${item.system.custom.status}`, { name: item.name }));
    return null;
  }
  const weapon = profileOf(item);
  const targetToken = [...game.user.targets][0];
  const target = targetToken?.actor;
  const targetFlags = combatFlags(target?.statuses ?? new Set());
  const defaultTn = target?.system?.derived?.staticDefense ?? null;
  const skillKey = attackSkill(weapon);
  const shape = {
    melee: weapon.weaponType === "melee" && !weapon.thrown,
    canThrow: weapon.weaponType === "melee" && weapon.thrown,
    auto: (weapon.rof?.auto ?? 0) > 0,
    // Full-auto-only weapons (SAW, Heavy Bolter: ROF -/10).
    single: weapon.rof?.single !== false || weapon.weaponType === "melee",
    heavy: weapon.weaponType === "heavy",
    basic: weapon.weaponType === "basic"
  };
  const ammo = ammoFor(actor, weapon.ammoGroup);
  if (weapon.ammoGroup && !ammo.length) {
    ui.notifications.warn(localize("DTD.Attack.NoAmmo"));
    return null;
  }

  // Situation defaults from the target (spec 008, FR-010): Combat Advantage, Prone, running.
  const situation = {
    advantage: targetFlags.grantsAdvantage, targetProne: Boolean(target?.statuses.has("prone")),
    targetRan: Boolean(target?.statuses.has("running")), gangUp: 0, intoMelee: false, terrain: "", calledLocation: ""
  };
  let options = preset ?? {
    tn: defaultTn ?? 15, modifiers: {}, specialty: false, rollMode: undefined,
    weapon: { range: "normal", aim: action.aim ? 1 : 0, mode: action.mode ?? (shape.single ? "single" : "auto"), braced: false, oneHanded: false, thrown: false },
    ammoId: ammo[0]?.id ?? "",
    situation
  };
  if (!fastForward && !preset) {
    const chosen = await promptAttackOptions({
      actor, title: game.i18n.format("DTD.Attack.Title", { weapon: weapon.name }), skillKey, shape, ammo, tn: defaultTn,
      situation, action
    });
    if (!chosen) return null;
    options = chosen;
  }
  if (vehicle) {
    options = { ...options, weapon: { ...options.weapon, braced: true, oneHanded: false } };
    if (options.weapon.mode === "auto" && (weapon.rof?.auto ?? 0) > 0) {
      const { takeAction } = await import("./turn-service.mjs");
      const { VEHICLE_ACTIONS } = await import("../rules/vehicle.mjs");
      if (!(await takeAction(actor, VEHICLE_ACTIONS.find((a) => a.key === "vehicleFullAuto")))) return null;
    }
  }

  // Ammunition (spec 019): a jammed or empty weapon is refused (the GM may allow it); the burst of Suppressing Fire
  // was paid for when the zone started.
  const tracked = !vehicle && Boolean(item?.system.ammo?.tracked) && !options.weapon.thrown && !options.noAmmo;
  if (tracked && !(await checkAmmo(item))) return null;

  const thrown = options.weapon.thrown;
  const skill = attackSkill(weapon, { thrown });
  // NPCs are proficient with the weapons of their stat block (spec 012).
  const proficient = !vehicle && (actor.type === "npc" || isProficient(weapon, proficiencyChoices(actor), { thrown }));
  const pool = attackPool({
    weapon, skill: actor.system.skills[skill].value, level: actor.system.level, proficient,
    focus: item && !vehicle ? hasWeaponFeat(actor, "Weapon Focus", item) : false, options: options.weapon, mods: modsOf(item)
  });
  const melee = shape.melee && !thrown;
  // Auto-Stabilized NPCs are always braced (spec 022, p. 520).
  if (actor.system.traitFlags?.autoStabilized) options.weapon.braced = true;
  const sit = situationModifiers({
    ...(options.situation ?? situation), melee, pointBlank: options.weapon.range === "pointBlank",
    attackerDarkSight: Boolean(actor.system.traitFlags?.darkSight),
    calledShot: Boolean(action.calledShot), allOut: Boolean(action.allOut), charge: Boolean(action.charge), defensive: Boolean(action.defensive)
  });
  pool.requiredRaises += sit.requiredRaises;
  pool.notes.push(...sit.notes);
  // Special Attack / Trick Shot (spec 010): accuracy Advantages and Restrictions, Dead Man's Hand.
  if (special) {
    pool.rolled += special.modifiers.attack.rolled + (special.rolledBonus ?? 0);
    pool.kept += special.modifiers.attack.kept;
  }
  if (penalty) pool.notes.push("twoWeapons");
  const testResult = runTest({
    base: { rolled: pool.rolled + sit.rolled - penalty, kept: pool.kept },
    // Darkness raises the target number (concealment, p. 433; spec 022).
    tn: options.tn === null || options.tn === undefined ? options.tn : options.tn + sit.tn,
    specialty: options.specialty,
    rng,
    // Vehicle weapons ignore the shooter's effect bonuses (p. 360).
    ...(vehicle
      ? { modifiers: { ...options.modifiers, freeRaises: (Number(options.modifiers.freeRaises) || 0) + sit.freeRaises } }
      : actor.withRollModifiers({ ...options.modifiers, freeRaises: (Number(options.modifiers.freeRaises) || 0) + sit.freeRaises }, skill))
  });

  const qualities = effectiveQualities(weapon);
  // Blinded: Ballistics Tests fail; Helpless target: the attack hits (pp. 442–443).
  const blindShot = !melee && combatFlags(actor.statuses).autoFailBallistics;
  const helpless = targetFlags.helpless;
  if (blindShot) pool.notes.push("blinded");
  if (helpless) pool.notes.push("helpless");
  const raises = Math.max(0, (testResult.outcome?.raises ?? 0) - pool.requiredRaises);
  let hit = testResult.outcome ? testResult.outcome.success && testResult.outcome.raises >= pool.requiredRaises : null;
  if (helpless) hit = true;
  if (blindShot) hit = false;
  const auto = options.weapon.mode === "auto" && pool.autoAllowed;
  // A burst with fewer rounds than the ROF fires those left, which become its ROF (spec 019).
  const shot = tracked ? await spendAmmo(item, auto ? "auto" : "single") : null;
  const rof = options.rof ?? shot?.effectiveRof ?? weapon.rof.auto;
  const hits = auto && hit ? fullAutoHits(raises, rof) : hit ? 1 : 0;
  const jammed = !shape.melee && isJammed({
    keptFaces: testResult.dice.filter((die) => die.kept).map((die) => die.chain[0]),
    level: actor.system.level, reliable: Boolean(qualities.reliable), unreliable: Boolean(qualities.unreliable)
  });
  if (tracked && jammed) await afterJam(item, { overheats: Boolean(qualities.overheats) });
  if (weapon.ammoGroup && options.ammoId) await spendLauncherAmmo(actor, options.ammoId);
  const d10 = Math.floor(rng() * 10) + 1;
  const called = action.calledShot && options.situation?.calledLocation;
  // Every hit on an Amorphous creature goes to the body (spec 012, p. 520).
  const amorphous = target?.type === "npc" && isAmorphous(target.system.npc.traits);
  const location = called || (amorphous ? "body" : hitLocation(d10));
  const attack = {
    actorUuid: actor.uuid, ownerUuid: owner === actor ? "" : owner.uuid, vehicle, itemId: item?.id ?? "unarmed", options: options.weapon, raises, hits, location,
    ammoId: options.ammoId, rollMode: options.rollMode, targetUuid: target?.uuid ?? "", total: testResult.total,
    tn: testResult.tn, requiredRaises: pool.requiredRaises, helpless, melee, preset: options, special
  };
  // Death From Above: a miss leaves the attacker Prone (p. 270).
  if (special && hit === false) {
    for (const miss of special.modifiers.onMiss) if (miss.condition) await toggleCondition(actor, miss.condition, { active: true });
  }
  const areaWeapon = Boolean(qualities.blast || qualities.flame);

  const extraContent = await foundry.applications.handlebars.renderTemplate(EXTRA_TEMPLATE, {
    proficient,
    vehicleWeapon: vehicle,
    // A vehicle target answers with Evasive Maneuvers instead of Dodge or Parry (spec 013).
    vehicleTarget: target?.type === "vehicle",
    notes: [...pool.notes.map((note) => localize(`DTD.Attack.Note.${note}`)), ...(item?.system.custom?.notes ?? [])],
    requiredRaises: pool.requiredRaises,
    hits: auto ? hits : 0,
    location: localize(`DTD.Location.${location}`),
    d10: called ? null : d10,
    called: Boolean(called),
    jammed,
    overheats: jammed && Boolean(qualities.overheats),
    ammoLeft: shot ? game.i18n.format("DTD.Ammo.Left", { left: shot.left, clip: item.system.clip }) : "",
    rangeNote: rangeWarning(actor, targetToken, weapon, melee),
    textQualities: weapon.qualities.filter((q) => !CONFIG.DTD.WEAPON_QUALITIES[q.key]?.automated)
      .map((q) => ({ label: localize(CONFIG.DTD.WEAPON_QUALITIES[q.key].label), hint: localize(CONFIG.DTD.WEAPON_QUALITIES[q.key].hint) })),
    canDamage: Boolean(weapon.damage.kept || weapon.ammoGroup) && hit !== false,
    canDefend: Boolean(target) && hit !== false && !helpless,
    melee,
    special: special ? {
      name: special.name,
      texts: special.modifiers.texts,
      qualities: special.modifiers.qualities.map((q) => localize(CONFIG.DTD.WEAPON_QUALITIES[q.key].label) + (q.value ? ` (${q.value})` : "")),
      // Trick Shots with Blast or Flame: Advantages only on the target closest to the source (p. 272).
      areaNote: special.kind === "trick" && areaWeapon,
      missNote: hit === false && special.modifiers.onMiss.length > 0
    } : null,
    canApplyEffects: Boolean(special?.modifiers.onHit.length) && Boolean(target) && hit !== false
  });
  const label = `${special ? `${special.name} · ` : ""}${weapon.name}${owner === actor ? "" : ` (${owner.name})`} — ${localize(CONFIG.DTD.SKILLS[skill].label)}`;
  return postTest({ actor, label, testResult, rollMode: options.rollMode, extraContent, flags: { attack } });
}

/**
 * Roll the damage of an attack card (FR-016, FR-017).
 * @param {ChatMessage} message
 * @returns {Promise<ChatMessage|null>}
 */
export async function rollDamage(message) {
  const attack = message.getFlag("dtd40k", "attack");
  if (!attack) return null;
  const actor = await foundry.utils.fromUuid(attack.actorUuid);
  if (!actor?.isOwner) return null;
  const owner = attack.ownerUuid ? await foundry.utils.fromUuid(attack.ownerUuid) : actor;
  const item = attack.itemId === "unarmed" ? null : owner?.items.get(attack.itemId);
  let weapon = profileOf(item);
  // Launchers deal the damage of the grenade or missile fired.
  if (weapon.ammoGroup) {
    const ammo = actor.items.get(attack.ammoId);
    if (!ammo) {
      ui.notifications.warn(localize("DTD.Attack.NoAmmo"));
      return null;
    }
    weapon = { ...profileOf(ammo), weaponType: "heavy", thrown: false };
  }
  // Special Attack / Trick Shot (spec 010): qualities the Advantages add count as the weapon's.
  const m = attack.special?.modifiers ?? null;
  if (m?.qualities.length) weapon = { ...weapon, qualities: [...weapon.qualities, ...m.qualities.map((q) => ({ key: q.key, value: q.value ?? null }))] };
  // NPC weapons carry the printed damage, Strength included (spec 012); vehicle melee weapons add the Manipulator Arms'
  // Strength, never the crew member's (spec 013, p. 379).
  const str = attack.vehicle ? owner.system.strength ?? 0
    : m?.noStrength || item?.getFlag("dtd40k", "npcDamage") ? 0 : actor.system.characteristics.str.value;
  const pool = damagePool({
    weapon,
    str,
    options: attack.options,
    extraHits: Math.max(0, attack.hits - 1),
    specialization: item && !attack.vehicle ? hasWeaponFeat(actor, "Weapon Specialization", item) : false,
    raises: attack.raises,
    // Launchers use the ammunition's profile, not the launcher's mods.
    mods: item?.system.ammoGroup ? [] : modsOf(item)
  });
  let resolve = {};
  if (m) {
    pool.rolled += m.damage.rolled + m.damagePerRaise.rolled * attack.raises;
    pool.kept += m.damage.kept;
    pool.pen = m.penZero ? 0 : pool.pen + m.pen;
    pool.explodeOn = Math.min(pool.explodeOn, m.explodeOn);
    resolve = { ...m.resolve };
    // Castigating Blow: only on a head or gizzards hit.
    if (resolve.locations && !resolve.locations.includes(attack.location)) delete resolve.resilienceMultiplier;
    delete resolve.locations;
  }
  // Weapons with an on-hit ability (Gauss Weapon, spec 022): extra Critical Damage on the location.
  const onHit = onHitCritical(actor, item);
  if (onHit) resolve = { ...resolve, extraCritical: (resolve.extraCritical ?? 0) + onHit };
  const normalized = normalizePool(pool);
  const result = rollAndKeep(normalized, { rng, explodeOn: pool.explodeOn, rerollBelow: pool.rerollBelow });
  // Helpless target: damage is rolled twice and added (p. 443).
  if (attack.helpless) {
    const second = rollAndKeep(normalized, { rng, explodeOn: pool.explodeOn, rerollBelow: pool.rerollBelow });
    result.dice.push(...second.dice);
    result.total += second.total;
    pool.notes.push("helpless");
  }
  // Custom weapons (spec 015): Unstable halves or doubles the damage on a d10; Orgone Array warns on an exploding die.
  const mods = modsOf(item);
  const extraNotes = [];
  if (mods.includes("unstable")) {
    const d10 = Math.floor(rng() * 10) + 1;
    const adjusted = unstableDamage(result.total, d10);
    extraNotes.push(game.i18n.format("DTD.Attack.Unstable", { d10, before: result.total, after: adjusted }));
    result.total = adjusted;
  }
  if (mods.includes("orgoneArray") && result.dice.some((die) => die.chain.length > 1)) extraNotes.push(localize("DTD.Attack.OrgoneExploded"));
  const dice = result.dice.map((die) => ({
    total: die.total, kept: die.kept, exploded: die.chain.length > 1, chainText: die.chain.join(" + "), rerolled: die.rerolled?.join(", ")
  }));
  const content = await foundry.applications.handlebars.renderTemplate(DAMAGE_TEMPLATE, {
    label: game.i18n.format("DTD.Attack.DamageOf", { weapon: weapon.name }),
    formula: formatPool(normalized),
    dice,
    total: result.total,
    type: weapon.damage.type ? localize(`DTD.DamageType.${weapon.damage.type}`) : "",
    pen: pool.pen,
    location: localize(`DTD.Location.${attack.location}`),
    hits: attack.hits > 1 ? attack.hits : 0,
    notes: [...pool.notes.map((note) => localize(`DTD.Attack.Note.${note}`)), ...extraNotes, ...(m ? [attack.special.name, ...m.qualities.map((q) => localize(CONFIG.DTD.WEAPON_QUALITIES[q.key].label) + (q.value ? ` (${q.value})` : ""))] : [])],
    proven: pool.rerollBelow,
    volatile: pool.explodeOn === 9
  });
  const chatData = {
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    flags: { dtd40k: { damage: {
      total: result.total, pen: pool.pen, type: weapon.damage.type, location: attack.location,
      tearing: Boolean(effectiveQualities(weapon).tearing), unarmed: attackSkill(weapon) === "brawl", magic: false, resolve,
      // Minion Squads lose one minion plus one per raise, or the Blast rating (spec 012).
      raises: attack.raises, blast: weapon.qualities.find((q) => q.key === "blast")?.value ?? 0,
      // Incorporeal targets ignore weapons without a Power Field (spec 022).
      qualities: weapon.qualities.map((q) => q.key)
    } } }
  };
  ChatMessage.applyRollMode(chatData, attack.rollMode ?? game.settings.get("core", "rollMode"));
  return ChatMessage.create(chatData);
}
