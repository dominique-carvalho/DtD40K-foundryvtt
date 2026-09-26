/**
 * Helpers shared by the item sheets (race, exaltation, feat).
 */
/**
 * Hint shown to GMs on entries of a locked system compendium (core "Toggle Edit Lock").
 * @param {Item} item
 * @returns {string}
 */
export function lockedPackHint(item) {
  const pack = item.pack ? game.packs.get(item.pack) : null;
  if (!pack?.locked || !game.user.isGM) return "";
  return game.i18n.format("DTD.Item.LockedPackHint", {
    pack: pack.metadata.label,
    option: game.i18n.localize("COMPENDIUM.ToggleLocked.Option")
  });
}
