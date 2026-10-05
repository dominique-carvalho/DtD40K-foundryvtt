/**
 * Dungeons the Dragoning — Foundry VTT system entry point.
 */
import { DTD } from "./module/config.mjs";
import { UpdateIconsMenu } from "./module/apps/update-icons.mjs";
import { CharacterData } from "./module/data/character-data.mjs";
import { NpcData } from "./module/data/npc-data.mjs";
import { MinionSquadData } from "./module/data/minion-squad-data.mjs";
import { VehicleData } from "./module/data/vehicle-data.mjs";
import { VehicleComponentData } from "./module/data/vehicle-component-data.mjs";
import { ShipData } from "./module/data/ship-data.mjs";
import { ShipComponentData } from "./module/data/ship-component-data.mjs";
import { SquadronData } from "./module/data/squadron-data.mjs";
import { NpcSheet } from "./module/apps/npc-sheet.mjs";
import { MinionSheet } from "./module/apps/minion-sheet.mjs";
import { fearFromCard } from "./module/documents/npc-service.mjs";
import { rollMinionDamage } from "./module/documents/minion-service.mjs";
import { RaceData } from "./module/data/race-data.mjs";
import { ExaltationData } from "./module/data/exaltation-data.mjs";
import { FeatData } from "./module/data/feat-data.mjs";
import { ClassData } from "./module/data/class-data.mjs";
import { WeaponData } from "./module/data/weapon-data.mjs";
import { ArmorData } from "./module/data/armor-data.mjs";
import { GearData } from "./module/data/gear-data.mjs";
import { SpellData } from "./module/data/spell-data.mjs";
import { SpellSheet } from "./module/apps/spell-sheet.mjs";
import { MartialSchoolData } from "./module/data/martial-school-data.mjs";
import { MartialSchoolSheet } from "./module/apps/martial-school-sheet.mjs";
import { DeityData } from "./module/data/deity-data.mjs";
import { DeitySheet } from "./module/apps/deity-sheet.mjs";
import { VehicleComponentSheet } from "./module/apps/vehicle-component-sheet.mjs";
import { ShipComponentSheet } from "./module/apps/ship-component-sheet.mjs";
import { ShipSheet } from "./module/apps/ship-sheet.mjs";
import { SquadronSheet } from "./module/apps/squadron-sheet.mjs";
import { applyShipDamage, boardingRound, evasive as shipEvasive, rollShipDamage, undoShipDamage } from "./module/documents/ship-combat-service.mjs";
import { newScene as newShipScene } from "./module/documents/ship-service.mjs";
import { warpStep } from "./module/documents/warp-service.mjs";
import { VehicleSheet } from "./module/apps/vehicle-sheet.mjs";
import { allVehicles, controlTest, evasive, explode, newScene as newVehicleScene, rollOutOfControl, vehicleOfCard } from "./module/documents/vehicle-service.mjs";
import { markObstacle, rollChaseRound, startChaseFromCanvas } from "./module/documents/chase-service.mjs";
import { DtdActiveEffect } from "./module/documents/active-effect.mjs";
import { rollDamage } from "./module/documents/attack-service.mjs";
import { spendLiquid } from "./module/documents/acquisition-service.mjs";
import { DtdCombat, DtdCombatant } from "./module/documents/combat.mjs";
import { applyDamage, undoDamage } from "./module/documents/damage-service.mjs";
import { rollDefense } from "./module/documents/turn-service.mjs";
import { resolveSocial } from "./module/documents/social-service.mjs";
import { resistSpell, rollSpellDamage } from "./module/documents/magic-service.mjs";
import { applyAttackEffects, newScene } from "./module/documents/martial-service.mjs";
import { DtdActor } from "./module/documents/actor.mjs";
import { resetReloadProgress } from "./module/documents/ammo-service.mjs";
import { endHazard, fallAcrobatics, hazardStep, openHazardTool, openXpDialog, reduceFall } from "./module/documents/hazard-service.mjs";
import { flightFall, offerFlightFall } from "./module/documents/flight-service.mjs";
import { applyAbility, resistAbility } from "./module/documents/ability-service.mjs";
import { resetAbilityUses } from "./module/documents/form-service.mjs";
import { clearZones, confirmZone, fireOverwatch, rollPinning, suppressionDamage, suppressionDodge } from "./module/documents/zone-service.mjs";
import { endGrapple, maneuverAsGm, startGrapple } from "./module/documents/maneuver-service.mjs";
import { promptCover, setCover } from "./module/documents/condition-service.mjs";
import { DtdItem } from "./module/documents/item.mjs";
import { CharacterSheet } from "./module/apps/character-sheet.mjs";
import { DtdTokenDocument } from "./module/documents/token-document.mjs";
import { DtdToken } from "./module/canvas/token.mjs";
import { CogitatorSheet } from "./module/apps/cogitator-sheet.mjs";
import { IlluminatedSheet } from "./module/apps/illuminated-sheet.mjs";
import { RaceSheet } from "./module/apps/race-sheet.mjs";
import { ExaltationSheet } from "./module/apps/exaltation-sheet.mjs";
import { FeatSheet } from "./module/apps/feat-sheet.mjs";
import { ClassSheet } from "./module/apps/class-sheet.mjs";
import { EquipmentSheet } from "./module/apps/equipment-sheet.mjs";

Hooks.once("init", () => {
  console.log("dtd40k | Initializing Dungeons the Dragoning system");
  CONFIG.DTD = DTD;

  // GM: bring the world's compendium documents to the system icons (spec 024, FR-010).
  game.settings.registerMenu("dtd40k", "updateIcons", {
    name: "DTD.Icons.Menu.Name", label: "DTD.Icons.Menu.Label", hint: "DTD.Icons.Menu.Hint",
    icon: "fa-solid fa-image", type: UpdateIconsMenu, restricted: true
  });

  CONFIG.Actor.documentClass = DtdActor;
  CONFIG.Actor.dataModels.character = CharacterData;
  // Antagonists (spec 012): NPCs share the character model; Minion Squads have their own.
  CONFIG.Actor.dataModels.npc = NpcData;
  CONFIG.Actor.dataModels.minionSquad = MinionSquadData;
  // Vehicles (spec 013).
  CONFIG.Actor.dataModels.vehicle = VehicleData;
  CONFIG.Item.dataModels.vehicleComponent = VehicleComponentData;
  CONFIG.Actor.dataModels.ship = ShipData;
  CONFIG.Actor.dataModels.squadron = SquadronData;
  CONFIG.Item.dataModels.shipComponent = ShipComponentData;

  CONFIG.Item.documentClass = DtdItem;
  CONFIG.Item.dataModels.race = RaceData;
  CONFIG.Item.dataModels.exaltation = ExaltationData;
  CONFIG.Item.dataModels.feat = FeatData;
  CONFIG.Item.dataModels.class = ClassData;
  CONFIG.Item.dataModels.weapon = WeaponData;
  CONFIG.Item.dataModels.armor = ArmorData;
  CONFIG.Item.dataModels.gear = GearData;
  CONFIG.Item.dataModels.spell = SpellData;
  CONFIG.Item.dataModels.martialSchool = MartialSchoolData;
  CONFIG.Item.dataModels.deity = DeityData;
  // Equipment effects apply only while the item is in use (spec 007, research R2).
  CONFIG.ActiveEffect.documentClass = DtdActiveEffect;
  // Combat order, turn limits and the conditions of the book (spec 008, research R3–R5).
  CONFIG.Combat.documentClass = DtdCombat;
  CONFIG.Combatant.documentClass = DtdCombatant;
  // NPC traits on the map (spec 022): movement action, vision and terrain cost derived from the actor.
  CONFIG.Token.documentClass = DtdTokenDocument;
  CONFIG.Token.objectClass = DtdToken;
  // Phasing: an incorporeal token passes through walls (walls: null); only it can pick this action.
  CONFIG.Token.movement.actions.phase = {
    label: "DTD.Npc.Phase",
    icon: "fa-solid fa-ghost",
    img: "icons/svg/mystery-man.svg",
    order: 9,
    walls: null,
    canSelect: (token) => Boolean(token.actor?.system?.traitFlags?.phasing && token.actor.statuses.has("incorporeal"))
  };
  // The active GM creates characters for players who cannot create actors (spec 023).
  CONFIG.queries["dtd40k.createCharacter"] = async (data) => {
    const { createCharacterForPlayer } = await import("./module/documents/builder-service.mjs");
    return createCharacterForPlayer(data);
  };
  CONFIG.statusEffects = foundry.utils.deepClone(DTD.STATUS_EFFECTS);
  CONFIG.specialStatusEffects.DEFEATED = "dead";

  // Initiative: 1d10 + Dexterity + Composure, no explosion (DtD 1.6 p. 241).
  CONFIG.Combat.initiative = {
    formula: "1d10 + @characteristics.dex.value + @characteristics.cmp.value + @modifiers.initiative",
    decimals: 0
  };

  // Character sheet layouts (spec 021): Cogitator by default, Illuminated in the sheet menu. CharacterSheet stays the
  // base of both and of the NPC sheet, but is no longer offered for characters.
  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "dtd40k", CogitatorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "DTD.Sheet.Cogitator"
  });
  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "dtd40k", IlluminatedSheet, {
    types: ["character"],
    label: "DTD.Sheet.Illuminated"
  });

  // Antagonists (spec 012).
  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "dtd40k", NpcSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "DTD.Sheet.Npc"
  });
  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "dtd40k", MinionSheet, {
    types: ["minionSquad"],
    makeDefault: true,
    label: "DTD.Sheet.MinionSquad"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", RaceSheet, {
    types: ["race"],
    makeDefault: true,
    label: "DTD.Sheet.Race"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", ExaltationSheet, {
    types: ["exaltation"],
    makeDefault: true,
    label: "DTD.Sheet.Exaltation"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", FeatSheet, {
    types: ["feat"],
    makeDefault: true,
    label: "DTD.Sheet.Feat"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", ClassSheet, {
    types: ["class"],
    makeDefault: true,
    label: "DTD.Sheet.Class"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", EquipmentSheet, {
    types: ["weapon", "armor", "gear"],
    makeDefault: true,
    label: "DTD.Sheet.Equipment"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", SpellSheet, {
    types: ["spell"],
    makeDefault: true,
    label: "DTD.Sheet.Spell"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", MartialSchoolSheet, {
    types: ["martialSchool"],
    makeDefault: true,
    label: "DTD.Sheet.MartialSchool"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", DeitySheet, {
    types: ["deity"],
    makeDefault: true,
    label: "DTD.Sheet.Deity"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "dtd40k", VehicleSheet, {
    types: ["vehicle"],
    makeDefault: true,
    label: "DTD.Sheet.Vehicle"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "dtd40k", ShipSheet, {
    types: ["ship"],
    makeDefault: true,
    label: "DTD.Sheet.Ship"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "dtd40k", SquadronSheet, {
    types: ["squadron"],
    makeDefault: true,
    label: "DTD.Sheet.Squadron"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", ShipComponentSheet, {
    types: ["shipComponent"],
    makeDefault: true,
    label: "DTD.Sheet.ShipComponent"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "dtd40k", VehicleComponentSheet, {
    types: ["vehicleComponent"],
    makeDefault: true,
    label: "DTD.Sheet.VehicleComponent"
  });

  foundry.applications.handlebars.loadTemplates(CharacterSheet.PARTIALS);
});

/**
 * The exaltation's "spent this round" counter depends on the current combat round (spec 004,
 * research R4). When the round changes, recompute the combatants locally and refresh their
 * open sheets; nothing is written to the database.
 * @param {Combat} combat
 */
function refreshCombatants(combat) {
  for (const combatant of combat.combatants) {
    const actor = combatant.actor;
    // Ships: the Crew free this round depends on the round (spec 014).
    if (actor?.type === "ship") {
      actor.reset();
      if (actor.sheet?.rendered) actor.sheet.render();
      continue;
    }
    if (actor?.type !== "character" && actor?.type !== "npc") continue;
    // Exaltation spending depends on the round (004); the Combat tab shows the turn state (008).
    if (actor.items.some((item) => item.type === "exaltation")) actor.reset();
    if (actor.sheet?.rendered) actor.sheet.render();
  }
}

Hooks.on("updateCombat", (combat, changes) => {
  if ("round" in changes || "turn" in changes) refreshCombatants(combat);
});
Hooks.on("combatStart", refreshCombatants);
// Actors are prepared before the combat exists: recompute the ships' Crew of this round once the world is ready.
Hooks.once("ready", () => {
  if (game.combat) refreshCombatants(game.combat);
});

// Buttons of the attack and acquisition cards (spec 007, research R7/R9).
const CHAT_ACTIONS = {
  // Flyers that fall (spec 022).
  flightFall: (message, data) => flightFall(message, data),
  // NPC special abilities (spec 022).
  abilityResist: (message, data) => resistAbility(message, data),
  abilityApply: (message, data) => applyAbility(message, data),
  rollDamage: (message) => rollDamage(message),
  spendLiquid: (message) => spendLiquid(message),
  // Combat (spec 008): apply damage, undo, reactions, social answers.
  applyDamage: (message) => applyDamage(message),
  undoDamage: (message) => undoDamage(message),
  dodge: (message) => rollDefense(message, "dodge"),
  parry: (message) => rollDefense(message, "parry"),
  socialSpend: (message) => resolveSocial(message, "spend"),
  socialComply: (message) => resolveSocial(message, "comply"),
  socialRefute: (message) => resolveSocial(message, "refute"),
  // Magic (spec 009): spell damage and resistance.
  spellDamage: (message) => rollSpellDamage(message),
  resistSpell: (message) => resistSpell(message),
  // Sword Schools and Gun Kata (spec 010): effects of a Special Attack on the target.
  martialEffects: (message) => applyAttackEffects(message),
  // Antagonists (spec 012): Fear Test from an NPC card, Minion Squad damage.
  npcFear: (message) => fearFromCard(message),
  minionDamage: (message) => rollMinionDamage(message),
  // Vehicles (spec 013): Evasive Maneuvers, Control Test and Out of Control after a ram, explosion, chases.
  vehicleEvasive: (message) => evasive(message),
  vehicleControl: async (message) => {
    const vehicle = await vehicleOfCard(message);
    if (vehicle) await controlTest(vehicle, { reason: game.i18n.localize("DTD.Vehicle.Ram") });
  },
  vehicleOutOfControl: async (message) => {
    const vehicle = await vehicleOfCard(message);
    if (vehicle) await rollOutOfControl(vehicle);
  },
  vehicleExplode: async (message) => {
    const vehicle = await vehicleOfCard(message);
    if (vehicle && game.user.isGM) await explode(vehicle);
  },
  chaseRound: (message) => rollChaseRound(message),
  // Ships (spec 014): ship damage and its Apply, Evasive Manoeuvers, undo, boarding rounds, Warp steps.
  shipDamage: (message) => rollShipDamage(message),
  shipApply: (message) => applyShipDamage(message),
  shipEvasive: (message) => shipEvasive(message),
  shipUndo: (message) => undoShipDamage(message),
  boardingRound: (message) => boardingRound(message),
  warpStep: (message) => warpStep(message),
  chaseObstacle: (message, data) => markObstacle(message, data.uuid),
  // Combat actions (spec 017): kill zones, Pinning, the burst, the grapple.
  confirmZone: (message) => confirmZone(message),
  fireOverwatch: (message) => fireOverwatch(message),
  rollPinning: (message, data) => rollPinning(message, data),
  suppressionDamage: (message, data) => suppressionDamage(message, data),
  suppressionDodge: (message, data) => suppressionDodge(message, data),
  startGrapple: (message) => startGrapple(message),
  // Hazards (spec 018): Acrobatics on a fall, the intervals of suffocation and forced march.
  fallAcrobatics: (message) => fallAcrobatics(message),
  hazardStep: (message) => hazardStep(message),
  hazardEnd: (message) => endHazard(message)
};
Hooks.on("renderChatMessageHTML", (message, html) => {
  for (const button of html.querySelectorAll("[data-dtd-action]")) {
    const handler = CHAT_ACTIONS[button.dataset.dtdAction];
    if (button.classList.contains("gm-only") && !game.user.isGM) button.remove();
    else if (handler) button.addEventListener("click", () => handler(message, button.dataset));
  }
});

// Requests from players that only the active GM may perform (spec 008, research R1).
Hooks.once("ready", () => {
  game.socket.on("system.dtd40k", async ({ action, payload }) => {
    if (game.users.activeGM !== game.user) return;
    // Conditions and grapple links on actors the player does not own (spec 017).
    if (action === "maneuver") return maneuverAsGm(payload);
    const message = game.messages.get(payload.messageId);
    if (!message) return;
    if (action === "applyDamage") await applyDamage(message, payload.tokenUuids);
    if (action === "ability") await applyAbility(message, payload);
    if (action === "hazard" && payload.op === "fallReduce") await reduceFall(message, payload.reduce);
    if (action === "martialEffects") await applyAttackEffects(message);
    if (action === "shipApply") await applyShipDamage(message, payload.targetUuid);
    if (action === "markSocial") await message.setFlag("dtd40k", "social", { ...message.getFlag("dtd40k", "social"), resolved: payload.resolved });
  });
});
Hooks.on("deleteCombat", refreshCombatants);
// Kill zones, Delay and grapples end with the combat (spec 017); so does a reload under way (spec 019).
Hooks.on("deleteCombat", async (combat) => {
  if (game.users.activeGM !== game.user) return;
  await clearZones(combat);
  for (const actor of new Set(combat.combatants.map((c) => c.actor).filter(Boolean))) await resetReloadProgress(actor);
  for (const actor of new Set(combat.combatants.map((c) => c.actor).filter((a) => a?.getFlag("dtd40k", "grapple")))) await endGrapple(actor);
});
// In Cover asks for the cover's Armor Points and locations; removing it clears them (spec 017).
Hooks.on("createActiveEffect", (effect, options, userId) => {
  if (userId === game.user.id && effect.statuses?.has("inCover") && effect.parent instanceof Actor) promptCover(effect.parent);
  // A flyer that is stunned, knocked out or prone falls (spec 022).
  if (userId === game.user.id && effect.statuses?.size) offerFlightFall(effect);
});
Hooks.on("deleteActiveEffect", (effect, options, userId) => {
  if (userId === game.user.id && effect.statuses?.has("inCover") && effect.parent instanceof Actor) setCover(effect.parent, null);
});
// Last Resort (spec 010): once per scene; the end of a combat starts a new one.
Hooks.on("deleteCombat", async (combat) => {
  if (game.users.activeGM !== game.user) return;
  for (const actor of new Set(combat.combatants.map((c) => c.actor).filter((a) => a?.type === "character"))) await newScene(actor);
  // Uses per scene of NPC abilities come back (spec 022).
  for (const actor of new Set(combat.combatants.map((c) => c.actor).filter((a) => a?.type === "npc"))) await resetAbilityUses(actor);
  // Vehicles: wounds in the scene and round-based conditions reset (spec 013).
  for (const vehicle of allVehicles()) await newVehicleScene(vehicle);
  // Ships: temporary Crew, committed Crew and this round's effects end (spec 014).
  for (const ship of new Set(combat.combatants.map((c) => c.actor).filter((a) => a?.type === "ship"))) await newShipScene(ship);
});
// The GM opens the custom weapon builder from the Items directory (spec 015).
// Character builder (spec 023): "New character" in the Actors directory, for every user.
Hooks.on("renderActorDirectory", (app, html) => {
  const root = html instanceof HTMLElement ? html : html[0];
  const actions = root?.querySelector(".header-actions");
  if (!actions || actions.querySelector(".dtd-character-builder")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "dtd-character-builder";
  button.innerHTML = `<i class="fa-solid fa-user-plus" inert></i> ${game.i18n.localize("DTD.Builder.Open")}`;
  button.addEventListener("click", async () => {
    const { CharacterBuilder } = await import("./module/apps/character-builder.mjs");
    await CharacterBuilder.open();
  });
  actions.append(button);
});

Hooks.on("renderItemDirectory", (app, html) => {
  if (!game.user.isGM) return;
  const root = html instanceof HTMLElement ? html : html[0];
  const actions = root?.querySelector(".header-actions");
  if (!actions || actions.querySelector(".dtd-weapon-builder")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "dtd-weapon-builder";
  button.innerHTML = `<i class="fa-solid fa-hammer" inert></i> ${game.i18n.localize("DTD.WeaponBuilder.Open")}`;
  button.addEventListener("click", async () => {
    const { openWeaponBuilder } = await import("./module/apps/weapon-builder.mjs");
    await openWeaponBuilder();
  });
  actions.append(button);
});

// The GM starts a chase with the controlled and targeted tokens (spec 013, FR-011).
Hooks.on("getSceneControlButtons", (controls) => {
  const tokens = controls.tokens;
  if (!tokens?.tools || !game.user.isGM) return;
  tokens.tools.dtdChase = {
    name: "dtdChase", title: "DTD.Chase.Start", icon: "fa-solid fa-flag-checkered", button: true,
    order: Object.keys(tokens.tools).length + 1, visible: true, onChange: () => startChaseFromCanvas()
  };
  // Hazards and the group XP award (spec 018).
  tokens.tools.dtdHazard = {
    name: "dtdHazard", title: "DTD.Hazard.Title", icon: "fa-solid fa-skull-crossbones", button: true,
    order: Object.keys(tokens.tools).length + 1, visible: true, onChange: () => openHazardTool()
  };
  tokens.tools.dtdXp = {
    name: "dtdXp", title: "DTD.Xp.Title", icon: "fa-solid fa-star", button: true,
    order: Object.keys(tokens.tools).length + 1, visible: true, onChange: () => openXpDialog()
  };
});
// The turn state lives on the Combatant (spec 008): refresh the open sheet when it changes.
Hooks.on("updateCombatant", (combatant) => {
  if (combatant.actor?.sheet?.rendered) combatant.actor.sheet.render();
});
