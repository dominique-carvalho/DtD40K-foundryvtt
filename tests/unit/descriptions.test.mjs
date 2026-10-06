import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  classFacts, exaltationFacts, featFacts, firstParagraph, itemNumbers, plainText, raceFacts, shortLine
} from "../../module/rules/descriptions.mjs";

/**
 * Short descriptions of the character builder (spec 026, contracts/descriptions.md), checked against the real
 * compendium sources.
 */

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : path.endsWith(".json") ? [path] : [];
});
const docs = Object.fromEntries(["races", "exaltations", "classes", "feats", "equipment"].map((pack) => [pack,
  walk(join("src/packs", pack)).map((file) => JSON.parse(readFileSync(file, "utf8"))).filter((d) => d.system)]));
const doc = (pack, name) => docs[pack].find((d) => d.name === name);

describe("plainText, shortLine and firstParagraph", () => {
  it("strips tags and entities", () => {
    expect(plainText("<p>Roll &amp; Keep<br>dice&nbsp;now</p>")).toBe("Roll & Keep dice now");
  });

  it("keeps the first sentence, joins a very short one with the next, and cuts long text at a word", () => {
    expect(shortLine("<p>Someone you wronged is out for payback. This foe is relentless.</p>")).toBe("Someone you wronged is out for payback.");
    expect(shortLine("<p>Tough. You shrug off pain and keep fighting long after others fall.</p>")).toBe("Tough. You shrug off pain and keep fighting long after others fall.");
    const long = shortLine(`<p>${"word ".repeat(60)}end.</p>`, 50);
    expect(long.length).toBeLessThanOrEqual(51);
    expect(long.endsWith("…")).toBe(true);
    expect(long).not.toMatch(/wor…$/);
    expect(shortLine("")).toBe("");
  });

  it("takes the first paragraph with text, skipping headings", () => {
    expect(firstParagraph(doc("races", "Tiefling").system.description)).toMatch(/^Tieflings are the Aasimar's counterpart/);
  });
});

describe("raceFacts", () => {
  it("lists the bonuses, size and power of a race", () => {
    const facts = Object.fromEntries(raceFacts(doc("races", "Tiefling").system).map((f) => [f.key, f.value]));
    expect(facts.characteristic).toEqual(["dex", "con"]);
    expect(facts.skills).toEqual(["intimidation", "weaponry"]);
    expect(facts.size).toBe(5);
    expect(facts.power).toEqual({ name: "Bloody Minded", text: "Damage dice showing a 1 can be rerolled." });
  });

  it("shows a free choice", () => {
    const facts = Object.fromEntries(raceFacts(doc("races", "Human").system).map((f) => [f.key, f.value]));
    expect(facts.characteristic).toBe("any");
    expect(facts.chooseSkills).toBe(2);
    expect(facts.skills).toBeUndefined();
  });
});

describe("exaltationFacts", () => {
  it("lists the Power Stat, the resource and the rank 1 powers", () => {
    const facts = Object.fromEntries(exaltationFacts(doc("exaltations", "Werewolf").system).map((f) => [f.key, f.value]));
    expect(facts.powerStat).toEqual({ name: "Feral Heart", cap: "level" });
    expect(facts.resource).toBe("Rage");
    expect(facts.powers).toEqual(["Fast Healing"]);
  });
});

describe("featFacts", () => {
  it("gives the XP and the prerequisites", () => {
    expect(featFacts(doc("feats", "Enemy"))).toEqual({ xp: 100, requires: [] });
    expect(featFacts(doc("feats", "Appearance"))).toEqual({ xp: -100, requires: [] });
    expect(featFacts(doc("feats", "Outsider"))).toEqual({ xp: -100, requires: ["Tiefling"] });
  });
});

describe("classFacts", () => {
  it("gives the Level and the prerequisites", () => {
    expect(classFacts(doc("classes", "Mercenary").system)).toEqual({ level: 1, skills: [], feats: [] });
    expect(classFacts(doc("classes", "Monk").system)).toEqual({
      level: 3, skills: [{ keys: ["brawl"], value: 3 }, { keys: ["acrobatics"], value: 3 }, { keys: ["athletics"], value: 3 }], feats: ["Ki Strike"]
    });
  });
});

describe("itemNumbers", () => {
  it("summarizes weapons, armor and drugs", () => {
    expect(itemNumbers(doc("equipment", "Autopistol"))).toBe("2k2 I · Pen 0 · 30 m · ROF S/6");
    expect(itemNumbers(doc("equipment", "Knife"))).toBe("1k2 R · Pen 0");
    expect(itemNumbers(doc("equipment", "Flak"))).toBe("AP 5 · medium · Max Dex 5");
    expect(itemNumbers(doc("equipment", "Stimm"))).toBe("Addictivity moderate");
  });
});
