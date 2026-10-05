import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ICON_COLORS, assignPaths, categoryFor, compactPath, composeIcon, glyphFor, glyphPaths, slugify } from "../../scripts/lib/icons.mjs";

/**
 * Icon pipeline (spec 024, contracts/icon-pipeline.md): pure helpers that compose the Cogitator plate, pick the
 * category and glyph of a compendium document and give each one a stable file path.
 */

const GLYPH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 0h512v512H0z"/>'
  + '<path fill="#fff" d="M10 10h20v20z"/><path fill="#fff" fill-rule="evenodd" d="M40 40h5v5z"/></svg>';

const categories = [
  { key: "weapon-pistol", color: "#c8372f", glyph: "delapouite/revolver", match: [{ type: "weapon", weaponType: "pistol" }] },
  { key: "weapon-melee", color: "#c8372f", glyph: "lorc/broadsword", match: [{ type: "weapon", weaponType: "melee" }] },
  { key: "drug", color: "#e0963a", glyph: "lorc/pill", match: [{ type: "gear", category: "drug" }] },
  { key: "npc", color: "#c8372f", glyph: "lorc/daemon-skull", match: [{ type: "npc" }] },
  { key: "table", color: "#e0963a", glyph: "lorc/rolling-dices", match: [{ kind: "table" }] }
];

describe("slugify", () => {
  it("makes a stable kebab-case ASCII name", () => {
    expect(slugify("Power Sword")).toBe("power-sword");
    expect(slugify("Critical — Energy — Arm")).toBe("critical-energy-arm");
    expect(slugify("Weapon Proficiency (Melee 1)")).toBe("weapon-proficiency-melee-1");
    expect(slugify("Tâch'e-Flâmme")).toBe("tache-flamme");
  });
});

describe("glyphPaths", () => {
  it("keeps the glyph paths and drops the black square", () => {
    expect(glyphPaths(GLYPH)).toEqual([{ d: "M10 10h20v20z" }, { d: "M40 40h5v5z", fillRule: "evenodd" }]);
  });

  it("refuses a file without glyph paths", () => {
    expect(() => glyphPaths('<svg><path d="M0 0h512v512H0z"/></svg>')).toThrow();
  });
});

describe("compactPath", () => {
  it("keeps one decimal and the numbers apart", () => {
    expect(compactPath("M491.844 22.533-83.42 14.865L196.572")).toBe("M491.8 22.5-83.4 14.9L196.6");
    expect(compactPath("a.5.5 0 0 1")).toBe("a.5.5 0 0 1");
    expect(compactPath("1.2.04")).toBe("1.2 0");
    expect(compactPath("5.05.96")).toBe("5.1 1");
    expect(compactPath("c-.046 24.127")).toBe("c0 24.1");
    expect(compactPath("20.5.006.032.022.06")).toBe("20.5 0 0 0 .1");
  });

  it("keeps every versioned glyph number for number (within the rounding)", () => {
    const numbers = (d) => [...d.matchAll(/[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi)].map(([n]) => Number(n));
    const broken = [];
    for (const author of readdirSync("src/icons/glyphs").filter((a) => !a.endsWith(".txt"))) {
      for (const file of readdirSync(join("src/icons/glyphs", author))) {
        const d = glyphPaths(readFileSync(join("src/icons/glyphs", author, file), "utf8")).map((p) => p.d).join(" M");
        const a = numbers(d);
        const b = numbers(compactPath(d));
        if (a.length !== b.length || a.some((x, i) => Math.abs(x - b[i]) > 0.0501)) broken.push(`${author}/${file}`);
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("composeIcon", () => {
  const svg = composeIcon({ glyphSvg: GLYPH, color: "#c8372f" });

  it("draws the Cogitator plate around the glyph in the category color", () => {
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 100 100" width="512" height="512">/);
    expect(svg).toContain('fill="#1c2124"');
    expect(svg).toContain('stroke="#c09a48"');
    expect(svg.match(/<circle /g)).toHaveLength(4);
    expect(svg).toContain('<path d="M10 10h20v20z" fill="#c8372f"/>');
    expect(svg).toContain('fill-rule="evenodd"');
    expect(svg).not.toContain("M0 0h512v512H0z");
  });

  it("is deterministic", () => {
    expect(composeIcon({ glyphSvg: GLYPH, color: "#c8372f" })).toBe(svg);
  });

  it("refuses a color outside the design tokens", () => {
    expect(() => composeIcon({ glyphSvg: GLYPH, color: "#123456" })).toThrow();
  });
});

describe("categoryFor", () => {
  it("takes the first category whose rule matches", () => {
    expect(categoryFor({ type: "weapon", system: { weaponType: "pistol" } }, { pack: "equipment" }, categories).key).toBe("weapon-pistol");
    expect(categoryFor({ type: "gear", system: { category: "drug" } }, { pack: "equipment" }, categories).key).toBe("drug");
    expect(categoryFor({ name: "Critical", results: [] }, { pack: "combat-tables" }, categories).key).toBe("table");
  });

  it("matches on pack, actor type and embedded documents", () => {
    const list = [{ key: "vehicle-weapon", color: "#c8372f", glyph: "a/b", match: [{ type: "weapon", parentType: "vehicle" }] }, ...categories];
    expect(categoryFor({ type: "weapon", system: { weaponType: "melee" } }, { pack: "vehicles", parentType: "vehicle" }, list).key).toBe("vehicle-weapon");
    expect(categoryFor({ type: "weapon", system: { weaponType: "melee" } }, { pack: "antagonists", parentType: "npc" }, list).key).toBe("weapon-melee");
    expect(categoryFor({ type: "npc", system: {} }, { pack: "antagonists" }, list).key).toBe("npc");
  });

  it("returns null when nothing matches", () => {
    expect(categoryFor({ type: "spell", system: {} }, { pack: "spells" }, categories)).toBeNull();
  });
});

describe("glyphFor", () => {
  const category = categories[1];
  const curation = { "equipment/weapon/Power Sword": "lorc/energy-sword" };

  it("prefers the curated glyph", () => {
    expect(glyphFor({ key: "equipment/weapon/Power Sword", name: "Power Sword", type: "weapon", category, curation, compendiumGlyphs: {} }))
      .toEqual({ glyph: "lorc/energy-sword", curated: true });
  });

  it("gives an embedded item the glyph of its compendium twin", () => {
    const compendiumGlyphs = { "weapon/Power Sword": "lorc/energy-sword" };
    expect(glyphFor({ key: "antagonists/weapon/Power Sword", name: "Power Sword", type: "weapon", category, curation: {}, compendiumGlyphs }))
      .toEqual({ glyph: "lorc/energy-sword", curated: true });
  });

  it("falls back on the category glyph", () => {
    expect(glyphFor({ key: "equipment/weapon/Club", name: "Club", type: "weapon", category, curation: {}, compendiumGlyphs: {} }))
      .toEqual({ glyph: "lorc/broadsword", curated: false });
  });
});

describe("assignPaths", () => {
  it("shares a file between documents with the same name and glyph, and splits a clash", () => {
    const paths = assignPaths([
      { key: "equipment/weapon/Knife", name: "Knife", category: "weapon-melee", glyph: "lorc/knife", pack: "equipment" },
      { key: "antagonists/weapon/Knife", name: "Knife", category: "weapon-melee", glyph: "lorc/knife", pack: "antagonists" },
      { key: "antagonists/weapon/Bite", name: "Bite", category: "weapon-melee", glyph: "lorc/fangs", pack: "antagonists" },
      { key: "vehicles/weapon/Bite", name: "Bite", category: "weapon-melee", glyph: "lorc/jaws", pack: "vehicles" }
    ]);
    expect(paths.get("equipment/weapon/Knife")).toBe("weapon-melee/knife.svg");
    expect(paths.get("antagonists/weapon/Knife")).toBe("weapon-melee/knife.svg");
    expect(paths.get("antagonists/weapon/Bite")).toBe("weapon-melee/bite.svg");
    expect(paths.get("vehicles/weapon/Bite")).toBe("weapon-melee/bite-vehicles.svg");
  });

  it("is independent of the input order", () => {
    const entries = [
      { key: "vehicles/weapon/Bite", name: "Bite", category: "weapon-melee", glyph: "lorc/jaws", pack: "vehicles" },
      { key: "antagonists/weapon/Bite", name: "Bite", category: "weapon-melee", glyph: "lorc/fangs", pack: "antagonists" }
    ];
    expect(assignPaths(entries)).toEqual(assignPaths([...entries].reverse()));
  });
});

describe("compendium icons (FR-001, FR-011)", () => {
  const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith(".json") ? [path] : [];
  });
  const docs = readdirSync("src/packs").flatMap((pack) => walk(join("src/packs", pack))
    .map((file) => ({ pack, file, doc: JSON.parse(readFileSync(file, "utf8")) })))
    .filter(({ doc }) => !String(doc._key ?? "").startsWith("!folders"));
  const images = docs.flatMap(({ file, doc }) => [
    { file, field: "img", value: doc.img },
    ...(doc.prototypeToken ? [{ file, field: "prototypeToken.texture.src", value: doc.prototypeToken.texture?.src }] : []),
    ...(doc.results ?? []).map((r) => ({ file, field: `results.${r._id}.img`, value: r.img })),
    ...(doc.items ?? []).map((i) => ({ file, field: `items.${i.name}.img`, value: i.img }))
  ]);
  const categories = JSON.parse(readFileSync("src/icons/categories.json", "utf8"));
  const curation = JSON.parse(readFileSync("src/icons/curation.json", "utf8"));

  it("no compendium image is from Foundry, missing or empty", () => {
    const bad = images.filter(({ value }) => !value || !value.startsWith("systems/dtd40k/assets/icons/")
      || !existsSync(value.replace("systems/dtd40k/", "")));
    expect(bad.map(({ file, field, value }) => `${file} ${field} ${value}`)).toEqual([]);
  });

  it("every document and embedded item falls in a category", () => {
    const loose = docs.flatMap(({ pack, file, doc }) => [
      ...(categoryFor(doc, { pack }, categories) ? [] : [file]),
      ...(doc.items ?? []).filter((i) => !categoryFor(i, { pack, parentType: doc.type }, categories)).map((i) => `${file} ${i.name}`)
    ]);
    expect(loose).toEqual([]);
  });

  it("categories use design-token colors and every cited glyph is versioned", () => {
    for (const c of categories) expect(ICON_COLORS[c.color], c.key).toBeDefined();
    const tokens = readFileSync("styles/tokens.css", "utf8").toLowerCase();
    for (const hex of Object.values(ICON_COLORS)) expect(tokens).toContain(hex);
    const glyphs = [...categories.map((c) => c.glyph), ...Object.values(curation)];
    expect(glyphs.filter((g) => !existsSync(`src/icons/glyphs/${g}.svg`))).toEqual([]);
  });
});
