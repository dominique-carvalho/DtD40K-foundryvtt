import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Setting compendium (spec 028, contracts/setting-pack.md): structure, GM-only adventure seeds, links into the
 * system's compendiums and the size of each block.
 */

const DIR = "src/packs/setting";
const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith(".json")) : [];
const docs = files.map((f) => JSON.parse(readFileSync(join(DIR, f), "utf8")));
const folders = docs.filter((d) => d._key?.startsWith("!folders!"));
const journals = docs.filter((d) => d._key?.startsWith("!journal!"));
const pages = journals.flatMap((j) => (j.pages ?? []).map((p) => ({ journal: j, page: p })));

const SPHERES = [
  "Abyss", "Acheron", "Arborea", "Arcadia", "Baator", "Beastlands", "Bytopia", "Carceri", "Commorragh", "Elysium",
  "Gehenna", "Mechanus", "Mount Celestia", "Pandemonium", "The Grey Waste"
];
const SPHERE_PAGES = ["Physical Conditions", "Inhabitants", "Locations", "Adventure Seeds"];
const SECRET = /<section class="secret"[^>]*>[\s\S]*?<\/section>/g;

/** Ids of the documents of another pack. */
const packIds = (pack) => new Set(readdirSync(join("src/packs", pack)).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join("src/packs", pack, f), "utf8"))._id));

describe("setting compendium structure (FR-001, FR-002, FR-004)", () => {
  it("has 4 journal folders and 18 journals, each in one of them", () => {
    expect(folders.map((f) => f.type)).toEqual(Array(4).fill("JournalEntry"));
    expect(journals).toHaveLength(18);
    const ids = new Set(folders.map((f) => f._id));
    for (const j of journals) expect(ids.has(j.folder), j.name).toBe(true);
  });

  it("has the 15 crystal spheres, each with its 4 pages in order", () => {
    const spheres = journals.filter((j) => j.flags?.dtd40k?.setting?.kind === "sphere");
    expect(spheres.map((j) => j.name).sort()).toEqual([...SPHERES].sort());
    for (const s of spheres) expect([...s.pages].sort((a, b) => a.sort - b.sort).map((p) => p.name), s.name).toEqual(SPHERE_PAGES);
  });

  it("has Sigil with its overview, the Lady of Pain, the factions and locations", () => {
    const sigil = journals.find((j) => j.name === "Sigil");
    expect(sigil.pages.map((p) => p.name)).toEqual(["Overview", "The Lady of Pain", "Factions", "Locations"]);
  });

  it("uses the CLI keys and unique ids", () => {
    const ids = [...docs.map((d) => d._id), ...pages.map(({ page }) => page._id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const { journal, page } of pages) {
      expect(page._key).toBe(`!journal.pages!${journal._id}.${page._id}`);
      expect(page.type).toBe("text");
      expect(page.text.format).toBe(1);
    }
    for (const d of journals) expect(d._key).toBe(`!journal!${d._id}`);
  });
});

describe("adventure seeds only for the GM (FR-003)", () => {
  it("keeps every seed in a secret block after a public notice", () => {
    for (const { journal, page } of pages) {
      const html = page.text.content;
      if (page.name === "Adventure Seeds") {
        expect(html.match(SECRET), journal.name).toHaveLength(1);
        const outside = html.replace(SECRET, "").trim();
        expect(outside, journal.name).toMatch(/^<p>[^<]*Story Master only[^<]*<\/p>$/);
      } else {
        expect(html, `${journal.name} / ${page.name}`).not.toMatch(/class="secret"/);
      }
    }
  });
});

describe("links into the system's compendiums (FR-006)", () => {
  const targets = { deities: packIds("deities"), races: packIds("races"), exaltations: packIds("exaltations") };

  it("point to existing documents, at most once per page", () => {
    const links = pages.flatMap(({ journal, page }) => [...page.text.content.matchAll(/@UUID\[Compendium\.dtd40k\.([\w-]+)\.Item\.(\w+)\]/g)]
      .map((m) => ({ where: `${journal.name} / ${page.name}`, pack: m[1], id: m[2] })));
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) expect(targets[l.pack]?.has(l.id), `${l.where} ${l.pack} ${l.id}`).toBe(true);
    const seen = new Set();
    for (const l of links) {
      const key = `${l.where}|${l.id}`;
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
    }
  });
});

describe("short reference text (FR-005)", () => {
  it("keeps each block to at most 2 paragraphs", () => {
    for (const { journal, page } of pages) {
      if (page.name === "Factions") continue;
      const html = page.text.content.replace(SECRET, (s) => s.replace(/<\/?section[^>]*>/g, "")).replace(/^<p>[^<]*Story Master only[^<]*<\/p>/, "");
      const paragraphs = (html.match(/<p>/g) ?? []).length;
      expect(paragraphs, `${journal.name} / ${page.name}`).toBeGreaterThan(0);
      expect(paragraphs, `${journal.name} / ${page.name}`).toBeLessThanOrEqual(2);
    }
  });
});
