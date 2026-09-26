import { promptAttackOptions } from "../apps/attack-dialog.mjs";
import { postTest, rng } from "../dice/roll-service.mjs";
import { rollAndKeep } from "../rules/dice.mjs";
import { formatPool, normalizePool } from "../rules/pool.mjs";
import { runTest } from "../rules/test.mjs";
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

/**
 * Pools shown on the sheet for a weapon (no options).
 * @param {Actor} actor
 * @param {Item|null} item
 * @returns {{attack: string, damage: string, skill: string}}
 */
export function weaponPools(actor, item) {
  const weapon = profileOf(item);
  const skill = attackSkill(weapon);
  const attack = attackPool({
    weapon, skill: actor.system.skills[skill].value, level: actor.system.level,
    proficient: isProficient(weapon, proficiencyChoices(actor)), focus: item ? hasWeaponFeat(actor, "Weapon Focus", item) : false
  });
  const damage = damagePool({
    weapon, str: actor.system.characteristics.str.value,
    specialization: item ? hasWeaponFeat(actor, "Weapon Specialization", item) : false
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
 * @param {{fastForward?: boolean}} [options]
 * @returns {Promise<ChatMessage|null>}
 */
export async function rollAttack(actor, itemId, { fastForward = false } = {}) {
  const item = itemId === "unarmed" ? null : actor.items.get(itemId);
  if (itemId !== "unarmed" && !item) return null;
  const weapon = profileOf(item);
  const target = [...game.user.targets][0]?.actor;
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

  let options = {
    tn: defaultTn ?? 15, modifiers: {}, specialty: false, rollMode: undefined,
    weapon: { range: "normal", aim: 0, mode: shape.single ? "single" : "auto", braced: false, oneHanded: false, thrown: false },
    ammoId: ammo[0]?.id ?? ""
  };
  if (!fastForward) {
    const chosen = await promptAttackOptions({
      actor, title: game.i18n.format("DTD.Attack.Title", { weapon: weapon.name }), skillKey, shape, ammo, tn: defaultTn
    });
    if (!chosen) return null;
    options = chosen;
  }

  const thrown = options.weapon.thrown;
  const skill = attackSkill(weapon, { thrown });
  const proficient = isProficient(weapon, proficiencyChoices(actor), { thrown });
  const pool = attackPool({
    weapon, skill: actor.system.skills[skill].value, level: actor.system.level, proficient,
    focus: item ? hasWeaponFeat(actor, "Weapon Focus", item) : false, options: options.weapon
  });
  const testResult = runTest({
    base: { rolled: pool.rolled, kept: pool.kept },
    tn: options.tn,
    specialty: options.specialty,
    rng,
    ...actor.withRollModifiers(options.modifiers, skill)
  });

  const qualities = effectiveQualities(weapon);
  const raises = Math.max(0, (testResult.outcome?.raises ?? 0) - pool.requiredRaises);
  const hit = testResult.outcome ? testResult.outcome.success && testResult.outcome.raises >= pool.requiredRaises : null;
  const auto = options.weapon.mode === "auto" && pool.autoAllowed;
  const hits = auto && hit ? fullAutoHits(raises, weapon.rof.auto) : hit ? 1 : 0;
  const jammed = !shape.melee && isJammed({
    keptFaces: testResult.dice.filter((die) => die.kept).map((die) => die.chain[0]),
    level: actor.system.level, reliable: Boolean(qualities.reliable), unreliable: Boolean(qualities.unreliable)
  });
  const d10 = Math.floor(rng() * 10) + 1;
  const location = hitLocation(d10);
  const attack = {
    actorUuid: actor.uuid, itemId: item?.id ?? "unarmed", options: options.weapon, raises, hits, location,
    ammoId: options.ammoId, rollMode: options.rollMode
  };

  const extraContent = await foundry.applications.handlebars.renderTemplate(EXTRA_TEMPLATE, {
    proficient,
    notes: pool.notes.map((note) => localize(`DTD.Attack.Note.${note}`)),
    requiredRaises: pool.requiredRaises,
    hits: auto ? hits : 0,
    location: localize(`DTD.Location.${location}`),
    d10,
    jammed,
    overheats: jammed && Boolean(qualities.overheats),
    textQualities: weapon.qualities.filter((q) => !CONFIG.DTD.WEAPON_QUALITIES[q.key]?.automated)
      .map((q) => ({ label: localize(CONFIG.DTD.WEAPON_QUALITIES[q.key].label), hint: localize(CONFIG.DTD.WEAPON_QUALITIES[q.key].hint) })),
    canDamage: Boolean(weapon.damage.kept || weapon.ammoGroup) && hit !== false
  });
  const label = `${weapon.name} — ${localize(CONFIG.DTD.SKILLS[skill].label)}`;
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
  const item = attack.itemId === "unarmed" ? null : actor.items.get(attack.itemId);
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
  const pool = damagePool({
    weapon,
    str: actor.system.characteristics.str.value,
    options: attack.options,
    extraHits: Math.max(0, attack.hits - 1),
    specialization: item ? hasWeaponFeat(actor, "Weapon Specialization", item) : false,
    raises: attack.raises
  });
  const normalized = normalizePool(pool);
  const result = rollAndKeep(normalized, { rng, explodeOn: pool.explodeOn, rerollBelow: pool.rerollBelow });
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
    notes: pool.notes.map((note) => localize(`DTD.Attack.Note.${note}`)),
    proven: pool.rerollBelow,
    volatile: pool.explodeOn === 9
  });
  const chatData = {
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    flags: { dtd40k: { damage: { total: result.total, pen: pool.pen, type: weapon.damage.type, location: attack.location } } }
  };
  ChatMessage.applyRollMode(chatData, attack.rollMode ?? game.settings.get("core", "rollMode"));
  return ChatMessage.create(chatData);
}
