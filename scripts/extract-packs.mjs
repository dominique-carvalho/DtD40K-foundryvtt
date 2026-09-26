/**
 * Export the compiled LevelDB packs (packs/<name>) back to the versioned JSON sources
 * (src/packs/<name>), so edits made in Foundry with the compendium unlocked can be
 * reviewed and committed. Inverse of build-packs.mjs. Foundry must be closed.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { extractPack } from "@foundryvtt/foundryvtt-cli";

const PACK_ROOT = "packs";
const SOURCE_ROOT = "src/packs";

/** Stable file name: keep the existing file for a known _id, else slugify the name. */
function nameResolver(sourceDir) {
  const byId = new Map();
  if (existsSync(sourceDir)) {
    for (const file of readdirSync(sourceDir).filter((f) => f.endsWith(".json"))) {
      const { _id } = JSON.parse(readFileSync(join(sourceDir, file), "utf8"));
      byId.set(_id, file);
    }
  }
  const slug = (name) => name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (doc) => byId.get(doc._id) ?? `${slug(doc.name)}.json`;
}

const packs = existsSync(PACK_ROOT)
  ? readdirSync(PACK_ROOT, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  : [];

try {
  for (const name of packs) {
    const dest = join(SOURCE_ROOT, name);
    await extractPack(join(PACK_ROOT, name), dest, {
      log: true,
      transformName: nameResolver(dest),
      // Drop Foundry bookkeeping so diffs only show content changes.
      transformEntry: (entry) => {
        delete entry._stats;
      }
    });
    console.log(`Extracted ${join(PACK_ROOT, name)} → ${dest}`);
  }
} catch (error) {
  console.error(`Failed to extract packs: ${error.message}`);
  if (/lock|EBUSY|EPERM/i.test(error.message)) {
    console.error("The pack is locked. Close Foundry VTT and run `npm run extract:packs` again.");
  }
  process.exit(1);
}
