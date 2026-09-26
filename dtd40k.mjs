/**
 * Dungeons the Dragoning — Foundry VTT system entry point.
 */
import { DTD } from "./module/config.mjs";
import { CharacterData } from "./module/data/character-data.mjs";
import { RaceData } from "./module/data/race-data.mjs";
import { ExaltationData } from "./module/data/exaltation-data.mjs";
import { FeatData } from "./module/data/feat-data.mjs";
import { ClassData } from "./module/data/class-data.mjs";
import { WeaponData } from "./module/data/weapon-data.mjs";
import { ArmorData } from "./module/data/armor-data.mjs";
import { GearData } from "./module/data/gear-data.mjs";
import { DtdActiveEffect } from "./module/documents/active-effect.mjs";
import { rollDamage } from "./module/documents/attack-service.mjs";
import { spendLiquid } from "./module/documents/acquisition-service.mjs";
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

  CONFIG.Item.documentClass = DtdItem;
  CONFIG.Item.dataModels.race = RaceData;
  CONFIG.Item.dataModels.exaltation = ExaltationData;
  CONFIG.Item.dataModels.feat = FeatData;
  CONFIG.Item.dataModels.class = ClassData;
  CONFIG.Item.dataModels.weapon = WeaponData;
  CONFIG.Item.dataModels.armor = ArmorData;
  CONFIG.Item.dataModels.gear = GearData;
  // Equipment effects apply only while the item is in use (spec 007, research R2).
  CONFIG.ActiveEffect.documentClass = DtdActiveEffect;

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
    if (actor?.type !== "character" || !actor.items.some((item) => item.type === "exaltation")) continue;
    actor.reset();
    if (actor.sheet?.rendered) actor.sheet.render();
  }
}

Hooks.on("updateCombat", (combat, changes) => {
  if ("round" in changes || "turn" in changes) refreshCombatants(combat);
});
Hooks.on("combatStart", refreshCombatants);

// Buttons of the attack and acquisition cards (spec 007, research R7/R9).
Hooks.on("renderChatMessageHTML", (message, html) => {
  html.querySelector("[data-dtd-action=\"rollDamage\"]")?.addEventListener("click", () => rollDamage(message));
  html.querySelector("[data-dtd-action=\"spendLiquid\"]")?.addEventListener("click", () => spendLiquid(message));
});
Hooks.on("deleteCombat", refreshCombatants);
