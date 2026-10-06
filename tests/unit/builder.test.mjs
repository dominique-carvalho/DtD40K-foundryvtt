import { describe, expect, it } from "vitest";
import { inheritanceFits } from "../../module/rules/backgrounds.mjs";
import {
  BUILDER_STEPS, availableClasses, buildPlan, equipmentSlots, inheritanceItems, previewCharacter, pricePurchases, validateBackgrounds,
  validateConcept, validateExaltation, validateFeats, validateRace, validateRatings, validateSpecialties, xpBalance
} from "../../module/rules/builder.mjs";

const tiefling = { characteristicBonus: { options: ["cha", "int"], any: false }, skillBonus: { skills: ["deceive"], choose: 0 }, size: 4, power: { automation: "none" } };
const human = { characteristicBonus: { options: [], any: true }, skillBonus: { skills: [], choose: 2 }, size: 4, power: { automation: "none" } };
const werewolf = { staticPowers: [], elements: [] };
const paragon = { staticPowers: [{ automation: "statuesque" }], elements: [] };
const monk = {
  name: "Monk", system: {
    level: 1, status: "", characteristics: ["str", "dex", "wis"], anyCharacteristic: false, skills: ["brawl", "acrobatics"],
    feats: [{ name: "Stunning Fist", mandatory: true, orGroup: "", subcategory: "" }], magicSchools: [], swordSchools: [], gunKata: [],
    prerequisites: { skills: [], feats: [], schools: [], text: "" }
  }
};

describe("steps and concept (FR-002)", () => {
  it("lists the steps in the book's order", () => {
    expect(BUILDER_STEPS).toEqual(["concept", "race", "exaltation", "characteristics", "skills", "specialties", "class", "backgrounds", "alignment", "feats", "exaltedAsset", "xp", "equipment", "review"]);
  });

  it("needs a name", () => {
    expect(validateConcept({ name: " " }).reasons).toEqual(["nameRequired"]);
    expect(validateConcept({ name: "Jane" }).ok).toBe(true);
  });
});

describe("race and exaltation (FR-004)", () => {
  it("checks the race and its choice", () => {
    expect(validateRace({ race: null }).reasons).toEqual(["raceRequired"]);
    expect(validateRace({ race: tiefling, choice: { characteristic: "cha", skills: [] } }).ok).toBe(true);
    expect(validateRace({ race: tiefling, choice: { characteristic: "str", skills: [] } }).reasons).toEqual(["raceChoice"]);
    expect(validateRace({ race: human, choice: { characteristic: "str", skills: ["brawl"] } }).reasons).toEqual(["raceChoice"]);
  });

  it("checks the exaltation and its selection", () => {
    expect(validateExaltation({ exaltation: null }).reasons).toEqual(["exaltationRequired"]);
    expect(validateExaltation({ exaltation: werewolf, selection: {}, race: tiefling }).ok).toBe(true);
    expect(validateExaltation({ exaltation: paragon, selection: { statuesque: "" }, race: tiefling }).reasons).toEqual(["exaltationChoice"]);
    expect(validateExaltation({ exaltation: paragon, selection: { statuesque: "int" }, race: tiefling }).ok).toBe(true);
  });
});

describe("starting scores (FR-005, p. 13)", () => {
  const jane = { str: 2, dex: 3, con: 1, int: 2, wis: 1, wil: 1, cha: 1, fel: 1, cmp: 0 };
  it("fits Jane's priorities", () => {
    const out = validateRatings({ kind: "characteristic", priorities: ["physical", "mental", "social"], dots: jane });
    expect(out.ok).toBe(true);
    expect(out.groups).toEqual([{ key: "physical", spent: 6, budget: 6 }, { key: "mental", spent: 4, budget: 4 }, { key: "social", spent: 2, budget: 2 }]);
    expect(out.warnings).toEqual([]);
  });

  it("refuses an overspent group and a rating above the cap", () => {
    expect(validateRatings({ kind: "characteristic", priorities: ["physical", "mental", "social"], dots: { ...jane, con: 2 } }).reasons).toContain("budget");
    expect(validateRatings({ kind: "characteristic", priorities: ["physical", "mental", "social"], dots: { str: 4 } }).reasons).toContain("cap");
    expect(validateRatings({ kind: "skill", priorities: ["physical", "social", "mental"], dots: { brawl: 4 } }).reasons).toContain("cap");
  });

  it("warns about unspent dots and missing priorities", () => {
    expect(validateRatings({ kind: "skill", priorities: ["physical", "social", "mental"], dots: { brawl: 3 } }).warnings).toEqual(["unspent"]);
    expect(validateRatings({ kind: "skill", priorities: [], dots: {} }).reasons).toEqual(["priorities"]);
  });
});

describe("specialties (FR-006, p. 23)", () => {
  it("allows one per rating at 4 or more", () => {
    const finals = { characteristic: { dex: 4 }, skill: { brawl: 3 } };
    expect(validateSpecialties({ finals, specialties: { "characteristic.dex": "Quick hands" } }).ok).toBe(true);
    expect(validateSpecialties({ finals, specialties: { "skill.brawl": "Claws" } }).reasons).toEqual(["specialtyLow"]);
    expect(validateSpecialties({ finals, specialties: { "skill.brawl": "  " } }).ok).toBe(true);
  });

  it("warns about a rating at 4 or more without a specialty", () => {
    const finals = { characteristic: { dex: 4 }, skill: { brawl: 4 } };
    const out = validateSpecialties({ finals, specialties: { "characteristic.dex": "Quick hands" } });
    expect(out.ok).toBe(true);
    expect(out.warnings).toEqual(["missing"]);
    expect(validateSpecialties({ finals, specialties: { "characteristic.dex": "Quick hands", "skill.brawl": "Claws" } }).warnings).toEqual([]);
  });
});

describe("classes (FR-007)", () => {
  it("lists level-1 classes whose prerequisites are met", () => {
    const veteran = { name: "Veteran", system: { ...monk.system, level: 2 } };
    const brawler = { name: "Brawler", system: { ...monk.system, prerequisites: { skills: [{ keys: ["brawl"], value: 3 }], feats: [], schools: [], text: "" } } };
    const out = availableClasses({ classes: [monk, veteran, brawler], skills: { brawl: 2 } });
    expect(out.map((c) => [c.name, c.allowed])).toEqual([["Monk", true], ["Veteran", false], ["Brawler", false]]);
    expect(out[2].reasons).toEqual(["missingSkills"]);
  });
});

describe("backgrounds (FR-008, pp. 15–16)", () => {
  it("gives 7 free dots up to 3 each, then costs XP", () => {
    expect(validateBackgrounds({ backgrounds: { allies: 3, contacts: 3, fame: 1 }, wealth: 0 }).xp).toBe(0);
    expect(validateBackgrounds({ backgrounds: { allies: 3, contacts: 3, fame: 2 }, wealth: 0 }).xp).toBe(50);
    expect(validateBackgrounds({ backgrounds: { allies: 4 }, wealth: 0 }).xp).toBe(100);
    expect(validateBackgrounds({ backgrounds: { allies: 6 }, wealth: 0 }).reasons).toEqual(["atMax"]);
    expect(validateBackgrounds({ backgrounds: {}, wealth: 0, artifacts: [{ value: 3 }, { value: 3 }] }).reasons).toEqual(["artifactCap"]);
  });
});

describe("feats, assets and hindrances (FR-009)", () => {
  const hindrance = (name) => ({ name, system: { category: "hindrance", xpGranted: 100, prerequisites: {} } });
  const asset = (name) => ({ name, system: { category: "asset", prerequisites: {} } });
  const bsd = { name: "Black Spiral Dancers", system: { category: "exaltedAsset", group: "werewolfTribe", prerequisites: { exaltation: "Werewolf", race: "" } } };
  it("counts Jane's traits", () => {
    const out = validateFeats({ hindrances: [hindrance("Enemy"), hindrance("Impulsive")], assets: [asset("Appearance")], exaltedAsset: bsd, exaltation: "Werewolf", race: "Tiefling" });
    expect(out).toMatchObject({ ok: true, xpGranted: 200, xpSpent: 200 });
  });

  it("refuses a third Hindrance and an Exalted Asset of another exaltation", () => {
    expect(validateFeats({ hindrances: [hindrance("A"), hindrance("B"), hindrance("C")], assets: [], exaltation: "Werewolf" }).reasons).toEqual(["hindranceLimit"]);
    expect(validateFeats({ hindrances: [], assets: [], exaltedAsset: bsd, exaltation: "Vampire" }).reasons).toEqual(["wrongExaltation"]);
  });
});

describe("XP purchases and balance (FR-010, p. 16)", () => {
  it("prices Jane's purchases on the Monk list", () => {
    const outsider = { name: "Outsider", system: { category: "racialFeat", prerequisites: { race: "Tiefling" }, selection: {} } };
    const out = pricePurchases({
      purchases: [{ kind: "skill", key: "brawl" }, { kind: "feat", feat: outsider }],
      values: { characteristic: { str: 3 }, skill: { brawl: 3 } }, cls: monk, race: { name: "Tiefling" }, owned: []
    });
    expect(out.entries.map((e) => [e.kind, e.cost, e.allowed])).toEqual([["skill", 50, true], ["feat", 100, true]]);
    expect(out.spent).toBe(150);
    expect(out.ok).toBe(true);
  });

  it("refuses off-list purchases and a Power Stat above the Level", () => {
    const out = pricePurchases({ purchases: [{ kind: "skill", key: "stealth" }, { kind: "powerStat" }], values: { characteristic: {}, skill: {} }, cls: monk, race: null, owned: [], powerStat: 1 });
    expect(out.entries.map((e) => e.reason)).toEqual(["offList", "atCap"]);
    expect(out.ok).toBe(false);
  });

  it("charges the refused purchases once the GM releases the step", () => {
    const outOfList = { name: "Unarmed Warrior", system: { category: "general", prerequisites: {}, selection: {} } };
    const out = pricePurchases({ purchases: [{ kind: "feat", feat: outOfList }], values: { characteristic: {}, skill: {} }, cls: monk, race: null, owned: [], released: true });
    expect(out.entries[0].allowed).toBe(false);
    expect(out.spent).toBe(100);
    expect(out.reasons).toEqual(["purchaseRefused"]);
  });

  it("keeps the balance", () => {
    expect(xpBalance({ starting: 600, granted: 200, traits: 200, backgrounds: 0, purchases: 550 })).toEqual({ starting: 600, granted: 200, spent: 750, available: 50 });
  });
});

describe("equipment (FR-011, p. 16)", () => {
  const item = (rarity, artifact = false) => ({ system: { rarity }, artifact });
  it("fills slots of the exact rarity, without artifacts", () => {
    const out = equipmentSlots({ picks: [{ slot: "rare", item: item("rare") }, { slot: "common", item: item("uncommon") }, { slot: "rare", item: item("rare", true) }] });
    // Two picks in the single Rare slot: also too many.
    expect(out.reasons).toEqual(["wrongRarity", "artifact", "tooMany"]);
    expect(out.empty).toBe(4);
    expect(equipmentSlots({ picks: [] }).ok).toBe(true);
  });
});

describe("preview and plan (R1, R3)", () => {
  it("adds the racial bonus and Statuesque on top of the dots", () => {
    const out = previewCharacter({
      dots: { characteristic: { cha: 1, int: 2 }, skill: { brawl: 3 } }, race: tiefling, raceChoice: { characteristic: "cha", skills: [] },
      exaltation: paragon, selection: { statuesque: "int" }, purchases: [{ kind: "skill", key: "brawl" }]
    });
    expect(out.characteristic).toMatchObject({ cha: 3, int: 4, str: 1 });
    expect(out.skill).toMatchObject({ brawl: 4, deceive: 1 });
  });

  it("orders the plan and skips empty steps", () => {
    const plan = buildPlan({ draft: { race: { uuid: "r" }, exaltation: { uuid: "e" }, class: { uuid: "c" }, deity: { uuid: "d" }, hindrances: [], assets: [], purchases: [], equipment: [] } });
    expect(plan.map((s) => s.op)).toEqual(["race", "exaltation", "ratings", "specialties", "class", "deity", "backgrounds"]);
  });
});

describe("Backing (spec 027, US1)", () => {
  it("counts each Backing like any other Background", () => {
    const out = validateBackgrounds({ backgrounds: { allies: 1 }, wealth: 3, backings: [{ name: "Harmonium", value: 2 }, { name: "Doomguard", value: 1 }] });
    expect(out.free).toBe(7);
    expect(out.xp).toBe(0);
    expect(validateBackgrounds({ backgrounds: {}, wealth: 0, backings: [{ name: "Harmonium", value: 4 }] }).xp).toBe(100);
    expect(validateBackgrounds({ backgrounds: {}, wealth: 0, backings: [{ name: "Harmonium", value: 6 }] }).reasons).toEqual(["atMax"]);
  });

  it("warns about a Backing without a name", () => {
    expect(validateBackgrounds({ backgrounds: {}, wealth: 0, backings: [{ name: " ", value: 1 }] }).warnings).toEqual(["unnamedBacking"]);
    expect(validateBackgrounds({ backgrounds: {}, wealth: 0, backings: [{ name: "Harmonium", value: 1 }] }).warnings).toEqual([]);
    expect(validateBackgrounds({ backgrounds: {}, wealth: 0 }).warnings).toEqual([]);
  });
});

describe("inheritanceItems (spec 027, US2)", () => {
  const item = (rarity, artifact = false) => ({ system: { rarity }, artifact });

  it("fits a rarer item or two choices of the rank below", () => {
    expect(inheritanceItems({ level: 2, items: [item("rare")] })).toMatchObject({ ok: true, picks: { rare: 1 }, used: 2, max: 2 });
    expect(inheritanceItems({ level: 2, items: [item("uncommon"), item("uncommon")] }).ok).toBe(true);
    expect(inheritanceItems({ level: 2, items: [item("uncommon"), item("uncommon"), item("uncommon")] }))
      .toMatchObject({ ok: false, reasons: ["inheritanceOver"], used: 3, max: 2 });
    expect(inheritanceItems({ level: 1, items: Array(4).fill(item("veryCommon")) }).ok).toBe(true);
    expect(inheritanceItems({ level: 1, items: Array(5).fill(item("veryCommon")) }).reasons).toEqual(["inheritanceOver"]);
  });

  it("refuses items without Inheritance and artifacts", () => {
    expect(inheritanceItems({ level: 0, items: [item("common")] }).reasons).toEqual(["inheritanceOver"]);
    expect(inheritanceItems({ level: 0, items: [] })).toMatchObject({ ok: true, used: 0, max: 0 });
    expect(inheritanceItems({ level: 3, items: [item("rare", true)] }).reasons).toEqual(["artifact"]);
  });

  it("agrees with the sheet's check (SC-003)", () => {
    const rarities = ["ubiquitous", "veryCommon", "common", "uncommon", "rare", "veryRare", "mythicRare"];
    for (let level = 0; level <= 5; level++) {
      for (const a of rarities) for (const b of rarities) for (const n of [1, 2, 3]) {
        const items = [item(a), ...Array(n).fill(item(b))];
        const picks = {};
        for (const i of items) picks[i.system.rarity] = (picks[i.system.rarity] ?? 0) + 1;
        expect(inheritanceItems({ level, items }).ok).toBe(inheritanceFits(level, picks));
      }
    }
  });

  it("plans the equipment step for inherited items alone", () => {
    const plan = buildPlan({ draft: { hindrances: [], assets: [], purchases: [], equipment: [], inheritance: [{ uuid: "x" }] } });
    expect(plan.map((p) => p.op)).toContain("equipment");
  });
});
