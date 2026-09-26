/**
 * Assign stable `_id`, `_key` and `folder` to compendium sources and write their folder documents
 * (spec 005 research R9, spec 006 research R9). Ids derive from the file name, so running the
 * script again changes nothing; entries that already have an id keep it.
 *
 *   node scripts/assign-pack-ids.mjs --pack feats
 *   node scripts/assign-pack-ids.mjs --pack classes
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RACES = [
  "Aasimar", "Dark Eldarin", "Dragonborn", "Dryad", "Eldarin", "Elf", "Gnome", "Halfling", "Human", "Kenku", "Kobold",
  "Ork", "Squat", "Tau", "Thri-Kreen", "Tiefling"
];

/** Class tracks of the 7.7a (pp. 107–110), in book order; "Other" holds starter and starship classes. */
const TRACKS = [
  "Assassin", "Arcane Knight", "Barbarian", "Bard", "Cleric", "Courtier", "Druid", "Fighter", "Guardsman", "Heavy",
  "Magic User", "Magitek Gunman", "Monk", "Operator", "Paladin", "Sheriff", "Techpriest", "Thief"
];

const slug = (text) => text.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const idFor = (seed, prefix) => prefix + createHash("sha1").update(seed).digest("hex").slice(0, 16 - prefix.length);

/** Folder document; `seed` keeps the ids of the feats pack unchanged. */
const folder = (seed, prefix, key, name, parent = null, sort = 0, flag = "featFolder") => ({
  _id: idFor(seed, prefix),
  _key: "",
  name,
  type: "Item",
  folder: parent,
  description: "",
  sorting: "a",
  sort,
  color: null,
  flags: { dtd40k: { [flag]: key } }
});

/** Pack layouts: folders, the folder file name of each, the folder of each entry and the id seed. */
const LAYOUTS = {
  feats: () => {
    const folders = {
      feat: folder("folder:feat", "dtdFld", "feat", "Feats", null, 100000),
      racialFeat: folder("folder:racialFeat", "dtdFld", "racialFeat", "Racial Feats", null, 200000),
      asset: folder("folder:asset", "dtdFld", "asset", "Assets", null, 300000),
      hindrance: folder("folder:hindrance", "dtdFld", "hindrance", "Hindrances", null, 400000)
    };
    for (const race of RACES) {
      folders[`race:${race}`] = folder(`folder:race:${race}`, "dtdFld", `race:${race}`, race, folders.racialFeat._id);
    }
    return {
      folders,
      fileOf: (key) => `folder-${slug(key.replace("race:", "racial-"))}.json`,
      folderOf: ({ system }) => (system.category === "racialFeat" ? folders[`race:${system.prerequisites.race}`] : folders[system.category]),
      seed: (file) => `feat:${file}`,
      prefix: "dtdF"
    };
  },
  classes: () => {
    const folders = {};
    TRACKS.forEach((track, index) => {
      folders[track] = folder(`class-folder:${track}`, "dtdCFd", track, track, null, (index + 1) * 10000, "classFolder");
    });
    folders.Other = folder("class-folder:Other", "dtdCFd", "Other", "Other Classes", null, 990000, "classFolder");
    return {
      folders,
      fileOf: (key) => `folder-${slug(key)}.json`,
      folderOf: ({ system }) => folders[system.track || "Other"],
      seed: (file) => `class:${file}`,
      prefix: "dtdC"
    };
  }
};

const pack = process.argv[process.argv.indexOf("--pack") + 1];
if (!LAYOUTS[pack]) {
  console.error(`Usage: node scripts/assign-pack-ids.mjs --pack <${Object.keys(LAYOUTS).join("|")}>`);
  process.exit(1);
}
const DIR = join("src/packs", pack);
const layout = LAYOUTS[pack]();
const write = (file, doc) => writeFileSync(join(DIR, file), `${JSON.stringify(doc, null, 2)}\n`);

for (const [key, doc] of Object.entries(layout.folders)) {
  doc._key = `!folders!${doc._id}`;
  write(layout.fileOf(key), doc);
}

let count = 0;
for (const file of readdirSync(DIR).filter((name) => name.endsWith(".json") && !name.startsWith("folder-"))) {
  const doc = JSON.parse(readFileSync(join(DIR, file), "utf8"));
  const target = layout.folderOf(doc);
  if (!target) throw new Error(`${file}: no folder for this entry`);
  doc._id ||= idFor(layout.seed(file), layout.prefix);
  doc._key = `!items!${doc._id}`;
  doc.folder = target._id;
  write(file, doc);
  count++;
}
console.log(`Assigned ${count} ${pack} entries to ${Object.keys(layout.folders).length} folders.`);
