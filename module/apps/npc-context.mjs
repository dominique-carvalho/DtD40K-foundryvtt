import { NPC_TRAITS } from "../config.mjs";
import { TRAIT_TEXT, fearRating } from "../rules/npc.mjs";

/**
 * Template data for the Antagonist tab and header of the NPC sheet (spec 012).
 */

const localize = (key) => game.i18n.localize(key);

/**
 * @param {Actor} actor
 */
export async function prepareNpcContext(actor) {
  const npc = actor.system.npc;
  return {
    category: localize(`DTD.Npc.Category.${npc.category}`),
    description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(npc.description, { relativeTo: actor, secrets: actor.isOwner }),
    traits: npc.traits.map((t) => ({
      label: localize(NPC_TRAITS[t.key].label), value: t.value, text: TRAIT_TEXT[t.key] ?? ""
    })),
    abilities: npc.abilities,
    feats: npc.feats.join(", "),
    gear: npc.gear.join(", "),
    armor: npc.armor.map((a) => `${a.name} (${a.ap} AP; ${a.locations.includes("all") ? localize("DTD.Npc.AllLocations") : a.locations.join(", ")})`).join(", "),
    alternate: npc.alternate,
    resource: npc.resource.type ? npc.resource : null,
    fear: fearRating(npc.traits),
    page: npc.source.page
  };
}
