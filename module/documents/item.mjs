/**
 * Item document class for Dungeons the Dragoning.
 */
export class DtdItem extends Item {
  /**
   * A character holds at most one race (spec 002, FR-011, research R6).
   * The race service replaces the old race first; this is the safety net for
   * any other way of creating a second one.
   * @override
   */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    const actor = this.parent;
    if (this.type === "race" && actor instanceof Actor && actor.items.some((item) => item.type === "race")) {
      ui.notifications.warn(game.i18n.localize("DTD.Race.OnlyOne"));
      return false;
    }
  }
}
