/**
 * Weapon creation (spec 015, research R1–R3): the templates, types, mods and availability chart of the Story Master's
 * weapon builder, and the pure build of a 007 weapon profile from them.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Source: DtD 7.7a pp. 516–519; specs/015-weapon-crafting/contracts/rules-api.md. Notes in our own words.
 */

/** The five weapon templates (p. 516): the starting profile. */
export const WEAPON_TEMPLATES = {
  pistol: { name: "Pistol", family: "ranged", weaponType: "pistol", damage: {"rolled":2,"kept":2,"type":"I"}, pen: 0, rof: {"single":true,"auto":0}, range: 30, clip: 6, reload: "Full", page: 516 },
  basic: { name: "Basic", family: "ranged", weaponType: "basic", damage: {"rolled":3,"kept":2,"type":"I"}, pen: 0, rof: {"single":true,"auto":0}, range: 40, clip: 12, reload: "Full", page: 516 },
  cannon: { name: "Cannon", family: "ranged", weaponType: "heavy", damage: {"rolled":3,"kept":3,"type":"I"}, pen: 4, rof: {"single":true,"auto":0}, range: 60, clip: 4, reload: "2 Full", page: 516 },
  heavyRifle: { name: "Heavy Rifle", family: "ranged", weaponType: "heavy", damage: {"rolled":2,"kept":2,"type":"I"}, pen: 2, rof: {"single":true,"auto":0}, range: 60, clip: 40, reload: "Full", page: 516 },
  melee: { name: "Melee", family: "melee", weaponType: "melee", damage: {"rolled":1,"kept":2,"type":"I"}, pen: 0, rof: {"single":true,"auto":0}, range: 0, clip: 0, reload: "", page: 516 },
};

/**
 * Weapon types (p. 516) by their letter, the code the mods use for compatibility: damage type (fixed, a choice or
 * none), profile changes, qualities, rarity shift, extra mod, and the group and proficiencies of the matching 007
 * weapons.
 */
export const WEAPON_CREATION_TYPES = {
  ranged: {
    O: {"key":"ordinary","name":"Ordinary","group":"Ordinary","proficiencies":["Basic","Ranged 1"],"damageType":null,"damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[],"rarity":-1,"extraMods":0},
    L: {"key":"las","name":"Las","group":"Las","proficiencies":["Basic","Ranged 2"],"damageType":"E","damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":"double","reload":null,"qualities":[{"key":"reliable","value":null}],"rarity":0,"extraMods":0},
    P: {"key":"plasma","name":"Plasma","group":"Plasma","proficiencies":["Ranged 2"],"damageType":"E","damage":{"rolled":0,"kept":0},"pen":2,"range":null,"clip":null,"reload":"double","qualities":[],"rarity":0,"extraMods":0},
    M: {"key":"melta","name":"Melta","group":"Melta","proficiencies":["Ranged 2"],"damageType":"E","damage":{"rolled":0,"kept":0},"pen":4,"range":"half","clip":null,"reload":null,"qualities":[],"rarity":0,"extraMods":0},
    B: {"key":"bolter","name":"Bolter","group":"Bolter","proficiencies":["Ranged 1"],"damageType":"X","damage":{"rolled":1,"kept":0},"pen":2,"range":null,"clip":null,"reload":null,"qualities":[],"rarity":0,"extraMods":0},
    S: {"key":"syrneth","name":"Syrneth","group":"Syrneth","proficiencies":["Ranged 2"],"damageType":["E","R"],"damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[],"rarity":0,"extraMods":1},
    E: {"key":"exotic","name":"Exotic","group":"Exotic","proficiencies":["Ranged 1"],"damageType":["E","X","R","I"],"damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[],"rarity":0,"extraMods":1},
    F: {"key":"flamer","name":"Flamer","group":"Flamer","proficiencies":["Ranged 2"],"damageType":"E","damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[],"rarity":0,"extraMods":0},
  },
  melee: {
    O: {"key":"ordinary","name":"Ordinary","group":"Ordinary","proficiencies":["Basic","Melee 1"],"damageType":["R","I"],"damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[],"rarity":-1,"extraMods":0},
    P: {"key":"parrying","name":"Parrying","group":"Parrying","proficiencies":["Melee 2"],"damageType":["R","I"],"damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[],"rarity":0,"extraMods":0},
    C: {"key":"cavalry","name":"Cavalry","group":"Cavalry","proficiencies":["Melee 1"],"damageType":"R","damage":{"rolled":1,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[],"rarity":0,"extraMods":0},
    F: {"key":"flail","name":"Flail","group":"Flail","proficiencies":["Melee 1"],"damageType":null,"damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[{"key":"flexible","value":null}],"rarity":1,"extraMods":0},
    N: {"key":"fencing","name":"Fencing","group":"Fencing","proficiencies":["Melee 2"],"damageType":"R","damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[{"key":"balanced","value":null}],"rarity":0,"extraMods":0},
    T: {"key":"twoHanded","name":"Two Handed","group":"Two Handed","proficiencies":["Melee 3"],"damageType":null,"damage":{"rolled":1,"kept":1},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[{"key":"twoHands","value":null}],"rarity":0,"extraMods":0},
    S: {"key":"syrneth","name":"Syrneth","group":"Syrneth","proficiencies":["Melee 3"],"damageType":["E","X","R","I"],"damage":{"rolled":0,"kept":0},"pen":3,"range":null,"clip":null,"reload":null,"qualities":[],"rarity":0,"extraMods":1},
    A: {"key":"chain","name":"Chain","group":"Chain","proficiencies":["Melee 3"],"damageType":"R","damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[{"key":"tearing","value":null}],"rarity":0,"extraMods":0},
    H: {"key":"shield","name":"Shield","group":"Shields","proficiencies":["Melee 1"],"damageType":"I","damage":{"rolled":0,"kept":0},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[{"key":"defensive","value":null}],"rarity":0,"extraMods":0},
    U: {"key":"unarmed","name":"Unarmed","group":"Unarmed","proficiencies":["Basic","Melee 2"],"damageType":["R","I"],"damage":{"rolled":0,"kept":1},"pen":0,"range":null,"clip":null,"reload":null,"qualities":[{"key":"brawling","value":null}],"rarity":0,"extraMods":0},
  },
};

/**
 * Mods (pp. 517–518): rarity cost, compatible type letters ("any" = every type of the table), numeric effect,
 * qualities, the attack condition they add and a note for effects kept as text.
 */
export const WEAPON_MODS = {
  ranged: [
    {"key":"advRifling","name":"Adv. Rifling","cost":2,"compatibility":["O","L","B","S","E"],"effect":{"qualities":[{"key":"accurate","value":null}]},"condition":null,"note":""},
    {"key":"apRounds","name":"AP Rounds","cost":1,"compatibility":["O","L","P","M","B","S","E"],"effect":{"pen":2},"condition":null,"note":""},
    {"key":"armMounted","name":"Arm Mounted","cost":1,"compatibility":["any"],"effect":{"qualities":[{"key":"armMounted","value":null}]},"condition":null,"note":"Worn on the arm, so one hand stays free."},
    {"key":"beam","name":"Beam","cost":1,"compatibility":["L"],"effect":{"qualities":[{"key":"beam","value":null}]},"condition":null,"note":""},
    {"key":"blastShield","name":"Blast Shield","cost":1,"compatibility":["any"],"effect":{"qualities":[{"key":"armored","value":null}]},"condition":null,"note":""},
    {"key":"breacher","name":"Breacher","cost":1,"compatibility":["M"],"effect":{},"condition":"breacher","note":""},
    {"key":"bulletHose","name":"Bullet Hose","cost":1,"compatibility":["O","L","B","E"],"effect":{"rof":{"autoDelta":2},"qualities":[{"key":"inaccurate","value":null}]},"condition":null,"note":""},
    {"key":"burstFire","name":"Burst Fire","cost":1,"compatibility":["O","L","B","S","E"],"effect":{"rof":{"single":true,"auto":3}},"condition":null,"note":""},
    {"key":"combiweapon","name":"Combiweapon","cost":2,"compatibility":["any"],"effect":{"qualities":[{"key":"combiweapon","value":null}]},"condition":null,"note":""},
    {"key":"compact","name":"Compact","cost":1,"compatibility":["O","L","P","M","S","E"],"effect":{"qualities":[{"key":"compact","value":null}]},"condition":null,"note":""},
    {"key":"coneEffect","name":"Cone Effect","cost":1,"compatibility":["F"],"effect":{"qualities":[{"key":"flame","value":null}]},"condition":null,"note":""},
    {"key":"customized","name":"Customized","cost":1,"compatibility":["any"],"effect":{"reload":"half"},"condition":null,"note":""},
    {"key":"explosiveRounds","name":"Explosive Rounds","cost":1,"compatibility":["P","M","S","E","F"],"effect":{"qualities":[{"key":"blast","value":3}]},"condition":null,"note":""},
    {"key":"extendedClip","name":"Extended Clip","cost":1,"compatibility":["any"],"effect":{"clip":"double"},"condition":null,"note":""},
    {"key":"felling","name":"Felling","cost":2,"compatibility":["B"],"effect":{},"condition":null,"note":"Targets hit count as one size smaller (minimum 1)."},
    {"key":"getsHot","name":"Gets Hot","cost":-1,"compatibility":["L","P","E"],"effect":{"qualities":[{"key":"overheats","value":null}]},"condition":null,"note":""},
    {"key":"heavyWarhead","name":"Heavy Warhead","cost":2,"compatibility":["P","M","S","E","F"],"effect":{"qualities":[{"key":"blast","value":5}]},"condition":null,"note":""},
    {"key":"highCaliber","name":"High Caliber","cost":1,"compatibility":["any"],"effect":{"damage":{"rolled":1,"kept":0}},"condition":null,"note":""},
    {"key":"incendiary","name":"Incendiary","cost":1,"compatibility":["any"],"effect":{"qualities":[{"key":"incendiary","value":null}]},"condition":null,"note":""},
    {"key":"longerBarrel","name":"Longer Barrel","cost":1,"compatibility":["O","L","B","S","E"],"effect":{"range":"double"},"condition":null,"note":""},
    {"key":"lowAmmo","name":"Low Ammo","cost":-1,"compatibility":["any"],"effect":{"clip":"half"},"condition":null,"note":""},
    {"key":"machineGun","name":"Machine Gun","cost":2,"compatibility":["O","L","B","S","E"],"effect":{"rof":{"single":true,"auto":6}},"condition":null,"note":""},
    {"key":"magnumRounds","name":"Magnum Rounds","cost":1,"compatibility":["any"],"effect":{"damage":{"rolled":1,"kept":0}},"condition":null,"note":""},
    {"key":"maximalPower","name":"Maximal Power","cost":2,"compatibility":["P"],"effect":{"damage":{"rolled":0,"kept":1}},"condition":null,"note":""},
    {"key":"meleeAttach","name":"Melee Attach","cost":1,"compatibility":["any"],"effect":{},"condition":null,"note":"Doubles as a spear in melee (use the Spear of the Equipment compendium)."},
    {"key":"meleeAttach2","name":"Melee AttachII","cost":2,"compatibility":["any"],"effect":{},"condition":null,"note":"Doubles as a chainsword in melee (use the Chainsword of the Equipment compendium)."},
    {"key":"motionPredict","name":"Motion Predict","cost":1,"compatibility":["any"],"effect":{},"condition":"motionPredict","note":""},
    {"key":"nonlethal","name":"Nonlethal","cost":-1,"compatibility":["O","S","E"],"effect":{"noExplode":true},"condition":"nonlethal","note":""},
    {"key":"orgoneArray","name":"Orgone Array","cost":1,"compatibility":["S"],"effect":{"qualities":[{"key":"orgoneArray","value":null}]},"condition":"orgoneArray","note":"Each damage die that explodes calls for a Psychic Phenomena roll on the target."},
    {"key":"powerCoils","name":"Power Coils","cost":1,"compatibility":["L","P","M","S","E"],"effect":{"pen":3,"qualities":[{"key":"recharge","value":null}]},"condition":null,"note":""},
    {"key":"precise","name":"Precise","cost":1,"compatibility":["O","L","E"],"effect":{},"condition":null,"note":"Aim can be taken as a reaction."},
    {"key":"preysenseSight","name":"Preysense Sight","cost":1,"compatibility":["any"],"effect":{},"condition":null,"note":"No darkness penalties to hit."},
    {"key":"proven","name":"Proven","cost":2,"compatibility":["O","B","S","E"],"effect":{"qualities":[{"key":"proven","value":3}]},"condition":null,"note":""},
    {"key":"quickDraw","name":"Quick Draw","cost":1,"compatibility":["any"],"effect":{},"condition":null,"note":"Quick Draw with this weapon."},
    {"key":"redDotSight","name":"Red-Dot Sight","cost":1,"compatibility":["any"],"effect":{},"condition":"redDotSight","note":""},
    {"key":"rockAndRoll","name":"Rock and Roll","cost":2,"compatibility":["O","L","B","S","E"],"effect":{"rof":{"single":false,"auto":10}},"condition":null,"note":""},
    {"key":"sawedOff","name":"Sawed Off","cost":-1,"compatibility":["O","L","B","E"],"effect":{"range":"half"},"condition":null,"note":""},
    {"key":"shocking","name":"Shocking","cost":2,"compatibility":["O","P","S","E"],"effect":{"qualities":[{"key":"shocking","value":null}]},"condition":null,"note":""},
    {"key":"shotgun","name":"Shotgun","cost":1,"compatibility":["O","S","E"],"effect":{"qualities":[{"key":"scatter","value":null}]},"condition":null,"note":""},
    {"key":"storm","name":"Storm","cost":2,"compatibility":["O","L","B","E"],"effect":{"qualities":[{"key":"storm","value":null}]},"condition":null,"note":""},
    {"key":"tearing","name":"Tearing","cost":2,"compatibility":["B","E"],"effect":{"qualities":[{"key":"tearing","value":null}]},"condition":null,"note":""},
    {"key":"tightTolerance","name":"Tight Tolerance","cost":1,"compatibility":["O","M","B","E"],"effect":{"qualities":[{"key":"reliable","value":null}]},"condition":null,"note":""},
    {"key":"toxic","name":"Toxic","cost":1,"compatibility":["E"],"effect":{"qualities":[{"key":"toxic","value":null}]},"condition":null,"note":""},
    {"key":"twinlinked","name":"Twinlinked","cost":2,"compatibility":["O","L","B","E"],"effect":{"qualities":[{"key":"twinLinked","value":null}]},"condition":null,"note":""},
    {"key":"unstable","name":"Unstable","cost":1,"compatibility":["P","B","E","F"],"effect":{},"condition":"unstable","note":"On a hit, a d10 of 1 halves the damage and a 10 doubles it."},
    {"key":"volatile","name":"Volatile","cost":2,"compatibility":["O","B","E"],"effect":{"explodeOn":9,"qualities":[{"key":"volatile","value":null}]},"condition":null,"note":""},
  ],
  melee: [
    {"key":"armored","name":"Armored","cost":1,"compatibility":["O","P","F","T","S","H"],"effect":{"qualities":[{"key":"armored","value":null}]},"condition":null,"note":""},
    {"key":"balanced","name":"Balanced","cost":1,"compatibility":["O","P","S"],"effect":{"qualities":[{"key":"balanced","value":null}]},"condition":null,"note":""},
    {"key":"combatSheath","name":"Combat Sheath","cost":1,"compatibility":["O","P","N","S"],"effect":{},"condition":null,"note":"Quick Draw with this weapon."},
    {"key":"defensive","name":"Defensive","cost":0,"compatibility":["O","P","C","N","S"],"effect":{"qualities":[{"key":"defensive","value":null}]},"condition":null,"note":""},
    {"key":"extraDamageI","name":"Extra Damage I","cost":1,"compatibility":["any"],"effect":{"damage":{"rolled":1,"kept":0}},"condition":null,"note":""},
    {"key":"extraDamageII","name":"Extra Damage II","cost":1,"compatibility":["any"],"effect":{"damage":{"rolled":1,"kept":0}},"condition":null,"note":""},
    {"key":"extraPenI","name":"Extra Pen I","cost":1,"compatibility":["any"],"effect":{"pen":2},"condition":null,"note":""},
    {"key":"extraPenII","name":"Extra Pen II","cost":1,"compatibility":["any"],"effect":{"pen":2},"condition":null,"note":""},
    {"key":"flexible","name":"Flexible","cost":2,"compatibility":["S"],"effect":{"qualities":[{"key":"flexible","value":null}]},"condition":null,"note":""},
    {"key":"incendiary","name":"Incendiary","cost":2,"compatibility":["P","T","S"],"effect":{"qualities":[{"key":"incendiary","value":null}],"damageType":"E"},"condition":null,"note":""},
    {"key":"orgoneArray","name":"Orgone Array","cost":1,"compatibility":["S"],"effect":{"qualities":[{"key":"orgoneArray","value":null}]},"condition":"orgoneArray","note":"Each damage die that explodes calls for a Psychic Phenomena roll on the target."},
    {"key":"powerField","name":"Power Field","cost":2,"compatibility":["any"],"effect":{"qualities":[{"key":"powerField","value":null}]},"condition":null,"note":""},
    {"key":"razorSharp","name":"Razor Sharp","cost":1,"compatibility":["O","P","N","T","S","C","U"],"effect":{"qualities":[{"key":"razorSharp","value":null}]},"condition":null,"note":""},
    {"key":"reach","name":"Reach","cost":1,"compatibility":["C","T","S"],"effect":{"qualities":[{"key":"reach","value":null}]},"condition":null,"note":""},
    {"key":"shocking","name":"Shocking","cost":2,"compatibility":["any"],"effect":{"qualities":[{"key":"shocking","value":null}]},"condition":null,"note":""},
    {"key":"snare","name":"Snare","cost":1,"compatibility":["F","S"],"effect":{"qualities":[{"key":"snare","value":null}]},"condition":null,"note":""},
    {"key":"tearing","name":"Tearing","cost":1,"compatibility":["O","S"],"effect":{"qualities":[{"key":"tearing","value":null}]},"condition":null,"note":""},
    {"key":"throwing","name":"Throwing","cost":0,"compatibility":["O","P"],"effect":{"thrown":true,"range":10},"condition":null,"note":"Can be thrown up to 10 m."},
    {"key":"toxic","name":"Toxic","cost":2,"compatibility":["P","N","S"],"effect":{"qualities":[{"key":"toxic","value":null}]},"condition":null,"note":""},
    {"key":"twoHands","name":"Two Hands","cost":2,"compatibility":["O","C","F","S","A"],"effect":{"damage":{"rolled":1,"kept":1},"qualities":[{"key":"twoHands","value":null}]},"condition":null,"note":""},
    {"key":"unbalanced","name":"Unbalanced","cost":-1,"compatibility":["O","C","F","T","S","A"],"effect":{"qualities":[{"key":"unbalanced","value":null}]},"condition":null,"note":""},
    {"key":"volatile","name":"Volatile","cost":1,"compatibility":["F","S","A"],"effect":{"explodeOn":9,"qualities":[{"key":"volatile","value":null}]},"condition":null,"note":""},
  ],
};

/** Availability (p. 519): the rarity total → the 007 rarity key and its TN. */
export const WEAPON_AVAILABILITY = [{"cost":-3,"rarity":"worthless","tn":0},{"cost":-2,"rarity":"ubiquitous","tn":2},{"cost":-1,"rarity":"veryCommon","tn":5},{"cost":0,"rarity":"common","tn":10},{"cost":1,"rarity":"uncommon","tn":15},{"cost":2,"rarity":"rare","tn":20},{"cost":3,"rarity":"veryRare","tn":25},{"cost":4,"rarity":"mythicRare","tn":30},{"cost":5,"rarity":"nearUnique","tn":35},{"cost":6,"rarity":"fabulousMax","tn":40},{"cost":7,"rarity":"irrationallyExpensive","tn":45},{"cost":8,"rarity":"glittergold","tn":50}];

/** Qualities whose value keeps the highest when two sources give it (Blast, Proven). */
const HIGHEST = new Set(["blast", "proven"]);
/** Reload times from quickest to slowest (p. 516: doubled or halved along this ladder). */
const RELOAD_LADDER = ["Half", "Full", "2 Full", "4 Full"];

/**
 * Row of the availability chart for a rarity total, clamped to its ends (−3 … +8).
 * @param {number} cost
 * @returns {{cost: number, rarity: string, tn: number}}
 */
export function availability(cost) {
  const n = Math.max(WEAPON_AVAILABILITY[0].cost, Math.min(WEAPON_AVAILABILITY.at(-1).cost, Math.round(cost)));
  return WEAPON_AVAILABILITY.find((r) => r.cost === n);
}

/**
 * Mods of a family's table open to a type letter.
 * @param {"ranged"|"melee"} family
 * @param {string} letter
 */
export function compatibleMods(family, letter) {
  return (WEAPON_MODS[family] ?? []).filter((m) => m.compatibility.includes("any") || m.compatibility.includes(letter));
}

/** How many mods a type allows: 2, or 3 with an extra mod (p. 517). */
export const modLimit = (family, letter) => 2 + (WEAPON_CREATION_TYPES[family]?.[letter]?.extraMods ?? 0);

/**
 * Double or halve a reload time along the ladder Half, Full, 2 Full, 4 Full; other values are kept.
 * @param {string} value
 * @param {"double"|"half"} how
 */
export function reloadStep(value, how) {
  const i = RELOAD_LADDER.indexOf(value);
  if (i < 0) return value;
  return RELOAD_LADDER[Math.max(0, Math.min(RELOAD_LADDER.length - 1, i + (how === "double" ? 1 : -1)))];
}

/** Unstable (p. 518): on a hit a d10 of 1 halves the damage (rounding down), a 10 doubles it. */
export const unstableDamage = (total, d10) => (d10 === 1 ? Math.floor(total / 2) : d10 === 10 ? total * 2 : total);

/** Merge qualities: no duplicates; Blast and Proven keep the highest value. */
function addQualities(list, extra) {
  for (const x of extra ?? []) {
    const found = list.find((y) => y.key === x.key);
    if (!found) list.push({ key: x.key, value: x.value ?? null });
    else if (HIGHEST.has(x.key) && (x.value ?? 0) > (found.value ?? 0)) found.value = x.value;
  }
}

/** Apply a size-like change ("double", "half" or a number) to a value. */
const resize = (value, change) => {
  if (change === "double") return value * 2;
  if (change === "half") return Math.max(1, Math.floor(value / 2));
  return typeof change === "number" ? change : value;
};

/**
 * Build a weapon (research R3): template, then type, then the mods in the order picked. Damage dice, Pen and qualities
 * add up (Blast and Proven keep the highest); a mod that sets the rate of fire replaces the earlier one (warning
 * `rofOverride`); Bullet Hose adds 2 to full auto; a mod's damage type beats the type's; the rarity total is the mods'
 * cost plus the type's shift. Limits give warnings (`tooMany`, `incompatible`, `duplicate`).
 * @param {{family: "ranged"|"melee", template: string, type: string, damageType?: string, mods?: string[]}} build
 * @returns {{system: object, cost: number, availability: object, warnings: string[], notes: string[], conditions: string[]}}
 */
export function buildWeapon({ family, template, type, damageType = "", mods = [] }) {
  const tpl = WEAPON_TEMPLATES[template];
  const t = WEAPON_CREATION_TYPES[family]?.[type];
  if (!tpl || !t) throw new Error(`dtd40k | unknown template or type: ${template} ${family}.${type}`);
  const warnings = [];
  const notes = [];
  const conditions = [];
  const qualities = [];
  const choices = Array.isArray(t.damageType) ? t.damageType : null;
  let dmgType = typeof t.damageType === "string" ? t.damageType : choices ? (choices.includes(damageType) ? damageType : choices[0]) : tpl.damage.type;
  const damage = { rolled: tpl.damage.rolled + t.damage.rolled, kept: tpl.damage.kept + t.damage.kept };
  let pen = tpl.pen + t.pen;
  const rof = { ...tpl.rof };
  let range = t.range ? resize(tpl.range, t.range) : tpl.range;
  let clip = t.clip ? resize(tpl.clip, t.clip) : tpl.clip;
  let reload = t.reload ? reloadStep(tpl.reload, t.reload) : tpl.reload;
  let thrown = false;
  let explodeOn = null;
  let noExplode = false;
  addQualities(qualities, t.qualities);
  let cost = t.rarity;
  let rofSet = false;

  const table = WEAPON_MODS[family];
  const seen = new Set();
  mods.forEach((key, index) => {
    const mod = table.find((m) => m.key === key);
    if (!mod) return;
    if (seen.has(key)) { warnings.push("duplicate"); return; }
    seen.add(key);
    if (!(mod.compatibility.includes("any") || mod.compatibility.includes(type))) warnings.push("incompatible");
    if (index >= modLimit(family, type)) warnings.push("tooMany");
    cost += mod.cost;
    const e = mod.effect;
    if (e.damage) { damage.rolled += e.damage.rolled ?? 0; damage.kept += e.damage.kept ?? 0; }
    if (e.pen) pen += e.pen;
    if (e.damageType) dmgType = e.damageType;
    if (e.range !== undefined) range = resize(range, e.range);
    if (e.clip) clip = resize(clip, e.clip);
    if (e.reload) reload = reloadStep(reload, e.reload);
    if (e.thrown) thrown = true;
    if (e.explodeOn) explodeOn = e.explodeOn;
    if (e.noExplode) noExplode = true;
    if (e.rof) {
      if (e.rof.autoDelta) rof.auto += e.rof.autoDelta;
      else {
        if (rofSet) warnings.push("rofOverride");
        rof.single = e.rof.single;
        rof.auto = e.rof.auto;
        rofSet = true;
      }
    }
    addQualities(qualities, e.qualities);
    if (mod.condition) conditions.push(mod.condition);
    if (mod.note) notes.push(`${mod.name}: ${mod.note}`);
  });

  const avail = availability(cost);
  const system = {
    weaponType: tpl.weaponType, thrown, group: t.group, proficiencies: [...t.proficiencies],
    damage: { rolled: damage.rolled, kept: damage.kept, type: dmgType, bonus: 0 },
    pen, rof, range: { value: range, strMultiplier: 0 }, clip, reload, qualities, rarity: avail.rarity
  };
  return { system, cost, availability: avail, warnings: [...new Set(warnings)], notes, conditions, explodeOn, noExplode };
}
