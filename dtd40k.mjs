/**
 * Dungeons the Dragoning — Foundry VTT system entry point.
 */
import { DTD } from "./module/config.mjs";
import { CharacterData } from "./module/data/character-data.mjs";
import { NpcData } from "./module/data/npc-data.mjs";
import { MinionSquadData } from "./module/data/minion-squad-data.mjs";
import { VehicleData } from "./module/data/vehicle-data.mjs";
import { VehicleComponentData } from "./module/data/vehicle-component-data.mjs";
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
import { DtdItem } from "./module/documents/item.mjs";
import { CharacterSheet } from "./module/apps/character-sheet.mjs";
import { RaceSheet } from "./module/apps/race-sheet.mjs";
import { ExaltationSheet } from "./module/apps/exaltation-sheet.mjs";
import { FeatSheet } from "./module/apps/feat-sheet.mjs";
import { ClassSheet } from "./module/apps/class-sheet.mjs";
import { EquipmentSheet } from "./module/apps/equipment-sheet.mjs";

Hooks.once("init", () => {
  console.log("dtd40k | Initializing Dungeons the Dragoning system");
  CONFIG.DTD = DTD;

  CONFIG.Actor.documentClass = DtdActor;
  CONFIG.Actor.dataModels.character = CharacterData;
  // Antagonists (spec 012): NPCs share the character model; Minion Squads have their own.
  CONFIG.Actor.dataModels.npc = NpcData;
  CONFIG.Actor.dataModels.minionSquad = MinionSquadData;
  // Vehicles (spec 013).
  CONFIG.Actor.dataModels.vehicle = VehicleData;
  CONFIG.Item.dataModels.vehicleComponent = VehicleComponentData;

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
  CONFIG.statusEffects = foundry.utils.deepClone(DTD.STATUS_EFFECTS);
  CONFIG.specialStatusEffects.DEFEATED = "dead";

  // Initiative: 1d10 + Dexterity + Composure, no explosion (DtD 1.6 p. 241).
  CONFIG.Combat.initiative = {
    formula: "1d10 + @characteristics.dex.value + @characteristics.cmp.value + @modifiers.initiative",
    decimals: 0
  };

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "dtd40k", CharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "DTD.Sheet.Character"
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

// Buttons of the attack and acquisition cards (spec 007, research R7/R9).
const CHAT_ACTIONS = {
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
  minionDamage: (message) => rollMinionDamage(message)
};
Hooks.on("renderChatMessageHTML", (message, html) => {
  for (const button of html.querySelectorAll("[data-dtd-action]")) {
    const handler = CHAT_ACTIONS[button.dataset.dtdAction];
    if (button.classList.contains("gm-only") && !game.user.isGM) button.remove();
    else if (handler) button.addEventListener("click", () => handler(message));
  }
});

// Requests from players that only the active GM may perform (spec 008, research R1).
Hooks.once("ready", () => {
  game.socket.on("system.dtd40k", async ({ action, payload }) => {
    if (game.users.activeGM !== game.user) return;
    const message = game.messages.get(payload.messageId);
    if (!message) return;
    if (action === "applyDamage") await applyDamage(message, payload.tokenUuids);
    if (action === "martialEffects") await applyAttackEffects(message);
    if (action === "markSocial") await message.setFlag("dtd40k", "social", { ...message.getFlag("dtd40k", "social"), resolved: payload.resolved });
  });
});
Hooks.on("deleteCombat", refreshCombatants);
// Last Resort (spec 010): once per scene; the end of a combat starts a new one.
Hooks.on("deleteCombat", async (combat) => {
  if (game.users.activeGM !== game.user) return;
  for (const actor of new Set(combat.combatants.map((c) => c.actor).filter((a) => a?.type === "character"))) await newScene(actor);
});
// The turn state lives on the Combatant (spec 008): refresh the open sheet when it changes.
Hooks.on("updateCombatant", (combatant) => {
  if (combatant.actor?.sheet?.rendered) combatant.actor.sheet.render();
});
