import { grantFeats, releaseGrants } from "./feat-service.mjs";

/**
 * Item document class for Dungeons the Dragoning.
 */
export class DtdItem extends Item {
  /** Item types a character holds at most once, with the warning shown otherwise. */
  static UNIQUE_TYPES = {
    race: "DTD.Race.OnlyOne",
    exaltation: "DTD.Exaltation.OnlyOne"
  };

  /**
   * A character holds at most one race (spec 002, FR-011, research R6) and one exaltation
   * (spec 004, FR-011). The services replace the old item first; this is the safety net for
   * any other way of creating a second one.
   * @override
   */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    const actor = this.parent;
    const warning = DtdItem.UNIQUE_TYPES[this.type];
    if (warning && actor instanceof Actor && actor.items.some((item) => item.type === this.type)) {
      ui.notifications.warn(game.i18n.localize(warning));
      return false;
    }
  }

  /**
   * Grant the feats this item gives (race, exaltation, asset, racial feat — spec 005, research R7).
   * Runs once, on the client that created the item.
   * @override
   */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (userId !== game.user.id || this.parent?.type !== "character" || !this.system.grants?.length) return;
    grantFeats(this.parent, this).catch((error) => console.error("dtd40k | Could not grant feats", error));
  }

  /**
   * Release the feats this item granted: those left without origin and not purchased leave with it.
   * Runs once, on the client that deleted the item.
   * @override
   */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    if (userId !== game.user.id || this.parent?.type !== "character") return;
    releaseGrants(this.parent, this.id).catch((error) => console.error("dtd40k | Could not release granted feats", error));
  }
}
