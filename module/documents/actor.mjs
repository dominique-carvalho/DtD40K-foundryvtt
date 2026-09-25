import { buildCharacteristicPool, buildSkillPool } from "../rules/pool.mjs";
import { computeDerived } from "../rules/derived.mjs";
import { runTest } from "../rules/test.mjs";
import { postTest, rng } from "../dice/roll-service.mjs";
import { promptRollOptions } from "../apps/roll-dialog.mjs";

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
      const derived = computeDerived(this.system, this.system.derivedMods);
      this.updateSource({
        "system.hp.value": derived.hpMax,
        "system.resolve.value": derived.resolveMax
      });
    }
  }

  /**
   * Roll a skill test: (skill + characteristic) k characteristic (DtD 1.6 p. 19).
   * Opens the roll dialog unless fastForward is set (Shift+click).
   * @param {string} key                        skill key from CONFIG.DTD.SKILLS
   * @param {object} [options]
   * @param {string} [options.characteristic]   override the skill's default characteristic
   * @param {boolean} [options.fastForward]     skip the roll dialog and use defaults
   * @param {number|null} [options.tn=15]
   * @returns {Promise<ChatMessage|null>}      null when cancelled or the test cannot be rolled
   */
  async rollSkill(key, { characteristic, fastForward = false, tn = 15 } = {}) {
    const def = CONFIG.DTD.SKILLS[key];
    if (!def) throw new Error(`dtd40k | Unknown skill "${key}"`);
    if (def.advanced && this.system.skills[key].value <= 0) {
      ui.notifications.warn(game.i18n.localize("DTD.Roll.AdvancedUntrained"));
      return null;
    }

    let options = { characteristic: characteristic ?? def.characteristic, tn, modifiers: {}, specialty: false };
    if (!fastForward) {
      const chosen = await promptRollOptions({ actor: this, skillKey: key, characteristicKey: options.characteristic, tn });
      if (!chosen) return null;
      options = chosen;
    }

    const charKey = options.characteristic;
    const base = buildSkillPool({
      skill: this.system.skills[key].value,
      characteristic: this.system.characteristics[charKey].value,
      advanced: def.advanced
    });
    const label = `${game.i18n.localize(def.label)} + ${game.i18n.localize(CONFIG.DTD.CHARACTERISTICS[charKey].label)}`;
    const testResult = runTest({ base, modifiers: options.modifiers, tn: options.tn, specialty: options.specialty, rng });
    return postTest({ actor: this, label, testResult, rollMode: options.rollMode });
  }

  /**
   * Roll a characteristic test: characteristic k characteristic (DtD 1.6 p. 236).
   * Opens the roll dialog unless fastForward is set (Shift+click).
   * @param {string} key                        characteristic key
   * @param {object} [options]
   * @param {boolean} [options.fastForward]     skip the roll dialog and use defaults
   * @param {number|null} [options.tn=15]
   * @returns {Promise<ChatMessage|null>}      null when cancelled
   */
  async rollCharacteristic(key, { fastForward = false, tn = 15 } = {}) {
    const def = CONFIG.DTD.CHARACTERISTICS[key];
    if (!def) throw new Error(`dtd40k | Unknown characteristic "${key}"`);

    let options = { tn, modifiers: {}, specialty: false };
    if (!fastForward) {
      const chosen = await promptRollOptions({ actor: this, characteristicKey: key, tn });
      if (!chosen) return null;
      options = chosen;
    }

    const base = buildCharacteristicPool({ characteristic: this.system.characteristics[key].value });
    const testResult = runTest({ base, modifiers: options.modifiers, tn: options.tn, specialty: options.specialty, rng });
    return postTest({ actor: this, label: game.i18n.localize(def.label), testResult, rollMode: options.rollMode });
  }
}
