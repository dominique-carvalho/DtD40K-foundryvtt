import { ABILITY_KINDS, CHARACTERISTICS, NPC_CATEGORIES, NPC_TRAITS, SKILLS } from "../config.mjs";
import { ARMOR_LOCATIONS } from "../rules/equipment.mjs";
import { traitArmor, traitAura } from "../rules/npc.mjs";
import { applyForm, npcSpeeds } from "../rules/npc-traits.mjs";
import { CharacterData } from "./character-data.mjs";

const { ArrayField, HTMLField, NumberField, SchemaField, StringField } = foundry.data.fields;

const text = () => new StringField({ required: true, blank: true });
const int = (initial = 0, { min, max } = {}) => new NumberField({ required: true, nullable: false, integer: true, initial, min, max });
const specialties = () => new ArrayField(new StringField({ required: true, blank: false, trim: true }));
// Monsters go beyond the character limits (Dragon Size 12, characteristics up to 8, p. 532).
const rating = (initial) => new SchemaField({ value: int(initial, { min: 0, max: 20 }), specialties: specialties() });
const nullableInt = () => new NumberField({ required: true, nullable: true, integer: true, initial: null });
const choice = (choices, initial) => new StringField({ required: true, blank: true, choices, initial });
const traitList = () => new ArrayField(new SchemaField({
  key: new StringField({ required: true, choices: Object.keys(NPC_TRAITS) }),
  value: text()
}));
const armorList = () => new ArrayField(new SchemaField({
  name: new StringField({ required: true, blank: false }),
  ap: int(0, { min: 0 }),
  locations: new ArrayField(new StringField({ required: true, choices: ["all", ...ARMOR_LOCATIONS] }))
}));
const ACTIONS = ["", "free", "half", "full"];
const damage = () => new SchemaField({ rolled: int(0, { min: 0 }), kept: int(0, { min: 0 }), type: text(), pen: int(0, { min: 0 }) });

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
        traits: traitList(),
        // Special abilities (spec 022, data-model): text, or structured area/aura/onHit/spell attacks.
        abilities: new ArrayField(new SchemaField({
          name: new StringField({ required: true, blank: false }),
          effect: text(),
          kind: new StringField({ required: true, choices: ABILITY_KINDS, initial: "text" }),
          action: choice(ACTIONS, ""),
          area: new SchemaField({ shape: choice(["", "cone", "blast", "line"], ""), size: int(0, { min: 0 }) }),
          // assault: a Charge or an All Out Attack (Frightful Presence); turnStart: the NPC's turn begins.
          trigger: choice(["", "assault", "turnStart"], ""),
          save: new SchemaField({ characteristic: text(), skill: text(), tn: int(0, { min: 0 }) }),
          onFail: new SchemaField({ condition: text(), rounds: int(0, { min: 0 }), fatigue: int(0, { min: 0 }), damage: damage() }),
          weapon: text(),
          extraCritical: int(0, { min: 0 }),
          spell: new SchemaField({ name: text(), characteristic: text(), skill: text() }),
          uses: new SchemaField({ max: int(0, { min: 0 }), value: int(0, { min: 0 }) })
        })),
        feats: new ArrayField(new StringField({ required: true, blank: false })),
        gear: new ArrayField(new StringField({ required: true, blank: false })),
        armor: armorList(),
        // Alternate form of the block (Zoanoid war forms "5[7]").
        alternate: text(),
        // Alternate forms (spec 022, research R11): shifts (Zoanoid Warform) and variants (Elemental composition).
        forms: new ArrayField(new SchemaField({
          id: new StringField({ required: true, blank: false }),
          name: new StringField({ required: true, blank: false }),
          kind: new StringField({ required: true, choices: ["shift", "variant"], initial: "shift" }),
          cost: int(0, { min: 0 }),
          action: choice(ACTIONS, "full"),
          duration: int(0, { min: 0 }),
          characteristics: new SchemaField(Object.fromEntries(Object.keys(CHARACTERISTICS).map((key) => [key, nullableInt()]))),
          size: nullableInt(),
          derived: new SchemaField({ staticDefense: nullableInt(), hpMax: nullableInt(), speed: nullableInt(), resilience: nullableInt() }),
          armor: armorList(),
          traits: traitList(),
          abilities: new ArrayField(new StringField({ required: true, blank: false }))
        })),
        activeForm: text(),
        formRounds: int(0, { min: 0 }),
        resource: new SchemaField({ type: text(), value: int(0, { min: 0 }), max: int(0, { min: 0 }) }),
        source: new SchemaField({
          book: new StringField({ required: true, blank: true, initial: "DtD 7.7a" }),
          page: new NumberField({ required: true, nullable: true, integer: true, initial: null, min: 1 })
        })
      })
    };
  }

  /**
   * The active form is laid over the stored values before anything is derived (spec 022, research R11): characteristics,
   * size, the printed derived values, armor and traits. Never persisted.
   * @override
   */
  prepareBaseData() {
    super.prepareBaseData();
    const npc = this.npc;
    const form = npc.forms.find((f) => f.id === npc.activeForm) ?? null;
    this.activeForm = form;
    if (!form) return;
    const characteristics = Object.fromEntries(Object.entries(form.characteristics).filter(([, v]) => v !== null));
    const out = applyForm({
      base: {
        characteristics: {}, size: this.size, armor: npc.armor, traits: npc.traits,
        derived: { staticDefense: null, hpMax: null, speed: null, resilience: null }
      },
      form: { ...form, characteristics }
    });
    for (const [key, value] of Object.entries(out.characteristics)) this.characteristics[key].value = value;
    this.size = out.size;
    for (const [key, value] of Object.entries(out.derived)) if (value !== null) this.derivedMods[key].override = value;
    npc.armor = out.armor;
    npc.traits = out.traits;
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
    // Speeds per movement action (spec 022, research R1/R2): printed speeds already include Quadruped and Crawler.
    this.speeds = npcSpeeds({ speed: this.derived.speed, fixed: this.derivedMods.speed.override !== null, traits: npc.traits });
    this.derived.speed = this.speeds.walk;
    const has = (key) => npc.traits.some((t) => t.key === key);
    this.traitFlags = {
      flyer: has("flyer"), darkSight: has("darkSight"), phasing: has("phasing"), crawler: has("crawler"),
      autoStabilized: has("autoStabilized"), amphibious: has("amphibious")
    };
  }
}
