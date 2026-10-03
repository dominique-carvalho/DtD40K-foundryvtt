import { CharacterSheet } from "./character-sheet.mjs";

const ROOT = "systems/dtd40k/templates/actor/cogitator";
// Each tab scrolls on its own beside the fixed rail; Foundry keeps their scroll position across renders.
const TAB_PARTS = ["main", "traits", "equipment", "combat", "magic", "martial", "class"];

/**
 * Character sheet, Cogitator layout (spec 021, US1): a fixed side rail with identity and resources, machine readouts,
 * key tabs, riveted characteristic modules and a rollable skill table. Default sheet for characters.
 * Only the header, tabs and main parts change; actions and the other tabs come from CharacterSheet.
 */
export class CogitatorSheet extends CharacterSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["layout-cogitator"],
    position: { width: 900, height: 900 }
  };

  /** @override */
  static PARTS = Object.fromEntries(Object.entries({
    ...CharacterSheet.PARTS,
    header: { template: `${ROOT}/rail.hbs`, scrollable: [""] },
    tabs: { template: `${ROOT}/tabs.hbs` },
    main: { template: `${ROOT}/main.hbs` }
  }).map(([id, part]) => [id, TAB_PARTS.includes(id) ? { ...part, scrollable: [""] } : part]));
}
