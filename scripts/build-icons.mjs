/**
 * Build the compendium icons (spec 024, research R5–R6, contracts/icon-pipeline.md). Offline and idempotent.
 * - Resolves the category and glyph of every document of src/packs (and of the items embedded in actors).
 * - Writes the Cogitator plates in assets/icons/<category>/<slug>.svg and the per-type defaults in assets/icons/defaults.
 * - Points `img` (and the prototype token of actors, and the results of tables) at them in the JSON sources.
 * - Writes CREDITS.md and src/icons/uncurated.json (documents left with their category glyph).
 * Run before `npm run build:packs`.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { ICON_COLORS, assignPaths, categoryFor, composeIcon, glyphFor } from "./lib/icons.mjs";

const PACKS = "src/packs";
const ICONS = "src/icons";
const OUT = "assets/icons";
const URL_ROOT = "systems/dtd40k/assets/icons";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : path.endsWith(".json") ? [path] : [];
});

const categories = readJson(join(ICONS, "categories.json")).map((c) => ({ ...c, hex: ICON_COLORS[c.color] }));
const curation = existsSync(join(ICONS, "curation.json")) ? readJson(join(ICONS, "curation.json")) : {};
const errors = [];
for (const c of categories) if (!c.hex) errors.push(`Category ${c.key}: unknown color ${c.color}`);

/** Every pack document, with its file, pack and line ending. */
const files = readdirSync(PACKS).flatMap((pack) => walk(join(PACKS, pack)).map((file) => {
  const text = readFileSync(file, "utf8");
  return { file, pack, text, eol: text.includes("\r\n") ? "\r\n" : "\n", doc: JSON.parse(text) };
})).filter(({ doc }) => !String(doc._key ?? "").startsWith("!folders"));

const typeOf = (doc) => (Array.isArray(doc.results) ? "table" : doc.type);
const keyOf = (pack, doc) => `${pack}/${typeOf(doc)}/${doc.name}`;

// Curated glyphs of the top-level items, for their embedded twins (FR-005).
const compendiumGlyphs = {};
for (const { pack, doc } of files) {
  const glyph = curation[keyOf(pack, doc)];
  if (glyph && !doc.items) compendiumGlyphs[`${doc.type}/${doc.name}`] ??= glyph;
}

/** Resolve one document into an entry; collects errors. */
function entryFor(doc, pack, parentType) {
  const category = categoryFor(doc, { pack, parentType }, categories);
  const key = keyOf(pack, doc);
  if (!category) {
    errors.push(`No category: ${key}${parentType ? ` (in a ${parentType})` : ""}`);
    return null;
  }
  const { glyph, curated } = glyphFor({ key, name: doc.name, type: typeOf(doc), category, curation, compendiumGlyphs });
  return { key, name: doc.name, category: category.key, hex: category.hex, glyph, curated, pack };
}

const entries = new Map();
for (const { pack, doc } of files) {
  const entry = entryFor(doc, pack);
  if (entry) entries.set(entry.key, entry);
  for (const item of doc.items ?? []) {
    const embedded = entryFor(item, pack, doc.type);
    if (embedded && !entries.has(embedded.key)) entries.set(embedded.key, embedded);
  }
}
for (const key of Object.keys(curation)) if (!entries.has(key)) errors.push(`Curation entry without a document: ${key}`);

const glyphCache = new Map();
function glyphSvg(glyph) {
  if (!glyphCache.has(glyph)) {
    const path = join(ICONS, "glyphs", `${glyph}.svg`);
    glyphCache.set(glyph, existsSync(path) ? readFileSync(path, "utf8") : null);
    if (!existsSync(path)) errors.push(`Missing glyph ${glyph} (run npm run icons:fetch)`);
  }
  return glyphCache.get(glyph);
}
for (const entry of entries.values()) glyphSvg(entry.glyph);
for (const c of categories) glyphSvg(c.glyph);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

// Icon files: compendium documents and per-category defaults.
const paths = assignPaths([...entries.values()]);
const wanted = new Map();
for (const entry of entries.values()) wanted.set(paths.get(entry.key), { glyph: entry.glyph, hex: entry.hex });
for (const c of categories) if (c.defaultFor?.length) wanted.set(`defaults/${c.key}.svg`, { glyph: c.glyph, hex: c.hex });

let written = 0;
for (const [path, { glyph, hex }] of wanted) {
  const file = join(OUT, path);
  const svg = composeIcon({ glyphSvg: glyphSvg(glyph), color: hex });
  if (existsSync(file) && readFileSync(file, "utf8") === svg) continue;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg);
  written += 1;
}
// Stale icons (renamed or removed documents).
let removed = 0;
if (existsSync(OUT)) {
  for (const file of readdirSync(OUT, { recursive: true }).map((p) => join(OUT, String(p))).filter((p) => p.endsWith(".svg"))) {
    if (!wanted.has(relative(OUT, file).replaceAll("\\", "/"))) {
      rmSync(file);
      removed += 1;
    }
  }
}

// Point the documents at their icons.
const urlOf = (key) => `${URL_ROOT}/${paths.get(key)}`;
let updated = 0;
for (const { file, pack, text, eol, doc } of files) {
  const img = urlOf(keyOf(pack, doc));
  doc.img = img;
  if (doc.prototypeToken) doc.prototypeToken.texture = { ...(doc.prototypeToken.texture ?? {}), src: img };
  for (const result of doc.results ?? []) result.img = img;
  for (const item of doc.items ?? []) item.img = urlOf(keyOf(pack, item));
  const out = JSON.stringify(doc, null, 2).replaceAll("\n", eol) + eol;
  if (out === text) continue;
  writeFileSync(file, out);
  updated += 1;
}

// Credits (FR-008): every author whose glyphs are used.
const license = readFileSync(join(ICONS, "glyphs", "LICENSE.txt"), "utf8");
const people = [...license.matchAll(/^- ([^,\n]+?)(?:, (\S+))?(?: - (CC0))?\s*$/gm)].map(([, name, url, cc0]) => ({ name, url, cc0: Boolean(cc0) }));
const squash = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const authors = [...new Set([...wanted.values()].map(({ glyph }) => glyph.split("/")[0]))].sort().map((slug) => {
  const person = people.find((p) => squash(p.name) === squash(slug)) ?? people.find((p) => squash(slug).startsWith(squash(p.name)));
  return { slug, name: person?.name ?? slug, url: person?.url ?? "", license: person?.cc0 ? "CC0" : "CC BY 3.0" };
});
const credits = [
  "# Credits",
  "",
  "## Icons",
  "",
  "The compendium icons combine a plate drawn for Dungeons the Dragoning 40K (the Scriptorium Machina design system)",
  "with glyphs from [game-icons.net](https://game-icons.net), recolored. Icons made by:",
  "",
  ...authors.map((a) => `- ${a.url ? `[${a.name}](${a.url})` : a.name} — ${a.license}`),
  "",
  "The glyphs are licensed under [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/)",
  "(CC0 where noted). Their original files are in `src/icons/glyphs`.",
  ""
].join("\n");
writeFileSync("CREDITS.md", credits);

const uncurated = [...entries.values()].filter((e) => !e.curated).map((e) => e.key).sort();
writeFileSync(join(ICONS, "uncurated.json"), `${JSON.stringify(uncurated, null, 1)}\n`);

const total = entries.size;
console.log(`${total} documents, ${total - uncurated.length} with their own glyph (${Math.round(((total - uncurated.length) / total) * 100)}%).`);
console.log(`${wanted.size} icons (${written} written, ${removed} removed); ${updated} pack file(s) updated.`);
