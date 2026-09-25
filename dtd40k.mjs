/**
 * Dungeons the Dragoning — Foundry VTT system entry point.
 */
import { DTD } from "./module/config.mjs";
import { CharacterData } from "./module/data/character-data.mjs";
import { RaceData } from "./module/data/race-data.mjs";
import { DtdActor } from "./module/documents/actor.mjs";
import { DtdItem } from "./module/documents/item.mjs";
import { CharacterSheet } from "./module/apps/character-sheet.mjs";
import { RaceSheet } from "./module/apps/race-sheet.mjs";

Hooks.once("init", () => {
  console.log("dtd40k | Initializing Dungeons the Dragoning system");
  CONFIG.DTD = DTD;

  CONFIG.Actor.documentClass = DtdActor;
  CONFIG.Actor.dataModels.character = CharacterData;

  CONFIG.Item.documentClass = DtdItem;
  CONFIG.Item.dataModels.race = RaceData;

  // Initiative: 1d10 + Dexterity + Composure, no explosion (DtD 1.6 p. 241).
  CONFIG.Combat.initiative = {
    formula: "1d10 + @characteristics.dex.value + @characteristics.cmp.value",
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

  foundry.applications.handlebars.loadTemplates(CharacterSheet.PARTIALS);
});
