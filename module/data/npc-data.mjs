import { CHARACTERISTICS, NPC_CATEGORIES, NPC_TRAITS, SKILLS } from "../config.mjs";
import { ARMOR_LOCATIONS } from "../rules/equipment.mjs";
import { traitArmor, traitAura } from "../rules/npc.mjs";
import { CharacterData } from "./character-data.mjs";

const { ArrayField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

const text = () => new StringField({ required: true, blank: true });
const int = (initial = 0, { min, max } = {}) => new NumberField({ required: true, nullable: false, integer: true, initial, min, max });
const specialties = () => new ArrayField(new StringField({ required: true, blank: false, trim: true }));
// Monsters go beyond the character limits (Dragon Size 12, characteristics up to 8, p. 532).
const rating = (initial) => new SchemaField({ value: int(initial, { min: 0, max: 20 }), specialties: specialties() });

/**
 * Data model for the `npc` Actor subtype (spec 012, research R1): the character model plus the stat block of the
 * book. The printed Static Defense, Mental Defense, HP, Resilience and Speed are stored as overrides of the derived
 * values (they already include feats, traits and armor); armor and traits of the block add to the armor and Aura.
 * Schema: specs/012-npcs-minions/data-model.md.
 */
export class NpcData extends CharacterData {
  /** @override */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      characteristics: new SchemaField(Object.fromEntries(Object.keys(CHARACTERISTICS).map((key) => [key, rating(2)]))),
      skills: new SchemaField(Object.fromEntries(Object.keys(SKILLS).map((key) => [key, rating(0)]))),
      size: int(4, { min: 1, max: 20 }),
      npc: new SchemaField({
        category: new StringField({ required: true, choices: NPC_CATEGORIES, initial: "people" }),
        description: new HTMLField({ required: true, blank: true }),
        traits: new ArrayField(new SchemaField({
          key: new StringField({ required: true, choices: Object.keys(NPC_TRAITS) }),
          value: text()
        })),
        abilities: new ArrayField(new SchemaField({
          name: new StringField({ required: true, blank: false }),
          effect: text()
        })),
        feats: new ArrayField(new StringField({ required: true, blank: false })),
        gear: new ArrayField(new StringField({ required: true, blank: false })),
        armor: new ArrayField(new SchemaField({
          name: new StringField({ required: true, blank: false }),
          ap: int(0, { min: 0 }),
          locations: new ArrayField(new StringField({ required: true, choices: ["all", ...ARMOR_LOCATIONS] }))
        })),
        // Alternate form of the block (Zoanoid war forms "5[7]").
        alternate: text(),
        resource: new SchemaField({ type: text(), value: int(0, { min: 0 }), max: int(0, { min: 0 }) }),
        source: new SchemaField({
          book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
          page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
        })
      })
    };
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    const npc = this.npc;
    // Armor of the block; the book prints natural armor (Armor Plating, Machine, Daemonic) on the Armor line too, so
    // the traits give armor only to NPCs without an Armor line (built by the GM).
    const natural = npc.armor.length ? 0 : traitArmor(npc.traits, this.characteristics.con.value);
    for (const loc of ARMOR_LOCATIONS) {
      const worn = Math.max(0, ...npc.armor.filter((a) => a.locations.includes("all") || a.locations.includes(loc)).map((a) => a.ap));
      this.armor.locations[loc] += worn + natural;
    }
    this.modifiers.combat.aura += traitAura(npc.traits);
    // Caster: always sanctioned (p. 521).
    if (npc.traits.some((t) => t.key === "caster")) this.magic.state.sanctioned = true;
  }
}
