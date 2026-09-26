import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CHARACTERISTICS, RACE_POWER_AUTOMATION, SKILLS } from "../../module/config.mjs";

const SOURCE = "src/packs/races";

const races = readdirSync(SOURCE)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(join(SOURCE, file), "utf8")));

/**
 * Reference table — spec 002 "Tabela de referência" (DtD 7.7a, cap. 4, pp. 30–63).
 * [characteristic options (null = any), fixed skills, choose, size, power, automation, page]
 */
const EXPECTED = {
  Aasimar: [["wis", "con"], ["command", "ballistics"], 0, 5, "And They Shall Know No Fear", "none", 31],
  "Dark Eldarin": [["cha", "dex"], ["deceive", "forbiddenLore"], 0, 3, "Warp Miasma", "none", 33],
  Dragonborn: [["str", "cha"], ["command", "intimidation"], 0, 5, "Dragon Breath", "none", 35],
  Dryad: [["fel", "wil"], ["animalKen", "scrutiny"], 0, 4, "Pheromones", "none", 37],
  Eldarin: [["wis", "int"], ["academicLore", "arcana"], 0, 3, "Warp Step", "usesPerScene", 39],
  Elf: [["wis", "dex"], ["perception", "charm"], 0, 3, "Elven Accuracy", "none", 41],
  Gnome: [["int", "fel"], ["crafts", "academicLore"], 0, 3, "Improvise", "none", 43],
  Halfling: [["int", "fel"], ["larceny", "deceive"], 0, 2, "Shifty", "shifty", 45],
  Human: [null, [], 2, 4, "Heroic Heritage", "heroicHeritage", 47],
  Kenku: [["int", "wis"], ["performer", "pilot"], 0, 3, "Wing-Aided Movement", "none", 49],
  Kobold: [["cha", "dex"], ["arcana", "stealth"], 0, 2, "Power in the Blood", "none", 51],
  Ork: [["str", "wil"], ["intimidation", "scrutiny"], 0, 5, "WAAAAAGH!", "none", 53],
  Squat: [["con", "wil"], ["crafts", "commonLore"], 0, 3, "Squat Toughness", "squatToughness", 55],
  Tau: [["int", "cmp"], ["commonLore", "persuasion"], 0, 4, "Fall Back", "none", 57],
  "Thri-Kreen": [["dex", "wis"], ["acrobatics", "perception"], 0, 4, "Multi-Armed", "none", 59],
  Tiefling: [["dex", "con"], ["intimidation", "weaponry"], 0, 5, "Bloody Minded", "none", 61]
};

const sorted = (list) => [...list].sort();

describe("races compendium source (SC-001)", () => {
  it("contains exactly the 16 races of the 7.7a", () => {
    expect(sorted(races.map((race) => race.name))).toEqual(sorted(Object.keys(EXPECTED)));
  });

  it("has unique 16-character ids and matching LevelDB keys", () => {
    const ids = races.map((race) => race._id);
    for (const race of races) {
      expect(race._id).toMatch(/^[A-Za-z0-9]{16}$/);
      expect(race._key).toBe(`!items!${race._id}`);
      expect(race.type).toBe("race");
      expect(race.effects).toEqual([]);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(races.map((race) => [race.name, race]))("%s", (name, race) => {
    const [options, skills, choose, size, power, automation, page] = EXPECTED[name];
    const system = race.system;

    it("matches the book's racial statistics", () => {
      if (options === null) {
        expect(system.characteristicBonus).toEqual({ options: [], any: true });
      } else {
        expect(system.characteristicBonus.any).toBe(false);
        expect(sorted(system.characteristicBonus.options)).toEqual(sorted(options));
      }
      expect(sorted(system.skillBonus.skills)).toEqual(sorted(skills));
      expect(system.skillBonus.choose).toBe(choose);
      expect(system.size).toBe(size);
      expect(system.power.name).toBe(power);
      expect(system.power.automation).toBe(automation);
      expect(system.source).toEqual({ book: "DtD 7.7a", page });
    });

    it("uses only known keys and an empty choice", () => {
      for (const key of system.characteristicBonus.options) expect(CHARACTERISTICS).toHaveProperty(key);
      for (const key of system.skillBonus.skills) expect(SKILLS).toHaveProperty(key);
      expect(RACE_POWER_AUTOMATION).toContain(system.power.automation);
      expect(system.choice).toEqual({ characteristic: "", skills: [] });
      expect(system.power.uses).toEqual({ spent: 0 });
      // The book text is never shipped: each table pastes it in its own world (constitution V).
      expect(system.fullText).toBe("");
    });

    it("has summaries and lore", () => {
      expect(system.description.trim()).not.toBe("");
      expect(system.power.description.trim()).not.toBe("");
      expect(system.lore.languages).toContain("Trade");
      // Human has no height, weight, traits or example names in the book (7.7a p. 47).
      if (name !== "Human") {
        for (const list of ["personality", "physical", "names"]) expect(system.lore[list].length).toBeGreaterThan(0);
      }
    });
  });
});
