import { CharacterSheet } from "./character-sheet.mjs";

const ROOT = "systems/dtd40k/templates/actor/illuminated";

/**
 * Character sheet, Illuminated layout (spec 021, US2): a codex page with an arched portrait, a drop-capped name,
 * bookmark ribbons as tabs, the p. 17 triptych and a skill index. Picked in the window's sheet menu.
 * Only the header, tabs and main parts change; actions and the other tabs come from CharacterSheet.
 */
export class IlluminatedSheet extends CharacterSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["layout-illuminated"],
    position: { width: 800, height: 900 }
  };

  /** @override */
  static PARTS = {
    ...CharacterSheet.PARTS,
    header: { template: `${ROOT}/header.hbs` },
    tabs: { template: `${ROOT}/tabs.hbs` },
    main: { template: `${ROOT}/main.hbs` }
  };
}
