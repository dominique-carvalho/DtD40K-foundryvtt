/**
 * Download the game-icons.net glyphs the icon pipeline needs (spec 024, research R1). Development tool: the only step
 * that uses the network; the glyphs it saves are versioned, so `npm run build:icons` works offline.
 *
 *   npm run icons:fetch             download the glyphs cited in categories.json and curation.json that are missing
 *   npm run icons:fetch -- --index  refresh src/icons/glyph-index.json and the license file from the repository
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const REPO = "game-icons/icons";
const RAW = `https://raw.githubusercontent.com/${REPO}/master`;
const ROOT = "src/icons";
const GLYPHS = join(ROOT, "glyphs");

const readJson = (path, fallback) => (existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback);

async function get(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

/** Names of every glyph in the repository ("author/name") and its license file. */
async function refreshIndex() {
  const tree = JSON.parse(await get(`https://api.github.com/repos/${REPO}/git/trees/master?recursive=1`));
  const names = tree.tree.map((entry) => entry.path).filter((path) => /^[^/]+\/[^/]+\.svg$/.test(path))
    .map((path) => path.replace(/\.svg$/, "")).sort();
  writeFileSync(join(ROOT, "glyph-index.json"), `${JSON.stringify(names, null, 1)}\n`);
  mkdirSync(GLYPHS, { recursive: true });
  writeFileSync(join(GLYPHS, "LICENSE.txt"), await get(`${RAW}/license.txt`));
  console.log(`Indexed ${names.length} glyphs.`);
}

/** Every glyph cited by the categories and the curation. */
function citedGlyphs() {
  const categories = readJson(join(ROOT, "categories.json"), []);
  const curation = readJson(join(ROOT, "curation.json"), {});
  return [...new Set([...categories.map((c) => c.glyph), ...Object.values(curation)])].sort();
}

async function fetchMissing() {
  const index = new Set(readJson(join(ROOT, "glyph-index.json"), []));
  const unknown = [];
  let fetched = 0;
  for (const glyph of citedGlyphs()) {
    const file = join(GLYPHS, `${glyph}.svg`);
    if (existsSync(file)) continue;
    if (index.size && !index.has(glyph)) {
      unknown.push(glyph);
      continue;
    }
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, await get(`${RAW}/${glyph}.svg`));
    fetched += 1;
  }
  console.log(`Fetched ${fetched} glyph(s).`);
  if (unknown.length) {
    console.error(`Not in the repository: ${unknown.join(", ")}`);
    process.exit(1);
  }
}

try {
  if (process.argv.includes("--index")) await refreshIndex();
  else await fetchMissing();
} catch (error) {
  console.error(`Failed to fetch glyphs: ${error.message}`);
  process.exit(1);
}
