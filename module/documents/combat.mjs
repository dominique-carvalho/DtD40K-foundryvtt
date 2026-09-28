import { compareInitiative, initiativeDie } from "../rules/combat-actions.mjs";
import { resetForRound } from "../rules/turn.mjs";
import { endOfTurn, startOfRound, startOfTurn } from "./turn-service.mjs";
import { sustainTurn } from "./magic-service.mjs";
import { regenerate } from "./npc-service.mjs";
import { endOfPilotTurn, explodeDue } from "./vehicle-service.mjs";
import { endOfShipRound, endOfShipTurn, startOfShipTurn } from "./ship-combat-service.mjs";

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
    // Vehicles this combatant pilots lose their Momentum without a Move or Punch It (spec 013, p. 360).
    await endOfPilotTurn(this, combatant.actor);
    // Ships announce a missing Manoeuver and drift when adrift (spec 014).
    await endOfShipTurn(combatant, context);
  }

  /** Action effects and expired conditions end; Surprised/Stunned are announced. @override */
  async _onStartTurn(combatant, context) {
    await super._onStartTurn(combatant, context);
    await startOfTurn(this, combatant);
    // Sustained spells spend their concentration action (spec 009, FR-014).
    await sustainTurn(combatant);
    // Regeneration of NPCs (spec 012, FR-004).
    await regenerate(combatant);
    // Ship shields regenerate less their Disruption (spec 014).
    await startOfShipTurn(this, combatant);
  }

  /** Surprised ends after round 1. @override */
  async _onStartRound(context) {
    await super._onStartRound(context);
    // Radiation Leak kills Crew as the previous round ends (spec 014).
    if (this.round > 1) await endOfShipRound(this);
    await startOfRound(this);
    // Hit vehicle cores explode a round later unless Jury Rigged (spec 013, p. 363).
    await explodeDue(this);
  }
}

export class DtdCombatant extends Combatant {
  /**
   * Minion Squads have no characteristics: 1d10 + Threat Rating (spec 012).
   * @override
   */
  _getInitiativeFormula() {
    if (this.actor?.type === "minionSquad") return "1d10 + @threatRating";
    // Vehicles act through their crew's turns (spec 013); a vehicle token in the tracker just rolls 1d10.
    if (this.actor?.type === "vehicle") return "1d10";
    // Ships: Sensors + Acceleration + 1d10 (p. 403); fighter squadrons 1d10 (spec 014).
    if (this.actor?.type === "ship") return "1d10 + @initiativeBonus";
    if (this.actor?.type === "squadron") return "1d10";
    return super._getInitiativeFormula();
  }

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
