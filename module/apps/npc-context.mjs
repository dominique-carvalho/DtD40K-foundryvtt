import { ABILITY_KINDS, CHARACTERISTICS, NPC_TRAITS, SKILLS, STATUS_EFFECTS } from "../config.mjs";
import { TRAIT_TEXT, fearRating } from "../rules/npc.mjs";
import { abilityActive } from "../rules/npc-traits.mjs";

/**
 * Template data for the Antagonist tab and header of the NPC sheet (spec 012), with the abilities, forms and Resource
 * Stat of spec 022. Editors read the stored data (the active form is laid over the derived one).
 */

const localize = (key) => game.i18n.localize(key);
const options = (list, labelOf) => list.map((key) => ({ key, label: labelOf(key) }));

/**
 * @param {Actor} actor
 * @param {{isEdit?: boolean}} [mode]
 */
export async function prepareNpcContext(actor, { isEdit = false } = {}) {
  const npc = actor.system.npc;
  const source = actor._source.system.npc;
  const usable = (a) => a.kind === "area" || a.kind === "aura" || a.kind === "spell";
  return {
    category: localize(`DTD.Npc.Category.${npc.category}`),
    description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(npc.description, { relativeTo: actor, secrets: actor.isOwner }),
    traits: npc.traits.map((t) => ({
      label: localize(NPC_TRAITS[t.key].label), value: t.value, text: TRAIT_TEXT[t.key] ?? ""
    })),
    abilities: npc.abilities.map((a, index) => ({
      ...a, index, usable: usable(a), active: abilityActive(npc, a),
      kindLabel: a.kind === "text" ? "" : localize(`DTD.Npc.AbilityKind.${a.kind}`),
      uses: a.uses.max ? `${a.uses.max - a.uses.value}/${a.uses.max}` : ""
    })),
    forms: npc.forms.map((f) => ({ id: f.id, name: f.name, variant: f.kind === "variant", active: f.id === npc.activeForm, cost: f.cost })),
    activeForm: npc.forms.find((f) => f.id === npc.activeForm)?.name ?? "",
    formRounds: npc.formRounds,
    feats: npc.feats.join(", "),
    gear: npc.gear.join(", "),
    armor: npc.armor.map((a) => `${a.name} (${a.ap} AP; ${a.locations.includes("all") ? localize("DTD.Npc.AllLocations") : a.locations.join(", ")})`).join(", "),
    alternate: npc.alternate,
    resource: npc.resource.type ? npc.resource : null,
    fear: fearRating(npc.traits),
    page: npc.source.page,
    edit: isEdit ? {
      traits: source.traits.map((t, index) => ({ ...t, index })),
      abilities: source.abilities.map((a, index) => ({ ...a, index, structured: a.kind !== "text" })),
      feats: source.feats.join(", "),
      forms: source.forms.map((f, index) => ({
        ...f, index,
        characteristicRows: Object.keys(CHARACTERISTICS).map((key) => ({ key, label: localize(CHARACTERISTICS[key].abbr), value: f.characteristics[key] ?? "" })),
        traitsText: f.traits.map((t) => (t.value ? `${t.key}=${t.value}` : t.key)).join("; "),
        armorAp: f.armor[0]?.ap ?? "",
        abilitiesText: f.abilities.join(", ")
      })),
      traitKeys: options(Object.keys(NPC_TRAITS), (key) => localize(NPC_TRAITS[key].label)),
      kinds: options(ABILITY_KINDS, (key) => localize(`DTD.Npc.AbilityKind.${key}`)),
      actions: options(["", "free", "half", "full"], (key) => (key ? localize(`DTD.Npc.Action.${key}`) : "—")),
      shapes: options(["", "cone", "blast", "line"], (key) => (key ? localize(`DTD.Npc.Shape.${key}`) : "—")),
      triggers: options(["", "assault", "turnStart"], (key) => (key ? localize(`DTD.Npc.Trigger.${key}`) : "—")),
      saves: [{ key: "", label: "—" }, { key: "fear", label: localize("DTD.Npc.Fear") }, ...options(Object.keys(CHARACTERISTICS), (key) => localize(CHARACTERISTICS[key].label))],
      skills: [{ key: "", label: "—" }, ...options(Object.keys(SKILLS), (key) => localize(SKILLS[key].label))],
      conditions: [{ key: "", label: "—" }, ...STATUS_EFFECTS.map((s) => ({ key: s.id, label: localize(s.name) }))],
      formKinds: options(["shift", "variant"], (key) => localize(`DTD.Npc.FormKind.${key}`))
    } : null
  };
}
