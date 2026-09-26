/**
 * Compile the versioned JSON compendium sources (src/packs/<name>) into the
 * LevelDB packs Foundry reads (packs/<name>). Constitution, principle V.
 *
 * Foundry keeps a lock on every pack of the running world (and sometimes after the
 * world is closed). The script checks that lock first and never touches a pack it
 * cannot replace; each pack is compiled into a temporary folder and swapped in only
 * when compilation succeeded.
 */
import { closeSync, existsSync, openSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { compilePack } from "@foundryvtt/foundryvtt-cli";

const SOURCE_ROOT = "src/packs";
const OUTPUT_ROOT = "packs";

/**
 * Whether another process (Foundry) holds the LevelDB lock of a pack. Only tries to open the
 * LOCK file, so nothing in the pack is touched; a held lock makes Windows answer EBUSY/EPERM.
 * @param {string} dir
 * @returns {boolean}
 */
function isLocked(dir) {
  const lock = join(dir, "LOCK");
  if (!existsSync(lock)) return false;
  try {
    closeSync(openSync(lock, "r+"));
    return false;
  } catch (error) {
    if (["EBUSY", "EPERM", "EACCES"].includes(error.code)) return true;
    throw error;
  }
}

const packs = readdirSync(SOURCE_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const locked = [];
for (const name of packs) if (isLocked(join(OUTPUT_ROOT, name))) locked.push(name);
if (locked.length) {
  console.error(`Pack(s) in use by Foundry VTT: ${locked.join(", ")}. Nothing was changed.`);
  console.error("Close Foundry VTT completely (not just the world) and run `npm run build:packs` again.");
  process.exit(1);
}

try {
  for (const name of packs) {
    const dest = join(OUTPUT_ROOT, name);
    const temp = join(OUTPUT_ROOT, `.build-${name}`);
    rmSync(temp, { recursive: true, force: true });
    await compilePack(join(SOURCE_ROOT, name), temp, { log: true });
    rmSync(dest, { recursive: true, force: true });
    renameSync(temp, dest);
    console.log(`Compiled ${name} → ${dest}`);
  }
} catch (error) {
  console.error(`Failed to build packs: ${error.message}`);
  process.exit(1);
}
