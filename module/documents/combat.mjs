import { compareInitiative, initiativeDie } from "../rules/combat-actions.mjs";
import { resetForRound } from "../rules/turn.mjs";
import { endOfTurn, startOfRound, startOfTurn } from "./turn-service.mjs";

/**
 * Combat and Combatant for Dungeons the Dragoning (spec 008, research R4/R5).
 * Initiative order of p. 422: higher result, then the higher die, then the higher Dexterity.
 */

/**
 * Tie-break data of a combatant.
 * @param {Combatant} combatant
 */
function orderData(combatant) {
  const system = combatant.actor?.system;
  const dex = system?.characteristics?.dex.value ?? 0;
  const cmp = system?.characteristics?.cmp.value ?? 0;
  const initiative = Number.isFinite(combatant.initiative) ? combatant.initiative : null;
  const mod = system?.modifiers?.initiative ?? 0;
  return { initiative, dex, die: initiative === null ? 0 : initiativeDie({ initiative, dex, cmp, mod }) };
}

export class DtdCombat extends Combat {
  /**
   * Called unbound by `setupTurns` (`contents.sort(this._sortCombatants)`), so it must not use `this`.
   * @override
   */
  _sortCombatants(a, b) {
    return compareInitiative(orderData(a), orderData(b)) || (a.id > b.id ? 1 : -1);
  }

  /** End-of-turn effects: On Fire, Blood Loss, Pinned (active GM only, v13). @override */
  async _onEndTurn(combatant, context) {
    await super._onEndTurn(combatant, context);
    await endOfTurn(combatant.actor);
  }

  /** Action effects and expired conditions end; Surprised/Stunned are announced. @override */
  async _onStartTurn(combatant, context) {
    await super._onStartTurn(combatant, context);
    await startOfTurn(this, combatant);
  }

  /** Surprised ends after round 1. @override */
  async _onStartRound(context) {
    await super._onStartRound(context);
    await startOfRound(this);
  }
}

export class DtdCombatant extends Combatant {
  /**
   * What this combatant spent in the current round (research R5).
   * @returns {import("../rules/turn.mjs").TurnState}
   */
  get turnState() {
    return resetForRound(this.getFlag("dtd40k", "turn"), this.combat?.round ?? 0);
  }

  /**
   * Record the turn state.
   * @param {import("../rules/turn.mjs").TurnState} state
   */
  async setTurnState(state) {
    return this.setFlag("dtd40k", "turn", state);
  }
}
