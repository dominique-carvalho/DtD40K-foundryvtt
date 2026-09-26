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
}
