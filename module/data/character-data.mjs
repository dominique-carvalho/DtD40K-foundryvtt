import {
  ADDICTION_LEVELS, CHARACTERISTICS, DERIVED_KEYS, INHERITANCE_SLOTS, MAGIC_SCHOOLS, MARTIAL_SCHOOLS, MAX_RATING, SKILLS, STARTING_XP, XP_KINDS
} from "../config.mjs";
import { spellSlots } from "../rules/magic.mjs";
import { adeptLevels } from "../rules/martial.mjs";
import { creationDots } from "../rules/backgrounds.mjs";
import { effectiveWealth } from "../rules/acquisition.mjs";
import { characterLevel } from "../rules/class.mjs";
import { computeDerived } from "../rules/derived.mjs";
import { armorProfile } from "../rules/equipment.mjs";
import { reactionsMax } from "../rules/defense.mjs";
import { woundState } from "../rules/healing.mjs";
import { computeExaltation } from "../rules/exaltation.mjs";
import { capValue } from "../rules/race.mjs";
import { ratingCaps } from "../rules/creation.mjs";
import { xpTotals } from "../rules/xp.mjs";

const { ArrayField, BooleanField, HTMLField, NumberField, ObjectField, SchemaField, StringField } = foundry.data.fields;

/**
 * Integer field helper.
 * @param {number} initial
 * @param {{min?: number, max?: number}} [range]
 */
const integer = (initial, { min, max } = {}) =>
  new NumberField({ required: true, nullable: false, integer: true, initial, min, max });

/** List of free-text specialties (items must not be blank). */
const specialties = () => new ArrayField(new StringField({ required: true, blank: false, trim: true }));

/**
 * Data model for the `character` Actor subtype.
 * Schema: specs/001-system-foundation/data-model.md.
 */
export class CharacterData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    const characteristics = Object.fromEntries(
      Object.keys(CHARACTERISTICS).map((key) => [
        key,
        new SchemaField({ value: integer(1, { min: 0, max: 6 }), specialties: specialties() })
      ])
    );

    const skills = Object.fromEntries(
      Object.keys(SKILLS).map((key) => [
        key,
        new SchemaField({ value: integer(0, { min: 0, max: 6 }), specialties: specialties() })
      ])
    );

    const derivedMods = Object.fromEntries(
      DERIVED_KEYS.map((key) => [
        key,
        new SchemaField({
          bonus: integer(0),
          override: new NumberField({ required: true, nullable: true, integer: true, initial: null })
        })
      ])
    );

    return {
      characteristics: new SchemaField(characteristics),
      skills: new SchemaField(skills),
      size: integer(4, { min: 1, max: 10 }),
      level: integer(1, { min: 1, max: 10 }),
      hp: new SchemaField({ value: integer(0, { min: 0 }) }),
      // drainedScene: Resolve lost to social attacks this scene (spec 008, p. 446).
      resolve: new SchemaField({ value: integer(0, { min: 0 }), drainedScene: integer(0, { min: 0 }) }),
      // Accumulated Critical Damage (spec 008, p. 437).
      critical: new SchemaField({ value: integer(0, { min: 0 }) }),
      insanity: new SchemaField({
        value: integer(0, { min: 0, max: 100 }),
        derangements: new ArrayField(new SchemaField({
          name: new StringField({ required: true, blank: false, trim: true }),
          severity: new StringField({ required: true, choices: ["minor", "severe", "acute"], initial: "minor" })
        }))
      }),
      fatigue: new SchemaField({ value: integer(0, { min: 0 }) }),
      heroPoints: new SchemaField({
        value: integer(2, { min: 0 }),
        max: integer(2, { min: 0 })
      }),
      devotion: new SchemaField({ value: integer(6, { min: 0, max: 10 }) }),
      // Backgrounds (spec 011, research R2): Wealth stays in system.wealth.value (spec 007).
      backgrounds: new SchemaField({
        ...Object.fromEntries(["allies", "contacts", "fame", "followers", "holdings", "inheritance", "mentor", "status"]
          .map((key) => [key, new SchemaField({ value: integer(0, { min: 0, max: 5 }) })])),
        artifacts: new ArrayField(new SchemaField({
          id: new StringField({ required: true, blank: false }),
          name: new StringField({ required: true, blank: false, trim: true }),
          value: integer(1, { min: 1, max: 5 })
        })),
        backings: new ArrayField(new SchemaField({
          id: new StringField({ required: true, blank: false }),
          name: new StringField({ required: true, blank: false, trim: true }),
          value: integer(1, { min: 1, max: 5 })
        })),
        // Inheritance choices: extra starting items by rarity (p. 282).
        inheritancePicks: new SchemaField(Object.fromEntries(Object.keys(INHERITANCE_SLOTS).map((key) => [key, integer(0, { min: 0 })])))
      }),
      // Alignment (spec 011, research R5/R6): the embedded deity is the god; changes made; Degenerations by Devotion point.
      alignment: new SchemaField({
        changes: integer(0, { min: 0 }),
        degenerations: new ArrayField(new SchemaField({
          id: new StringField({ required: true, blank: false }),
          point: integer(0, { min: 0, max: 10 }),
          name: new StringField({ required: true, blank: false }),
          row: integer(0, { min: 0 }),
          // Characteristic lowered by it: no XP purchase while it lasts (p. 285).
          characteristic: new StringField({ required: true, blank: true }),
          effectIds: new ArrayField(new StringField({ required: true, blank: false })),
          itemIds: new ArrayField(new StringField({ required: true, blank: false })),
          derangement: new StringField({ required: true, blank: true })
        }))
      }),
      derivedMods: new SchemaField(derivedMods),
      // Targets of racial power effects only — never rendered as sheet inputs (spec 002, research R3/R4).
      modifiers: new SchemaField({
        staticDefenseFormula: new StringField({ required: true, choices: ["standard", "shifty"], initial: "standard" }),
        resilience: integer(0),
        // Targets of exaltation and Exalted Asset effects only (spec 004, research R6).
        hpMax: integer(0),
        staticDefenseSize: new BooleanField({ initial: true }),
        exaltation: new SchemaField({
          resourceBonus: integer(0),
          resourcePerPowerStat: integer(0)
        }),
        // Targets of feat effects only — never sheet inputs (spec 005, research R4).
        resolveMax: integer(0),
        mentalDefense: integer(0),
        staticDefense: integer(0),
        staticDefenseCharacteristic: new StringField({ required: true, choices: ["dex", "con"], initial: "dex" }),
        fatigueMax: integer(0),
        initiative: integer(0),
        // Alignment Check bonus from feats and assets (spec 011, p. 284).
        alignmentCheck: integer(0),
        // Targets of condition and combat-action effects only (spec 008, research R3/R5).
        combat: new SchemaField({
          sd: integer(0),
          reactions: integer(0),
          mentalDefense: integer(0),
          // Aura against spell damage: from templates, feats and spells only (p. 436).
          aura: integer(0)
        }),
        // Targets of magic effects only (spec 009): caster level (drugs), Focus Power TN and dice.
        magic: new SchemaField({
          casterLevel: integer(0),
          tn: integer(0),
          rolled: integer(0),
          kept: integer(0)
        }),
        // Targets of equipment effects only (spec 007, research R3/R8).
        armor: new SchemaField({ apAll: integer(0), gizzards: integer(0) }),
        rolls: new SchemaField({
          all: new SchemaField({ rolled: integer(0), kept: integer(0) }),
          noExplode: new BooleanField({ initial: false }),
          skills: new SchemaField(Object.fromEntries(Object.keys(SKILLS).map((key) => [key, new SchemaField({
            rolled: integer(0), kept: integer(0), freeRaises: integer(0)
          })])))
        })
      }),
      // Magic (spec 009, research R2/R6): school ranks, learned combos and sustained spells.
      magic: new SchemaField({
        schools: new SchemaField(Object.fromEntries(Object.keys(MAGIC_SCHOOLS).map((key) => [key, new SchemaField({
          value: integer(0, { min: 0, max: 6 })
        })]))),
        combos: new ArrayField(new SchemaField({
          id: new StringField({ required: true, blank: false }),
          name: new StringField({ required: true, blank: false, trim: true }),
          spells: new ArrayField(new StringField({ required: true, blank: false }))
        })),
        sustained: new ArrayField(new SchemaField({
          id: new StringField({ required: true, blank: false }),
          name: new StringField({ required: true, blank: true }),
          spellId: new StringField({ required: true, blank: true }),
          action: new StringField({ required: true, choices: ["half", "reaction"], initial: "half" }),
          effects: new ArrayField(new StringField({ required: true, blank: false }))
        }))
      }),
      // Sword Schools and Gun Kata (spec 010, research R2/R4/R6): ranks, Special Attacks and Trick Shots.
      martial: new SchemaField({
        schools: new SchemaField(Object.fromEntries(Object.keys(MARTIAL_SCHOOLS).map((key) => [key, new SchemaField({
          value: integer(0, { min: 0, max: 6 })
        })]))),
        attacks: new ArrayField(new SchemaField({
          id: new StringField({ required: true, blank: false }),
          name: new StringField({ required: true, blank: false, trim: true }),
          kind: new StringField({ required: true, choices: ["special", "trick"], initial: "special" }),
          action: new StringField({ required: true, blank: false, initial: "standardAttack" }),
          advantages: new ArrayField(new SchemaField({
            ref: new StringField({ required: true, blank: false }),
            count: integer(1, { min: 1 }),
            choice: integer(0, { min: 0 })
          })),
          restrictions: new ArrayField(new SchemaField({
            ref: new StringField({ required: true, blank: false }),
            count: integer(1, { min: 1 })
          })),
          // Style points of Advantages already paid for (edits pay only the points added).
          paid: integer(0, { min: 0 }),
          // Earlier definitions, restored when an edit is undone in the XP log.
          history: new ArrayField(new ObjectField()),
          state: new SchemaField({
            lastRound: integer(0, { min: 0 }),
            lastCombat: new StringField({ required: true, blank: true }),
            usedScene: new BooleanField({ initial: false }),
            // Prepared by Aim, Feint, Ready or Aid Another: the next attack gets the Advantages until this round.
            readyUntil: integer(0, { min: 0 })
          })
        }))
      }),
      // Acquisition (spec 007, research R9): Wealth, windfalls and the active Wealth Strain penalty.
      wealth: new SchemaField({
        value: integer(0, { min: 0, max: 5 }),
        liquid: integer(0, { min: 0 }),
        strain: integer(0, { min: 0 }),
        attempts: new ArrayField(new SchemaField({
          key: new StringField({ required: true, blank: false }),
          count: integer(0, { min: 0 })
        }))
      }),
      // Starting equipment picks are counted while the character is being created (p. 16).
      creation: new SchemaField({ active: new BooleanField({ initial: true }) }),
      addictions: new ArrayField(new SchemaField({
        name: new StringField({ required: true, blank: false, trim: true }),
        level: integer(0, { min: 0, max: ADDICTION_LEVELS.length - 1 })
      })),
      // Experience: starting XP and the ledger of purchases and awards (spec 006, research R6).
      xp: new SchemaField({
        starting: integer(STARTING_XP, { min: 0 }),
        log: new ArrayField(new SchemaField({
          id: new StringField({ required: true, blank: false }),
          type: new StringField({ required: true, choices: ["purchase", "award"], initial: "purchase" }),
          kind: new StringField({ required: true, blank: true, initial: "", choices: ["", ...XP_KINDS] }),
          key: new StringField({ required: true, blank: true }),
          label: new StringField({ required: true, blank: true }),
          from: integer(0),
          to: integer(0),
          cost: integer(0),
          itemId: new StringField({ required: true, blank: true }),
          reason: new StringField({ required: true, blank: true }),
          user: new StringField({ required: true, blank: true }),
          date: integer(0)
        }))
      }),
      biography: new HTMLField({ required: true, blank: true })
    };
  }

  /**
   * Derived values are recomputed on every data preparation and never persisted.
   * @override
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.#prepareClasses();
    this.#capRatings();
    this.#prepareEquipment();
    const derived = computeDerived(this, this.derivedMods, {
      ...this.modifiers, armorPenalty: this.armor.sdPenalty, maxDex: this.armor.maxDex,
      staticDefense: this.modifiers.staticDefense + this.modifiers.combat.sd,
      mentalDefense: this.modifiers.mentalDefense + this.modifiers.combat.mentalDefense
    });
    this.derived = {
      staticDefense: derived.staticDefense,
      mentalDefense: derived.mentalDefense,
      speed: derived.speed,
      resilience: derived.resilience
    };
    this.hp.max = derived.hpMax;
    this.resolve.max = derived.resolveMax;
    this.fatigue.max = derived.fatigueMax;
    this.#prepareExaltation();
    this.#prepareCombat();
    this.#prepareMagic();
    // Martial Adept and Gunslinger Level: the highest Sword School and Gun Kata (pp. 260, 272).
    // Backgrounds dots at creation and alignment state (spec 011).
    this.backgrounds.dots = creationDots({ backgrounds: this.backgrounds, wealth: this.wealth.value });
    this.alignment.outOfPlay = this.devotion.value <= 0;
    this.alignment.blocked = [...new Set(this.alignment.degenerations.map((d) => d.characteristic).filter(Boolean))];
    this.martial.levels = adeptLevels(Object.fromEntries(Object.entries(this.martial.schools).map(([key, s]) => [key, s.value])));
  }

  /**
   * Level from the classes taken (p. 106), class state and XP totals (spec 006, research R2/R6).
   * Runs first, so everything that reads the Level uses the derived value. Never persisted.
   */
  #prepareClasses() {
    const items = this.parent?.items ?? [];
    const classes = items.filter((item) => item.type === "class").sort((a, b) => a.system.startedAt - b.system.startedAt);
    this.level = characterLevel(classes, this.level);
    const current = classes.find((item) => item.system.status === "current");
    this.classState = {
      hasClasses: classes.length > 0,
      current: current?.id ?? null,
      freeStudy: classes.length > 0 && !current,
      completed: classes.filter((item) => item.system.status === "completed").map((item) => item.id)
    };
    const hindranceXp = items
      .filter((item) => item.type === "feat" && item.system.category === "hindrance")
      .reduce((sum, item) => sum + (item.system.xpGranted ?? 0), 0);
    this.xp.totals = xpTotals({ starting: this.xp.starting, log: this.xp.log, hindranceXp });
  }

  /**
   * Worn armor, addictions and Wealth (spec 007, research R3/R9/R10). Never persisted.
   * Armor Proficiency feats give the armor types (their sub-category); bionic limbs count as armor at
   * their location; the worst addiction adds its penalty to every roll.
   */
  #prepareEquipment() {
    const items = this.parent?.items ?? [];
    const equipped = (type) => items.filter((item) => item.type === type && item.system.equipped);
    const feats = items.filter((item) => item.type === "feat");
    const locations = {};
    for (const item of equipped("gear")) {
      if (item.system.category === "cybernetic" && item.system.location) locations[item.system.location] = 2;
    }
    this.armor = armorProfile({
      armors: equipped("armor").map((item) => ({ name: item.name, ...item.system })),
      proficiencies: feats.filter((item) => item.name.startsWith("Armor Proficiency"))
        .map((item) => item.system.selection?.subcategory?.toLowerCase()).filter(Boolean),
      squat: feats.some((item) => item.name === "Squat Armor Proficiency"),
      bonuses: { ...this.modifiers.armor, locations }
    });

    const worst = Math.max(0, ...this.addictions.map((entry) => entry.level));
    const rolls = this.modifiers.rolls;
    // Minor −1k0; Moderate also stops dice exploding; Major −2k2 in total (p. 341).
    if (worst === 1 || worst === 2) rolls.all.rolled -= 1;
    if (worst >= 2) rolls.noExplode = true;
    if (worst === 3) {
      rolls.all.rolled -= 2;
      rolls.all.kept -= 2;
    }
    this.addictionLevel = worst;
    // Any Fatigue at all: −1k0 to every Test (p. 443).
    if (this.fatigue.value > 0) rolls.all.rolled -= 1;
    this.wealth.effective = effectiveWealth(this.wealth);
  }

  /**
   * Magic state (spec 009, research R2/R3/R7): caster level (the character Level, which the book never defines
   * otherwise), Sanctioned (the Tested feat), an equipped Implement and the spell slots. Never persisted.
   */
  #prepareMagic() {
    const items = this.parent?.items ?? [];
    const schools = Object.fromEntries(Object.entries(this.magic.schools).map(([key, s]) => [key, s.value]));
    const extra = {};
    for (const feat of items.filter((item) => item.type === "feat" && item.name.startsWith("Spell Book"))) {
      const key = feat.system.selection?.subcategory?.toLowerCase();
      if (key in MAGIC_SCHOOLS) extra[key] = (extra[key] ?? 0) + 1;
    }
    this.magic.state = {
      casterLevel: Math.max(1, this.level + this.modifiers.magic.casterLevel),
      sanctioned: items.some((item) => item.type === "feat" && item.name === "Tested"),
      hasImplement: items.some((item) => item.type === "gear" && item.name === "Implement" && item.system.equipped),
      slots: spellSlots({ schools, spells: items.filter((item) => item.type === "spell").map((item) => item.system), extra }),
      extra
    };
  }

  /**
   * Combat state (spec 008, research R3/R5/R8): reactions per round and wound state. Never persisted.
   */
  #prepareCombat() {
    const statuses = this.parent?.statuses ?? new Set();
    this.combat = {
      reactionsMax: reactionsMax(statuses, this.modifiers.combat.reactions),
      woundState: woundState({ hpLost: Math.max(0, this.hp.max - this.hp.value), wil: this.characteristics.wil.value, critical: this.critical.value })
    };
  }

  /**
   * State of the exaltation, computed after the derived values because the Wraith reads the
   * maximum Resolve (spec 004, research R2). Never persisted.
   */
  #prepareExaltation() {
    const item = this.parent?.items.find((entry) => entry.type === "exaltation");
    if (!item) {
      this.exaltation = null;
      return;
    }
    const combat = game.combat;
    const currentMarker = combat?.started ? `${combat.id}:${combat.round}` : "none";
    this.exaltation = computeExaltation(
      item.system,
      { characteristics: this.characteristics, level: this.level, devotion: this.devotion.value, resolveMax: this.resolve.max },
      this.modifiers.exaltation,
      { currentMarker }
    );
  }

  /**
   * Racial Active Effects are added without schema bounds (research R2), so cap every characteristic and skill at
   * the character's highest rating before deriving anything (spec 002, FR-015): during creation 5, or 6 with an
   * exception (spec 016, research R4/R5); afterwards 6 as before, so characters in play never lose dots (new raises
   * are checked by canReach).
   * `capped` records which ratings lost part of a bonus, for the sheet.
   */
  #capRatings() {
    const items = this.parent?.items ?? [];
    const exaltation = items.find((item) => item.type === "exaltation");
    this.ratingCaps = ratingCaps({
      exaltation: exaltation ? { name: exaltation.name, powerStat: exaltation.system.powerStat.value } : null,
      feats: items.filter((item) => item.type === "feat").map((item) => item.name)
    });
    const source = this.parent?._source?.system;
    this.capped = {};
    for (const [group, kind] of [["characteristics", "characteristic"], ["skills", "skill"]]) {
      for (const [key, data] of Object.entries(this[group])) {
        const max = this.creation.active ? Math.max(this.ratingCaps[kind].max, source?.[group]?.[key]?.value ?? 0) : MAX_RATING;
        const { value, capped } = capValue(data.value, max);
        data.value = value;
        if (capped) this.capped[`${group}.${key}`] = true;
      }
    }
  }
}
