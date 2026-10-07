import { CHARACTERISTICS, CREATION, MAGIC_SCHOOLS, MARTIAL_SCHOOLS, PANTHEONS, RARITIES, SKILLS, STARTING_SLOTS } from "../config.mjs";
import {
  BUILDER_STEPS, availableClasses, equipmentSlots, inheritanceItems, previewCharacter, pricePurchases, validateBackgrounds, validateConcept,
  validateExaltation, validateFeats, validateRace, validateRatings, validateSpecialties, xpBalance
} from "../rules/builder.mjs";
import { characteristicOptions } from "../rules/race.mjs";
import { statuesqueOptions } from "../rules/exaltation.mjs";
import { SINGLE_BACKGROUNDS } from "../rules/backgrounds.mjs";
import { languagesHint } from "../rules/creation.mjs";
import { classFacts, exaltationFacts, featFacts, firstParagraph, itemNumbers, raceFacts, shortLine } from "../rules/descriptions.mjs";
import { blankDraft, finish, loadDraft, saveDraft } from "../documents/builder-service.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const ROOT = "systems/dtd40k/templates/apps/builder";
const ARTIFACT_CATEGORIES = ["material", "wonder", "hearthstone"];
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);

/**
 * Character builder (spec 023): a wizard in the book's order that edits a draft and creates the character at the end.
 * Steps are validated by rules/builder.mjs; a blocked step shows why and the GM may release it (constitution IV).
 * Contract: specs/023-character-builder/contracts/foundry-api.md.
 */
export class CharacterBuilder extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    id: "dtd40k-character-builder",
    classes: ["dtd40k", "character-builder"],
    tag: "form",
    window: { title: "DTD.Builder.Title", icon: "fa-solid fa-user-plus", resizable: true },
    position: { width: 980, height: 760 },
    form: { submitOnChange: false, closeOnSubmit: false },
    actions: {
      goto: CharacterBuilder.#onGoto,
      back: CharacterBuilder.#onBack,
      next: CharacterBuilder.#onNext,
      release: CharacterBuilder.#onRelease,
      finish: CharacterBuilder.#onFinish,
      pick: CharacterBuilder.#onPick,
      toggle: CharacterBuilder.#onToggle,
      addPurchase: CharacterBuilder.#onAddPurchase,
      removePurchase: CharacterBuilder.#onRemovePurchase,
      addArtifact: CharacterBuilder.#onAddArtifact,
      removeArtifact: CharacterBuilder.#onRemoveArtifact,
      addBacking: CharacterBuilder.#onAddBacking,
      removeBacking: CharacterBuilder.#onRemoveBacking,
      addInheritance: CharacterBuilder.#onAddInheritance,
      removeInheritance: CharacterBuilder.#onRemoveInheritance
    }
  };

  /** @override */
  static PARTS = {
    steps: { template: `${ROOT}/steps.hbs` },
    step: { template: `${ROOT}/step.hbs`, scrollable: [""] },
    summary: { template: `${ROOT}/summary.hbs`, scrollable: [""] },
    footer: { template: `${ROOT}/footer.hbs` }
  };

  /** Open the builder, offering to continue a saved draft. */
  static async open() {
    const saved = loadDraft();
    let draft = blankDraft();
    if (saved) {
      const resume = await foundry.applications.api.DialogV2.wait({
        window: { title: localize("DTD.Builder.Title") },
        content: `<p>${format("DTD.Builder.Resume", { name: saved.concept.name || "—", step: localize(`DTD.Builder.Step.${saved.step}`) })}</p>`,
        buttons: [
          { action: "continue", label: localize("DTD.Builder.Continue"), default: true },
          { action: "restart", label: localize("DTD.Builder.Restart") }
        ],
        rejectClose: false
      });
      if (!resume) return null;
      if (resume === "continue") draft = saved;
    }
    return new CharacterBuilder({ draft }).render(true);
  }

  constructor(options = {}) {
    super(options);
    this.draft = options.draft ?? blankDraft();
    this.data = null;
    this.blocked = [];
  }

  /** Compendium documents used by the steps, loaded once (research R4). */
  async #load() {
    if (this.data) return;
    const docs = async (pack, filter = () => true) => (await game.packs.get(`dtd40k.${pack}`)?.getDocuments() ?? []).filter(filter);
    const feats = await docs("feats");
    const equipment = await docs("equipment");
    this.data = {
      races: await docs("races"),
      exaltations: await docs("exaltations"),
      classes: await docs("classes"),
      hindrances: feats.filter((f) => f.system.category === "hindrance"),
      assets: feats.filter((f) => f.system.category === "asset"),
      feats: feats.filter((f) => f.system.category === "feat" || f.system.category === "racialFeat"),
      exaltedAssets: await docs("exalted-assets"),
      deities: await docs("deities"),
      equipment: equipment.filter((i) => ["weapon", "armor", "gear"].includes(i.type))
    };
    this.docs = Object.fromEntries(Object.values(this.data).flat().map((doc) => [doc.uuid, doc]));
  }

  /** Document of the draft by UUID. */
  #doc(uuid) {
    return uuid ? this.docs?.[uuid] ?? null : null;
  }

  /** Everything the validators need, derived from the draft. */
  #state() {
    const d = this.draft;
    const race = this.#doc(d.race.uuid);
    const exaltation = this.#doc(d.exaltation.uuid);
    const cls = this.#doc(d.class.uuid);
    const values = {
      characteristic: Object.fromEntries(Object.keys(CHARACTERISTICS).map((k) => [k, CREATION.characteristic.base + (d.characteristic[k] ?? 0)])),
      skill: Object.fromEntries(Object.keys(SKILLS).map((k) => [k, d.skill[k] ?? 0]))
    };
    const feats = validateFeats({
      hindrances: d.hindrances.map((h) => this.#doc(h.uuid)).filter(Boolean),
      assets: d.assets.map((a) => this.#doc(a.uuid)).filter(Boolean),
      exaltedAsset: this.#doc(d.exaltedAsset.uuid), exaltation: exaltation?.name ?? "", race: race?.name ?? ""
    });
    const backgrounds = validateBackgrounds({ backgrounds: d.backgrounds, wealth: d.wealth, artifacts: d.artifacts, backings: d.backings });
    const purchases = pricePurchases({
      purchases: d.purchases.map((p) => (p.kind === "feat" ? { ...p, feat: this.#doc(p.uuid) ?? { name: "", system: { prerequisites: {} } } } : p)),
      values, cls, race: race ? { name: race.name } : null, owned: [], released: d.released.includes("xp")
    });
    const balance = xpBalance({ granted: feats.xpGranted, traits: feats.xpSpent, backgrounds: backgrounds.xp, purchases: purchases.spent });
    const finals = previewCharacter({
      dots: { characteristic: d.characteristic, skill: d.skill }, race: race?.system ?? null, raceChoice: d.race.choice,
      exaltation: exaltation?.system ?? null, selection: d.exaltation.selection, purchases: d.purchases
    });
    return { race, exaltation, cls, values, feats, backgrounds, purchases, balance, finals };
  }

  /** Validation of one step: reasons that block it, and warnings. */
  #validate(step, s = this.#state()) {
    const d = this.draft;
    const out = (() => {
      switch (step) {
        case "concept": return validateConcept({ name: d.concept.name });
        case "race": return validateRace({ race: s.race?.system ?? null, choice: d.race.choice });
        case "exaltation": return validateExaltation({ exaltation: s.exaltation?.system ?? null, selection: d.exaltation.selection, race: s.race?.system ?? null, raceChoice: d.race.choice });
        case "characteristics": return validateRatings({ kind: "characteristic", priorities: d.priorities.characteristic, dots: d.characteristic });
        case "skills": return validateRatings({ kind: "skill", priorities: d.priorities.skill, dots: d.skill });
        case "specialties": return validateSpecialties({ finals: s.finals, specialties: foundry.utils.flattenObject(d.specialties) });
        case "class": {
          if (!s.cls) return { ok: false, reasons: ["classRequired"] };
          const [entry] = availableClasses({ classes: [s.cls], skills: s.values.skill });
          return { ok: entry.allowed, reasons: entry.reasons };
        }
        case "backgrounds": return s.backgrounds;
        case "alignment": return { ok: Boolean(d.deity.uuid), reasons: d.deity.uuid ? [] : ["deityRequired"] };
        case "feats": return s.feats.reasons.includes("hindranceLimit") ? { ok: false, reasons: ["hindranceLimit"] } : { ok: true, reasons: [] };
        case "exaltedAsset": return s.feats.reasons.includes("wrongExaltation") ? { ok: false, reasons: ["wrongExaltation"] } : { ok: true, reasons: [] };
        case "xp": {
          const reasons = [...s.purchases.reasons];
          if (s.balance.available < 0) reasons.push("notEnough");
          return { ok: !reasons.length, reasons };
        }
        case "equipment": {
          const eq = equipmentSlots({ picks: d.equipment.map((p) => ({ slot: p.slot, item: this.#equipmentInfo(this.#doc(p.uuid)) })).filter((p) => p.item) });
          // Inherited items (spec 027): blocked above the Inheritance rating, the GM may release.
          const inheritance = this.#inheritance();
          return { ok: eq.ok && inheritance.ok, reasons: [...new Set([...eq.reasons, ...inheritance.reasons])], warnings: eq.empty ? ["emptySlots"] : [] };
        }
        default: return { ok: true, reasons: [] };
      }
    })();
    return { ok: out.ok, reasons: out.reasons ?? [], warnings: out.warnings ?? [], released: d.released.includes(step) };
  }

  /** Inherited items of the draft checked against the Inheritance rating (spec 027). */
  #inheritance() {
    const items = this.draft.inheritance.map((p) => this.#equipmentInfo(this.#doc(p.uuid))).filter(Boolean);
    return inheritanceItems({ level: this.draft.backgrounds.inheritance ?? 0, items });
  }

  /** Rarity and artifact flag of an equipment document. */
  #equipmentInfo(doc) {
    return doc ? { system: { rarity: doc.system.rarity }, artifact: ARTIFACT_CATEGORIES.includes(doc.system.category) } : null;
  }

  /** @override */
  async _prepareContext(options) {
    await this.#load();
    const context = await super._prepareContext(options);
    const state = this.#state();
    const step = this.draft.step;
    const index = BUILDER_STEPS.indexOf(step);
    context.draft = this.draft;
    context.step = step;
    context.isGM = game.user.isGM;
    context.first = index === 0;
    context.last = step === "review";
    context.steps = BUILDER_STEPS.map((key, i) => {
      const v = this.#validate(key, state);
      return { key, number: i + 1, label: localize(`DTD.Builder.Step.${key}`), current: key === step, done: i < index && (v.ok || v.released), warn: i < index && !v.ok && !v.released };
    });
    const current = this.#validate(step, state);
    context.validation = { ...current, messages: current.reasons.map((r) => localize(`DTD.Builder.Reason.${r}`)), warningMessages: current.warnings.map((w) => localize(`DTD.Builder.Warning.${w}`)) };
    context.state = state;
    context.view = this.#stepView(step, state);
    context.summary = this.#summary(state);
    return context;
  }

  /**
   * Short line, XP and prerequisites of a feat, Asset, Hindrance or Exalted Asset (spec 026); `tip` joins them for the
   * info icon next to the name.
   * @returns {{desc: string, xp: string, requires: string, requiresList: string, facts: string, tip: string}}
   */
  #featInfo(doc) {
    const { xp, requires } = featFacts(doc);
    const info = {
      desc: shortLine(doc.system.description),
      xp: xp === null ? "" : `${xp > 0 ? "+" : "−"}${Math.abs(xp)} XP`,
      requires: requires.length ? `${localize("DTD.Builder.Fact.requires")}: ${requires.join(", ")}` : "",
      requiresList: requires.join(", ")
    };
    const facts = [info.xp, info.requires].filter(Boolean).join(" · ");
    return { ...info, facts, tip: [info.desc, facts].filter(Boolean).join(" — ") };
  }

  /** Data of the current step's template. */
  #stepView(step, s) {
    const d = this.draft;
    const charLabel = (key) => localize(CHARACTERISTICS[key].label);
    const skillLabel = (key) => localize(SKILLS[key].label);
    const or = ` ${localize("DTD.Builder.Fact.or")} `;
    const fact = (key, value) => ({ label: localize(`DTD.Builder.Fact.${key}`), value });
    // Panel of the selected card (spec 026): title, facts and a paragraph.
    const detail = (doc, facts, text) => (doc ? { title: doc.name, facts, text } : null);
    const pick = (docs, uuid) => docs.map((doc) => ({ uuid: doc.uuid, name: doc.name, img: doc.img, selected: doc.uuid === uuid }));
    switch (step) {
      case "race": return {
        list: pick(this.data.races, d.race.uuid),
        detail: s.race && detail(s.race, raceFacts(s.race.system).map(({ key, value }) => fact(key,
          key === "characteristic" ? (value === "any" ? localize("DTD.Builder.Fact.anyCharacteristic") : value.map(charLabel).join(or))
            : key === "skills" ? value.map(skillLabel).join(", ")
              : key === "power" ? `${value.name}: ${value.text}` : value)), firstParagraph(s.race.system.description)),
        choice: s.race ? {
          characteristics: characteristicOptions(s.race.system).map((key) => ({ key, label: charLabel(key), selected: key === d.race.choice.characteristic })),
          skillChoose: s.race.system.skillBonus.choose,
          skills: Object.keys(SKILLS).filter((k) => !s.race.system.skillBonus.skills.includes(k)).map((key) => ({ key, label: skillLabel(key), checked: d.race.choice.skills.includes(key) }))
        } : null
      };
      case "exaltation": return {
        list: pick(this.data.exaltations, d.exaltation.uuid),
        detail: s.exaltation && detail(s.exaltation, exaltationFacts(s.exaltation.system).map(({ key, value }) => fact(key,
          key === "powerStat" ? (value.cap === "level" ? `${value.name} (${localize("DTD.Builder.Fact.capLevel")})` : value.name)
            : key === "powers" ? value.join(", ") : value)), firstParagraph(s.exaltation.system.description)),
        statuesque: s.exaltation?.system.staticPowers?.some((p) => p.automation === "statuesque")
          ? statuesqueOptions(s.race ? { ...s.race.system, choice: d.race.choice } : null).map((key) => ({ key, label: charLabel(key), selected: key === d.exaltation.selection.statuesque })) : null,
        elements: s.exaltation?.system.staticPowers?.some((p) => p.automation === "bloodQuickening")
          ? s.exaltation.system.elements.map((e) => ({ key: e.key, label: e.name, selected: e.key === d.exaltation.selection.element })) : null
      };
      case "characteristics":
      case "skills": {
        const kind = step === "characteristics" ? "characteristic" : "skill";
        const { groups, budgets, base, stepMax } = CREATION[kind];
        const v = validateRatings({ kind, priorities: d.priorities[kind], dots: d[kind] });
        const defs = kind === "characteristic" ? CHARACTERISTICS : SKILLS;
        return {
          kind, base, stepMax,
          ranks: budgets.map((budget, rank) => ({
            rank, budget, number: rank + 1,
            options: groups.map((g) => ({ key: g, label: localize(`DTD.Sheet.Column.${g}`), selected: d.priorities[kind][rank] === g }))
          })),
          groups: groups.map((g) => ({
            key: g, label: localize(`DTD.Sheet.Column.${g}`),
            spent: v.groups.find((x) => x.key === g)?.spent ?? 0, budget: v.groups.find((x) => x.key === g)?.budget ?? 0,
            entries: Object.entries(defs).filter(([, def]) => def.group === g).map(([key, def]) => ({
              key, label: localize(def.label), dots: d[kind][key] ?? 0, final: s.finals[kind][key]
            }))
          }))
        };
      }
      case "specialties": {
        const rows = [];
        for (const kind of ["characteristic", "skill"]) {
          for (const [key, value] of Object.entries(s.finals[kind])) {
            // Stored nested (a flag expands dotted keys): specialties.characteristic.dex.
            const text = d.specialties[kind]?.[key] ?? "";
            if (value < 4 && !text) continue;
            rows.push({ path: `${kind}.${key}`, label: kind === "characteristic" ? charLabel(key) : skillLabel(key), value, text, low: value < 4 });
          }
        }
        return { rows };
      }
      case "class": return {
        list: availableClasses({ classes: this.data.classes.map((c) => ({ uuid: c.uuid, name: c.name, system: c.system })), skills: s.values.skill })
          .map((c) => {
            const system = this.#doc(c.uuid).system;
            const cf = classFacts(system);
            const reqs = [...cf.skills.map((r) => `${r.keys.map(skillLabel).join(or)} ${r.value}`), ...cf.feats];
            return {
              ...c, selected: c.uuid === d.class.uuid, reasonText: c.reasons.map((r) => localize(`DTD.Builder.ClassReason.${r}`)).join(", "),
              tip: [shortLine(system.description), `${localize("DTD.Builder.Fact.level")} ${cf.level}`,
                reqs.length ? `${localize("DTD.Builder.Fact.requires")}: ${reqs.join(", ")}` : ""].filter(Boolean).join(" — ")
            };
          })
          .sort((a, b) => Number(b.allowed) - Number(a.allowed) || a.name.localeCompare(b.name))
      };
      case "backgrounds": return {
        rows: [{ key: "wealth", value: d.wealth, field: "wealth" },
          ...SINGLE_BACKGROUNDS.map((key) => ({ key, value: d.backgrounds[key] ?? 0, field: `backgrounds.${key}` }))]
          .map((r) => ({ ...r, label: localize(`DTD.Background.${r.key}.label`), hint: localize(`DTD.Background.${r.key}.hint`) })),
        artifactHint: localize("DTD.Background.artifact.hint"),
        artifacts: d.artifacts.map((a, index) => ({ ...a, index })),
        backingHint: localize("DTD.Background.backing.hint"),
        backings: d.backings.map((b, index) => ({ ...b, index })),
        free: s.backgrounds.free, xp: s.backgrounds.xp
      };
      case "alignment": {
        const deity = this.#doc(d.deity.uuid);
        return {
          detail: detail(deity, deity ? [fact("pantheon", localize(PANTHEONS[deity.system.pantheon]?.label ?? deity.system.pantheon))] : [], deity?.system.summary ?? ""),
          pantheons: Object.entries(PANTHEONS).map(([key, def]) => ({
            key, label: localize(def.label ?? def),
            deities: this.data.deities.filter((g) => g.system.pantheon === key).map((g) => ({ uuid: g.uuid, name: g.name, img: g.img, selected: g.uuid === d.deity.uuid }))
          })).filter((p) => p.deities.length)
        };
      }
      case "feats": return {
        hindrances: this.data.hindrances.map((h) => ({ uuid: h.uuid, name: h.name, checked: d.hindrances.some((x) => x.uuid === h.uuid), ...this.#featInfo(h) })),
        assets: this.data.assets.map((a) => ({ uuid: a.uuid, name: a.name, checked: d.assets.some((x) => x.uuid === a.uuid), ...this.#featInfo(a) }))
      };
      case "exaltedAsset": {
        const asset = this.#doc(d.exaltedAsset.uuid);
        const info = asset && this.#featInfo(asset);
        return {
          detail: asset && detail(asset, [fact("xp", info.xp), ...(info.requiresList ? [fact("requires", info.requiresList)] : [])],
            firstParagraph(asset.system.description)),
          list: this.data.exaltedAssets.filter((a) => {
            const req = a.system.prerequisites ?? {};
            return (!req.exaltation || req.exaltation === s.exaltation?.name) && (!req.race || req.race === s.race?.name);
          }).map((a) => ({ uuid: a.uuid, name: a.name, img: a.img, selected: a.uuid === d.exaltedAsset.uuid }))
        };
      }
      case "xp": return {
        balance: s.balance,
        entries: s.purchases.entries.map((e, index) => ({
          index, cost: e.cost, allowed: e.allowed, reason: e.reason ? localize(`DTD.XP.Error.${e.reason}`) : "",
          label: e.kind === "feat" ? this.#doc(e.uuid)?.name ?? "?" : e.kind === "powerStat" ? localize("DTD.Exaltation.PowerStat")
            : e.kind === "characteristic" ? charLabel(e.key) : e.kind === "skill" ? skillLabel(e.key)
              : localize((e.kind === "school" ? MAGIC_SCHOOLS : MARTIAL_SCHOOLS)[e.key]?.label ?? e.key),
          desc: e.kind === "feat" && this.#doc(e.uuid) ? shortLine(this.#doc(e.uuid).system.description) : ""
        })),
        characteristics: Object.keys(CHARACTERISTICS).map((key) => ({ key, label: charLabel(key) })),
        skills: Object.keys(SKILLS).map((key) => ({ key, label: skillLabel(key) })),
        schools: Object.entries(MAGIC_SCHOOLS).map(([key, def]) => ({ key, label: localize(def.label) })),
        martial: Object.entries(MARTIAL_SCHOOLS).map(([key, def]) => ({ key, label: localize(def.label) })),
        feats: this.data.feats.filter((f) => f.system.category === "feat" || f.system.prerequisites?.race === s.race?.name)
          .map((f) => {
            const info = this.#featInfo(f);
            return { uuid: f.uuid, name: f.name, desc: [info.desc, info.requires].filter(Boolean).join(" · ") };
          }).sort((a, b) => a.name.localeCompare(b.name))
      };
      case "equipment": {
        const slots = [];
        for (const [slot, max] of Object.entries(STARTING_SLOTS)) {
          for (let i = 0; i < max; i++) {
            const pickIndex = d.equipment.findIndex((p) => p.slot === slot && p.n === i);
            const picked = pickIndex >= 0 ? d.equipment[pickIndex].uuid : "";
            const item = this.#doc(picked);
            slots.push({
              slot, n: i, label: localize(`DTD.Rarity.${slot}`),
              // Main numbers and effect of the chosen item (spec 026).
              desc: item ? [itemNumbers(item), shortLine(item.system.effectText || item.system.description, 140)].filter(Boolean).join(" — ") : "",
              options: this.data.equipment.filter((e) => e.system.rarity === slot && !ARTIFACT_CATEGORIES.includes(e.system.category))
                .map((e) => ({ uuid: e.uuid, name: e.name, selected: e.uuid === picked })).sort((a, b) => a.name.localeCompare(b.name))
            });
          }
        }
        // Inherited items (spec 027): any non-artifact item, grouped by rarity, repeats allowed.
        const level = d.backgrounds.inheritance ?? 0;
        const use = this.#inheritance();
        const groups = Object.keys(RARITIES).map((rarity) => ({
          label: localize(`DTD.Rarity.${rarity}`),
          items: this.data.equipment.filter((e) => e.system.rarity === rarity && !ARTIFACT_CATEGORIES.includes(e.system.category)).sort((a, b) => a.name.localeCompare(b.name))
        })).filter((g) => g.items.length);
        const inheritance = {
          level, hint: localize("DTD.Background.inheritance.hint"),
          use: level > 0 ? format("DTD.Builder.InheritanceUse", { used: use.used, max: use.max }) : "",
          over: use.reasons.includes("inheritanceOver"),
          rows: d.inheritance.map((p, index) => {
            const item = this.#doc(p.uuid);
            return {
              index, rarity: item ? localize(`DTD.Rarity.${item.system.rarity}`) : "",
              desc: item ? [itemNumbers(item), shortLine(item.system.effectText || item.system.description, 140)].filter(Boolean).join(" — ") : "",
              groups: groups.map((g) => ({ label: g.label, options: g.items.map((e) => ({ uuid: e.uuid, name: e.name, selected: e.uuid === p.uuid })) }))
            };
          })
        };
        return { slots, inheritance };
      }
      case "review": return {
        checks: BUILDER_STEPS.filter((k) => k !== "review").map((key) => {
          const v = this.#validate(key, s);
          return { label: localize(`DTD.Builder.Step.${key}`), ok: v.ok, released: v.released, warn: v.warnings.length > 0 };
        }),
        languages: languagesHint(s.finals.characteristic.int),
        canFinish: BUILDER_STEPS.filter((k) => k !== "review").every((k) => { const v = this.#validate(k, s); return v.ok || v.released; })
      };
      default: return {};
    }
  }

  /** Side summary (FR-012). */
  #summary(s) {
    const d = this.draft;
    return {
      name: d.concept.name, img: d.concept.img,
      race: s.race?.name ?? "—", exaltation: s.exaltation?.name ?? "—", cls: s.cls?.name ?? "—",
      deity: this.#doc(d.deity.uuid)?.name ?? "—",
      // Every hero starts with Devotion 6 to the chosen god (p. 286).
      devotion: d.deity.uuid ? 6 : null,
      characteristics: Object.entries(s.finals.characteristic).map(([key, value]) => ({ label: localize(CHARACTERISTICS[key].abbr), value })),
      skills: Object.entries(s.finals.skill).filter(([, v]) => v > 0).map(([key, value]) => ({ label: localize(SKILLS[key].label), value })),
      xp: s.balance,
      xpTotal: s.balance.starting + s.balance.granted
    };
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    for (const input of this.element.querySelectorAll("[data-field]")) {
      if (input.dataset.action) continue;
      input.addEventListener("change", (event) => this.#onField(event.currentTarget));
    }
    // A selector that does not change the draft updates its info icon without re-rendering (spec 026).
    for (const select of this.element.querySelectorAll("select[data-describe]")) {
      const line = this.element.querySelector(select.dataset.describe);
      const show = () => {
        const option = select.selectedOptions[0];
        if (!line) return;
        line.dataset.tooltip = option?.dataset.desc ?? "";
        line.hidden = !option?.dataset.desc;
      };
      select.addEventListener("change", show);
      show();
    }
  }

  /** Write a field into the draft and re-render. */
  async #onField(input) {
    const path = input.dataset.field;
    let value = input.type === "checkbox" ? input.checked : input.type === "number" ? Math.max(0, Number(input.value) || 0) : input.value;
    if (path.startsWith("priorities.")) {
      const [, kind, rank] = path.split(".");
      const list = [...this.draft.priorities[kind]];
      const swap = list.indexOf(value);
      if (swap >= 0) list[swap] = list[Number(rank)];
      list[Number(rank)] = value;
      this.draft.priorities[kind] = list;
    } else if (path === "race.choice.skills") {
      const set = new Set(this.draft.race.choice.skills);
      if (input.checked) set.add(input.value); else set.delete(input.value);
      this.draft.race.choice.skills = [...set];
    } else if (path.startsWith("artifacts.") || path.startsWith("backings.")) {
      const [list, index, field] = path.split(".");
      this.draft[list][Number(index)][field] = field === "value" ? Math.max(0, Number(input.value) || 0) : input.value;
    } else if (path.startsWith("inheritance.")) {
      this.draft.inheritance[Number(path.split(".")[1])] = { uuid: value };
    } else if (path.startsWith("equipment.")) {
      const [, slot, n] = path.split(".");
      this.draft.equipment = this.draft.equipment.filter((p) => !(p.slot === slot && p.n === Number(n)));
      if (value) this.draft.equipment.push({ slot, n: Number(n), uuid: value });
    } else {
      foundry.utils.setProperty(this.draft, path, value);
    }
    await this.#changed();
  }

  /**
   * Save the draft and re-render. The text field the user moved into keeps its focus, caret and what was already
   * typed in it: the change of the previous field re-renders the window while the user writes in the next one.
   */
  async #changed() {
    await saveDraft(this.draft);
    const active = this.element?.contains(document.activeElement) ? document.activeElement : null;
    const typing = active?.dataset.field && (active.tagName === "TEXTAREA" || ["text", "number"].includes(active.type));
    const kept = typing ? { field: active.dataset.field, value: active.value, start: active.selectionStart, end: active.selectionEnd } : null;
    await this.render();
    if (!kept) return;
    const input = this.element.querySelector(`[data-field="${kept.field}"]`);
    if (!input) return;
    input.value = kept.value;
    input.focus();
    if (kept.start !== null && input.type !== "number") input.setSelectionRange(kept.start, kept.end);
  }

  /** @override */
  async _onClose(options) {
    await super._onClose(options);
    // A finished character already dropped its draft.
    if (options.skipSave) return;
    if (this.draft.concept.name || this.draft.race.uuid) await saveDraft(this.draft);
  }

  static async #onGoto(event, target) {
    this.draft.step = target.dataset.step;
    await this.#changed();
  }

  static async #onBack() {
    const i = BUILDER_STEPS.indexOf(this.draft.step);
    if (i > 0) this.draft.step = BUILDER_STEPS[i - 1];
    await this.#changed();
  }

  static async #onNext() {
    const v = this.#validate(this.draft.step);
    if (!v.ok && !v.released) {
      ui.notifications.warn(v.reasons.map((r) => localize(`DTD.Builder.Reason.${r}`)).join(" "));
      return;
    }
    const i = BUILDER_STEPS.indexOf(this.draft.step);
    if (i < BUILDER_STEPS.length - 1) this.draft.step = BUILDER_STEPS[i + 1];
    await this.#changed();
  }

  static async #onRelease() {
    if (!game.user.isGM) return;
    if (!this.draft.released.includes(this.draft.step)) this.draft.released.push(this.draft.step);
    await this.#changed();
  }

  static async #onFinish() {
    const actor = await finish(this.draft, this.docs);
    if (actor) this.close({ skipSave: true });
  }

  static async #onPick(event, target) {
    const { field, value } = target.dataset;
    foundry.utils.setProperty(this.draft, field, value);
    // A new race or exaltation resets its choices.
    if (field === "race.uuid") this.draft.race.choice = { characteristic: "", skills: [] };
    if (field === "exaltation.uuid") { this.draft.exaltation.selection = { statuesque: "", element: "" }; this.draft.exaltedAsset = { uuid: "" }; }
    await this.#changed();
  }

  static async #onToggle(event, target) {
    const { field, value } = target.dataset;
    const list = this.draft[field];
    const at = list.findIndex((x) => x.uuid === value);
    if (at >= 0) list.splice(at, 1); else list.push({ uuid: value });
    await this.#changed();
  }

  static async #onAddPurchase(event, target) {
    const row = target.closest(".builder-purchase");
    const kind = row.querySelector("[name=purchaseKind]").value;
    const key = row.querySelector(`[name=purchase-${kind}]`)?.value ?? "";
    this.draft.purchases.push(kind === "feat" ? { kind, uuid: key } : { kind, key });
    await this.#changed();
  }

  static async #onRemovePurchase(event, target) {
    this.draft.purchases.splice(Number(target.dataset.index), 1);
    await this.#changed();
  }

  static async #onAddArtifact() {
    this.draft.artifacts.push({ name: "", value: 1 });
    await this.#changed();
  }

  static async #onRemoveArtifact(event, target) {
    this.draft.artifacts.splice(Number(target.dataset.index), 1);
    await this.#changed();
  }

  static async #onAddBacking() {
    this.draft.backings.push({ name: "", value: 1 });
    await this.#changed();
  }

  static async #onRemoveBacking(event, target) {
    this.draft.backings.splice(Number(target.dataset.index), 1);
    await this.#changed();
  }

  static async #onAddInheritance() {
    this.draft.inheritance.push({ uuid: "" });
    await this.#changed();
  }

  static async #onRemoveInheritance(event, target) {
    this.draft.inheritance.splice(Number(target.dataset.index), 1);
    await this.#changed();
  }
}
