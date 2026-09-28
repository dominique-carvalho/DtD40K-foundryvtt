/**
 * Assign stable `_id`, `_key` and `folder` to compendium sources and write their folder documents
 * (spec 005 research R9, spec 006 research R9). Ids derive from the file name, so running the
 * script again changes nothing; entries that already have an id keep it.
 *
 *   node scripts/assign-pack-ids.mjs --pack feats
 *   node scripts/assign-pack-ids.mjs --pack classes
 *   node scripts/assign-pack-ids.mjs --pack equipment
 *   node scripts/assign-pack-ids.mjs --pack combat-tables
 *   node scripts/assign-pack-ids.mjs --pack spells
 *   node scripts/assign-pack-ids.mjs --pack martial-schools
 *   node scripts/assign-pack-ids.mjs --pack deities
 *   node scripts/assign-pack-ids.mjs --pack antagonists
 *   node scripts/assign-pack-ids.mjs --pack vehicle-components
 *   node scripts/assign-pack-ids.mjs --pack vehicles
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

/** Weapon tables and their groups (7.7a pp. 323–327), in book order (spec 007). */
const WEAPON_TABLES = {
  Guns: ["Ordinary", "Las", "Plasma", "Melta", "Bolter", "Syrneth", "Exotic", "Flamer"],
  "Other Ranged": ["Primitive", "Launchers", "Grenades and Missiles"],
  Melee: ["Ordinary", "Parrying", "Cavalry", "Flail", "Fencing", "Two Handed", "Syrneth", "Chain", "Shields", "Unarmed"]
};

/** Top folders of the equipment pack and the gear category of each (artifacts get subfolders). */
const EQUIPMENT_FOLDERS = ["Weapons", "Armor", "Gear", "Cybernetics", "Drugs", "Artifacts"];
const GEAR_FOLDER = { gear: "Gear", cybernetic: "Cybernetics", drug: "Drugs" };
const ARTIFACT_FOLDERS = { material: "Materials", wonder: "Wonders", hearthstone: "Hearthstones" };

/** Weapon table of a weapon entry. */
const weaponTable = ({ weaponType, group }) => {
  if (weaponType === "melee") return "Melee";
  return WEAPON_TABLES["Other Ranged"].includes(group) ? "Other Ranged" : "Guns";
};

const slug = (text) => text.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const idFor = (seed, prefix) => prefix + createHash("sha1").update(seed).digest("hex").slice(0, 16 - prefix.length);

/** Folder document; `seed` keeps the ids of the feats pack unchanged. */
const folder = (seed, prefix, key, name, parent = null, sort = 0, flag = "featFolder", type = "Item") => ({
  _id: idFor(seed, prefix),
  _key: "",
  name,
  type,
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
  },
  equipment: () => {
    const folders = {};
    const add = (key, name, parent = null, sort = 0) => {
      folders[key] = folder(`equipment-folder:${key}`, "dtdEFd", key, name, parent ? folders[parent]._id : null, sort, "equipmentFolder");
    };
    EQUIPMENT_FOLDERS.forEach((name, index) => add(name, name, null, (index + 1) * 100000));
    Object.entries(WEAPON_TABLES).forEach(([table, groups], index) => {
      add(`Weapons/${table}`, table, "Weapons", (index + 1) * 10000);
      groups.forEach((group, g) => add(`Weapons/${table}/${group}`, group, `Weapons/${table}`, (g + 1) * 1000));
    });
    Object.values(ARTIFACT_FOLDERS).forEach((name, index) => add(`Artifacts/${name}`, name, "Artifacts", (index + 1) * 10000));
    return {
      folders,
      fileOf: (key) => `folder-${slug(key)}.json`,
      folderOf: ({ type, system }) => {
        if (type === "weapon") return folders[`Weapons/${weaponTable(system)}/${system.group}`];
        if (type === "armor") return folders.Armor;
        return folders[GEAR_FOLDER[system.category]] ?? folders[`Artifacts/${ARTIFACT_FOLDERS[system.category]}`];
      },
      seed: (file) => `equipment:${file}`,
      prefix: "dtdE"
    };
  },
  // RollTables of chapter XVII (spec 008): critical effects, Shock Table, Mental Traumas.
  "combat-tables": () => {
    const folders = {
      critical: folder("table-folder:critical", "dtdTFd", "critical", "Critical Damage", null, 100000, "tableFolder", "RollTable"),
      mental: folder("table-folder:mental", "dtdTFd", "mental", "Fear and Insanity", null, 200000, "tableFolder", "RollTable"),
      // Psychic Phenomena and Perils of the Warp (spec 009).
      warp: folder("table-folder:warp", "dtdTFd", "warp", "Warp", null, 300000, "tableFolder", "RollTable"),
      // Degeneration (spec 011).
      alignment: folder("table-folder:alignment", "dtdTFd", "alignment", "Alignment", null, 400000, "tableFolder", "RollTable")
    };
    return {
      folders,
      fileOf: (key) => `folder-${slug(key)}.json`,
      folderOf: ({ flags }) => {
        const kind = flags?.dtd40k?.table?.kind;
        if (kind === "critical") return folders.critical;
        if (kind === "degeneration") return folders.alignment;
        return ["phenomena", "perils"].includes(kind) ? folders.warp : folders.mental;
      },
      seed: (file) => `table:${file}`,
      prefix: "dtdT",
      collection: "tables"
    };
  },
  // Spells of chapter VIII (spec 009): one folder per Magic School.
  spells: () => {
    const schools = ["Abjuration", "Conjuration", "Divination", "Enchantment", "Evocation", "Healing", "Illusion", "Necromancy", "Transmutation"];
    const folders = Object.fromEntries(schools.map((name, index) => [name.toLowerCase(),
      folder(`spell-folder:${name}`, "dtdSFd", name.toLowerCase(), name, null, (index + 1) * 10000, "spellFolder")]));
    return {
      folders,
      fileOf: (key) => `folder-${slug(key)}.json`,
      folderOf: ({ system }) => folders[system.school],
      seed: (file) => `spell:${file}`,
      prefix: "dtdS"
    };
  },
  // Sword Schools and Gun Kata of chapters IX–X (spec 010): one folder per kind.
  "martial-schools": () => {
    const folders = {
      sword: folder("martial-folder:sword", "dtdMFd", "sword", "Sword Schools", null, 10000, "martialFolder"),
      gunKata: folder("martial-folder:gunKata", "dtdMFd", "gunKata", "Gun Kata", null, 20000, "martialFolder")
    };
    return {
      folders,
      fileOf: (key) => `folder-${slug(key)}.json`,
      folderOf: ({ system }) => folders[system.kind],
      seed: (file) => `martial:${file}`,
      prefix: "dtdM"
    };
  },
  // Deities of chapter XII (spec 011): one folder per pantheon.
  deities: () => {
    const folders = {
      ruinousPowers: folder("deity-folder:ruinousPowers", "dtdDFd", "ruinousPowers", "Ruinous Powers", null, 10000, "deityFolder"),
      blessedPantheon: folder("deity-folder:blessedPantheon", "dtdDFd", "blessedPantheon", "Blessed Pantheon", null, 20000, "deityFolder"),
      grayCouncil: folder("deity-folder:grayCouncil", "dtdDFd", "grayCouncil", "Gray Council", null, 30000, "deityFolder")
    };
    return {
      folders,
      fileOf: (key) => `folder-${slug(key)}.json`,
      folderOf: ({ system }) => folders[system.pantheon],
      seed: (file) => `deity:${file}`,
      prefix: "dtdD"
    };
  },
  // Antagonists of chapter XX (spec 012): NPCs by category and the Minion Squads; weapons embedded.
  antagonists: () => {
    const names = { people: "People", military: "Military", criminals: "Criminals", cultists: "Cultists", machines: "Machines",
      daemons: "Daemons", creatures: "Creatures", legends: "Legends", undead: "Undead", xenos: "Xenos", minions: "Minion Squads" };
    const folders = Object.fromEntries(Object.entries(names).map(([key, name], index) => [key,
      folder(`npc-folder:${key}`, "dtdNFd", key, name, null, (index + 1) * 10000, "npcFolder", "Actor")]));
    return {
      folders,
      fileOf: (key) => `folder-${slug(key)}.json`,
      folderOf: (doc) => folders[doc.type === "minionSquad" ? "minions" : doc.system.npc.category],
      seed: (file) => `npc:${file}`,
      prefix: "dtdN",
      collection: "actors"
    };
  },
  // Vehicle components and weapons of chapter XV (spec 013): one folder per category.
  "vehicle-components": () => {
    const names = { drivetrain: "Drivetrains", frame: "Frames", armor: "Armor", control: "Control Systems",
      accommodation: "Accommodations", accessory: "Accessories", modification: "Modifications", weapon: "Weapons" };
    const folders = Object.fromEntries(Object.entries(names).map(([key, name], index) => [key,
      folder(`vehicle-folder:${key}`, "dtdVFd", key, name, null, (index + 1) * 10000, "vehicleFolder")]));
    return {
      folders,
      fileOf: (key) => `folder-${slug(key)}.json`,
      // Weapons and their ammunition/modes go to the Weapons folder.
      folderOf: (doc) => folders[doc.type === "weapon" || doc.system.category === "weaponUpgrade" ? "weapon" : doc.system.category],
      seed: (file) => `vcomp:${file}`,
      prefix: "dtdV"
    };
  },
  // Example vehicles of chapter XV (spec 013), components and weapons embedded.
  vehicles: () => {
    const folders = { vehicles: folder("vehicles-folder:all", "dtdWFd", "vehicles", "Example Vehicles", null, 10000, "vehicleFolder", "Actor") };
    return {
      folders,
      fileOf: (key) => `folder-${slug(key)}.json`,
      folderOf: () => folders.vehicles,
      seed: (file) => `vehicle:${file}`,
      prefix: "dtdW",
      collection: "actors"
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
  const collection = layout.collection ?? "items";
  doc._key = `!${collection}!${doc._id}`;
  doc.folder = target._id;
  // Embedded Active Effects are packed as their own LevelDB entries (spec 007: equipment effects).
  (doc.effects ?? []).forEach((effect, index) => {
    effect._id ||= idFor(`${layout.seed(file)}:effect:${index}`, "dtdEf");
    effect._key = `!items.effects!${doc._id}.${effect._id}`;
  });
  // Items embedded in Actors (spec 012: NPC weapons).
  if (collection === "actors") {
    (doc.items ?? []).forEach((item, index) => {
      item._id ||= idFor(`${layout.seed(file)}:item:${index}`, "dtdNi");
      item._key = `!actors.items!${doc._id}.${item._id}`;
    });
  }
  // Table results, likewise (spec 008).
  (doc.results ?? []).forEach((result, index) => {
    result._id ||= idFor(`${layout.seed(file)}:result:${index}`, "dtdTr");
    result._key = `!tables.results!${doc._id}.${result._id}`;
  });
  write(file, doc);
  count++;
}
console.log(`Assigned ${count} ${pack} entries to ${Object.keys(layout.folders).length} folders.`);
