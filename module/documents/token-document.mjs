/**
 * Token document of the system (spec 022, research R3): movement action and vision derived from the actor's NPC traits,
 * never stored, so tokens already on the scene follow the traits without a migration.
 * - Flyer: flying is the default movement action; Phasing + Incorporeal: the wall-less "phase" action.
 * - Dark Sight: darkvision with unlimited range (only while the token has vision on).
 * Contract: specs/022-npc-traits/contracts/foundry-api.md.
 */
export class DtdTokenDocument extends foundry.documents.TokenDocument {
  /**
   * Trait flags of the represented actor, if it has NPC traits.
   * @returns {object|null}
   */
  _traitFlags() {
    return this._traitSource()?.system?.traitFlags ?? null;
  }

  /**
   * Private members are avoided: the core prepares a token being created with another receiver.
   * The represented actor without building the synthetic actor too early: during the first data preparation of an
   * unlinked token the delta does not exist yet, and reading `this.actor` then would leave the token without one.
   * @returns {Actor|null}
   */
  _traitSource() {
    if (!this.actorLink && !this.delta) return game.actors?.get(this.actorId) ?? null;
    try {
      return this.actor ?? null;
    } catch {
      return null;
    }
  }

  /** @override */
  _inferMovementAction() {
    const traits = this._traitFlags();
    if (traits?.phasing && this._traitSource()?.statuses?.has("incorporeal")) return "phase";
    if (traits?.flyer) return "fly";
    return super._inferMovementAction();
  }

  /** @override */
  _prepareDetectionModes() {
    if (this._traitFlags()?.darkSight && this.sight.enabled) {
      this.sight.visionMode = "darkvision";
      this.sight.range = Infinity;
    }
    super._prepareDetectionModes();
  }

  /**
   * The core only refreshes bars here; traits and statuses of the actor also change movement and vision.
   * @override
   */
  _onRelatedUpdate(update = {}, operation = {}) {
    super._onRelatedUpdate(update, operation);
    this.reset();
    this.object?.initializeSources?.();
  }
}
