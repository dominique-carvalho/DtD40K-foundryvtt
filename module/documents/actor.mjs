import { computeDerived } from "../rules/derived.mjs";

/**
 * Actor document class for Dungeons the Dragoning.
 */
export class DtdActor extends Actor {
  /** @override */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    if (this.type === "character") {
      // Start fully healed and composed.
      const derived = computeDerived(this.system, this.system.derivedMods, this.system.modifiers);
      this.updateSource({
        "system.hp.value": derived.hpMax,
        "system.resolve.value": derived.resolveMax
      });
    }
  }
}
