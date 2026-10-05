/**
 * Suggest game-icons.net glyphs for the compendium documents (spec 024, research R4). Development aid for the
 * curation: matches the words of each name (and a few setting synonyms) against the glyph names and writes the best
 * candidates to src/icons/suggestions.json (not versioned). The choices themselves go into src/icons/curation.json.
 *
 *   npm run icons:suggest [-- <pack> ...]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { categoryFor } from "./lib/icons.mjs";

const SYNONYMS = {
  pistol: ["pistol", "revolver", "gun"], autopistol: ["pistol", "gun"], lasgun: ["laser", "rifle", "blaster"], laspistol: ["laser", "pistol", "blaster"],
  bolter: ["bullets", "rifle", "gun"], bolt: ["bullets"], plasma: ["plasma", "energy"], melta: ["fire", "heat", "flame"], flamer: ["flamethrower", "fire"],
  shotgun: ["shotgun"], autogun: ["rifle", "machine-gun"], sniper: ["sniper", "rifle"], launcher: ["rocket", "launcher", "bazooka"], missile: ["missile", "rocket"],
  grenade: ["grenade"], knife: ["knife", "dagger"], chainsword: ["chainsaw", "sword"], chain: ["chainsaw"], power: ["energy", "lightning"], axe: ["axe"],
  hammer: ["hammer"], maul: ["hammer", "mace"], spear: ["spear"], lance: ["lance", "spear"], whip: ["whip"], shield: ["shield"], fist: ["fist", "punch"],
  armor: ["armor", "breastplate"], helmet: ["helm"], drug: ["pill", "syringe", "potion"], stimm: ["syringe"], medkit: ["medical", "first-aid"],
  eye: ["eye"], arm: ["arm"], leg: ["leg"], heart: ["heart"], brain: ["brain"], lung: ["lungs"], fire: ["fire", "flame"], ice: ["ice", "frozen"],
  lightning: ["lightning"], heal: ["heal", "health"], death: ["death", "skull"], shadow: ["shadow"], mind: ["brain", "mind"], teleport: ["teleport", "portal"],
  summon: ["summon", "portal"], illusion: ["mask", "illusion"], ward: ["shield", "barrier"], blood: ["blood"], poison: ["poison"], hull: ["spaceship"],
  engine: ["engine"], wheels: ["wheel"], tracks: ["tank-tread"], wings: ["wing"], cockpit: ["steering-wheel"], sensor: ["radar"], torpedo: ["torpedo", "missile"]
};

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : path.endsWith(".json") ? [path] : [];
});
const index = JSON.parse(readFileSync("src/icons/glyph-index.json", "utf8"));
const categories = JSON.parse(readFileSync("src/icons/categories.json", "utf8"));
const only = process.argv.slice(2);

const words = (name) => String(name).toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]+/g, " ").split(" ").filter((w) => w.length > 2);

/** Glyphs scored by how many of the words (and synonyms) their name contains. */
function candidates(name) {
  const terms = words(name).flatMap((w) => [w, ...(SYNONYMS[w] ?? [])]);
  return index.map((glyph) => {
    const parts = glyph.split("/")[1].split("-");
    const score = terms.reduce((sum, t) => sum + (parts.includes(t) ? 2 : parts.some((p) => p.startsWith(t) || t.startsWith(p) && p.length > 3) ? 1 : 0), 0);
    return { glyph, score };
  }).filter((c) => c.score > 0).sort((a, b) => b.score - a.score || a.glyph.localeCompare(b.glyph)).slice(0, 8).map((c) => c.glyph);
}

const out = {};
for (const pack of readdirSync("src/packs").filter((p) => !only.length || only.includes(p))) {
  for (const file of walk(join("src/packs", pack))) {
    const doc = JSON.parse(readFileSync(file, "utf8"));
    if (String(doc._key ?? "").startsWith("!folders")) continue;
    const type = Array.isArray(doc.results) ? "table" : doc.type;
    out[`${pack}/${type}/${doc.name}`] = { category: categoryFor(doc, { pack }, categories)?.key, candidates: candidates(doc.name) };
    for (const item of doc.items ?? []) {
      out[`${pack}/${item.type}/${item.name}`] ??= { category: categoryFor(item, { pack, parentType: doc.type }, categories)?.key, candidates: candidates(item.name) };
    }
  }
}
writeFileSync("src/icons/suggestions.json", `${JSON.stringify(out, null, 1)}\n`);
console.log(`Suggestions for ${Object.keys(out).length} documents in src/icons/suggestions.json.`);
