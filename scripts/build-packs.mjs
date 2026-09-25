/**
 * Compile the versioned JSON compendium sources (src/packs/<name>) into the
 * LevelDB packs Foundry reads (packs/<name>). Constitution, principle V.
 * Foundry must be closed while this runs: it locks the LevelDB files.
 */
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { compilePack } from "@foundryvtt/foundryvtt-cli";

const SOURCE_ROOT = "src/packs";
const OUTPUT_ROOT = "packs";

const packs = readdirSync(SOURCE_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

try {
  for (const name of packs) {
    const dest = join(OUTPUT_ROOT, name);
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    await compilePack(join(SOURCE_ROOT, name), dest, { log: true });
    console.log(`Compiled ${name} → ${dest}`);
  }
} catch (error) {
  console.error(`Failed to build packs: ${error.message}`);
  if (/lock|EBUSY|EPERM/i.test(error.message)) {
    console.error("The pack is locked. Close Foundry VTT and run `npm run build:packs` again.");
  }
  process.exit(1);
}
