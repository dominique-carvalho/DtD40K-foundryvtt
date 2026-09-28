import { buildCharacteristicPool, buildSkillPool, rollModifiers } from "../rules/pool.mjs";
import { computeDerived } from "../rules/derived.mjs";
import { runTest } from "../rules/test.mjs";
import { postTest, rng } from "../dice/roll-service.mjs";
import { promptRollOptions } from "../apps/roll-dialog.mjs";
import { allyBonus } from "../rules/minions.mjs";
import { alliesOf } from "./minion-service.mjs";

/**
 * Actor document class for Dungeons the Dragoning.
 */
export class DtdActor extends Actor {
  /** @override */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    // A vehicle is one machine whose Momentum, damage and crew persist: its token is linked unless told otherwise
    // (spec 013).
    if (this.type === "vehicle" && data.prototypeToken?.actorLink === undefined) this.updateSource({ "prototypeToken.actorLink": true });

    if (this.type === "character" || this.type === "npc") {
      // Start fully healed and composed.
      const derived = computeDerived(this.system, this.system.derivedMods, this.system.modifiers);
      this.updateSource({
        "system.hp.value": derived.hpMax,
        "system.resolve.value": derived.resolveMax
      });
    }
  }

  /**
   * Roll a skill test: (skill + characteristic) k characteristic (DtD 7.7a p. 416).
   * Opens the roll dialog unless fastForward is set (Shift+click).
   * @param {string} key                        skill key from CONFIG.DTD.SKILLS
   * @param {object} [options]
   * @param {string} [options.characteristic]   override the skill's default characteristic
   * @param {boolean} [options.fastForward]     skip the roll dialog and use defaults
   * @param {number|null} [options.tn=15]
   * @returns {Promise<ChatMessage|null>}      null when cancelled or the test cannot be rolled
   */
  async rollSkill(key, { characteristic, fastForward = false, tn = 15, modifiers = {}, label: labelOverride } = {}) {
    const def = CONFIG.DTD.SKILLS[key];
    if (!def) throw new Error(`dtd40k | Unknown skill "${key}"`);
    if (def.advanced && this.system.skills[key].value <= 0) {
      ui.notifications.warn(game.i18n.localize("DTD.Roll.AdvancedUntrained"));
      return null;
    }

    let options = { characteristic: characteristic ?? def.characteristic, tn, modifiers, specialty: false };
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
    const label = labelOverride ?? `${game.i18n.localize(def.label)} + ${game.i18n.localize(CONFIG.DTD.CHARACTERISTICS[charKey].label)}`;
    const testResult = runTest({ base, tn: options.tn, specialty: options.specialty, rng, ...this.withRollModifiers(options.modifiers, key) });
    return postTest({ actor: this, label, testResult, rollMode: options.rollMode });
  }

  /**
   * Roll a characteristic test: characteristic k characteristic (DtD 7.7a p. 417).
   * Opens the roll dialog unless fastForward is set (Shift+click).
   * @param {string} key                        characteristic key
   * @param {object} [options]
   * @param {boolean} [options.fastForward]     skip the roll dialog and use defaults
   * @param {number|null} [options.tn=15]
   * @returns {Promise<ChatMessage|null>}      null when cancelled
   */
  async rollCharacteristic(key, { fastForward = false, tn = 15, label } = {}) {
    const def = CONFIG.DTD.CHARACTERISTICS[key];
    if (!def) throw new Error(`dtd40k | Unknown characteristic "${key}"`);

    let options = { tn, modifiers: {}, specialty: false };
    if (!fastForward) {
      const chosen = await promptRollOptions({ actor: this, characteristicKey: key, tn });
      if (!chosen) return null;
      options = chosen;
    }

    const base = buildCharacteristicPool({ characteristic: this.system.characteristics[key].value });
    const testResult = runTest({ base, tn: options.tn, specialty: options.specialty, rng, ...this.withRollModifiers(options.modifiers) });
    return postTest({ actor: this, label: label ?? game.i18n.localize(def.label), testResult, rollMode: options.rollMode });
  }

  /**
   * Add the roll bonuses and penalties of effects (addiction, Medkit, hearthstones; spec 007, research R8)
   * to the roll-dialog modifiers.
   * @param {object} [modifiers]  roll-dialog modifiers
   * @param {string} [skillKey]
   * @returns {{modifiers: object, explodeOn: number}}
   */
  withRollModifiers(modifiers = {}, skillKey) {
    const extra = rollModifiers(this.system.modifiers?.rolls, skillKey);
    // Minions teamed with a character add to every skill roll (spec 012, p. 544).
    const allies = skillKey && this.type === "character" ? allyBonus(alliesOf(this), this.system.characteristics.fel.value) : 0;
    return {
      modifiers: {
        ...modifiers,
        flat: (Number(modifiers.flat) || 0) + allies,
        rolled: (Number(modifiers.rolled) || 0) + extra.rolled,
        kept: (Number(modifiers.kept) || 0) + extra.kept,
        freeRaises: (Number(modifiers.freeRaises) || 0) + extra.freeRaises
      },
      explodeOn: extra.noExplode ? 11 : 10
    };
  }
}
