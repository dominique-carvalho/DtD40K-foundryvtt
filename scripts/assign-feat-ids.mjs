/**
 * Assign stable `_id`, `_key` and `folder` to the Feats compendium sources (src/packs/feats) and
 * write its folder documents (spec 005, research R9). Ids derive from the file name, so running
 * the script again changes nothing; entries that already have an id keep it.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/packs/feats";
const RACES = [
  "Aasimar", "Dark Eldarin", "Dragonborn", "Dryad", "Eldarin", "Elf", "Gnome", "Halfling", "Human", "Kenku", "Kobold",
  "Ork", "Squat", "Tau", "Thri-Kreen", "Tiefling"
];

const slug = (text) => text.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const idFor = (seed, prefix = "dtdF") => prefix + createHash("sha1").update(seed).digest("hex").slice(0, 16 - prefix.length);
const write = (file, doc) => writeFileSync(join(DIR, file), `${JSON.stringify(doc, null, 2)}\n`);

/** Folder documents: the four categories and one sub-folder per race under Racial Feats. */
const folder = (key, name, parent = null, sort = 0) => ({
  _id: idFor(`folder:${key}`, "dtdFld"),
  _key: "",
  name,
  type: "Item",
  folder: parent,
  description: "",
  sorting: "a",
  sort,
  color: null,
  flags: { dtd40k: { featFolder: key } }
});

const folders = {
  feat: folder("feat", "Feats", null, 100000),
  racialFeat: folder("racialFeat", "Racial Feats", null, 200000),
  asset: folder("asset", "Assets", null, 300000),
  hindrance: folder("hindrance", "Hindrances", null, 400000)
};
for (const race of RACES) folders[`race:${race}`] = folder(`race:${race}`, race, folders.racialFeat._id);

for (const [key, doc] of Object.entries(folders)) {
  doc._key = `!folders!${doc._id}`;
  write(`folder-${slug(key.replace("race:", "racial-"))}.json`, doc);
}

let count = 0;
for (const file of readdirSync(DIR).filter((name) => name.endsWith(".json") && !name.startsWith("folder-"))) {
  const doc = JSON.parse(readFileSync(join(DIR, file), "utf8"));
  const { category, prerequisites } = doc.system;
  const target = category === "racialFeat" ? folders[`race:${prerequisites.race}`] : folders[category];
  if (!target) throw new Error(`${file}: no folder for category "${category}" / race "${prerequisites?.race}"`);
  doc._id ||= idFor(`feat:${file}`);
  doc._key = `!items!${doc._id}`;
  doc.folder = target._id;
  write(file, doc);
  count++;
}
console.log(`Assigned ${count} feats to ${Object.keys(folders).length} folders.`);
