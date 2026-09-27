import { CharacterSheet } from "./character-sheet.mjs";
import { prepareNpcContext } from "./npc-context.mjs";
import { fearCard } from "../documents/npc-service.mjs";

const TEMPLATE_ROOT = "systems/dtd40k/templates/actor/parts";
const NPC_TABS = ["main", "combat", "magic", "npc"];

/**
 * NPC sheet (spec 012, research R1): the character sheet with the stat block of the book — characteristics and
 * skills, the combat tab (actions, weapons, conditions), magic for Casters and the Antagonist tab (traits,
 * abilities, feats, gear). Class, race, exaltation, XP and martial schools are for characters only.
 */
export class NpcSheet extends CharacterSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["npc"],
    actions: {
      npcFear: NpcSheet.#onFear
    }
  };

  /** @override */
  static TABS = {
    primary: {
      tabs: NPC_TABS.map((id) => ({ id })),
      initial: "main",
      labelPrefix: "DTD.Sheet.Tab"
    }
  };

  /** @override */
  static PARTS = {
    header: { template: `${TEMPLATE_ROOT}/npc-header.hbs` },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    main: { template: `${TEMPLATE_ROOT}/main.hbs` },
    combat: { template: `${TEMPLATE_ROOT}/combat.hbs` },
    magic: { template: `${TEMPLATE_ROOT}/magic.hbs` },
    npc: { template: `${TEMPLATE_ROOT}/npc.hbs` },
    footer: { template: `${TEMPLATE_ROOT}/footer.hbs` }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.npcTab = await prepareNpcContext(this.document);
    // NPCs have no Advance mode: the book values are edited directly.
    context.isAdvance = false;
    return context;
  }

  /**
   * Post the Fear Test card for the heroes (spec 012, FR-004).
   * @this {NpcSheet}
   */
  static async #onFear() {
    if (game.user.isGM) await fearCard(this.document);
  }
}
