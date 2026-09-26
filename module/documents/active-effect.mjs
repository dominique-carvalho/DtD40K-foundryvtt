/**
 * Active Effects of equipment apply only while the item is in use (spec 007, research R2).
 * Foundry v13: `ActiveEffect#active` is `!disabled && !isSuppressed`, and actors skip inactive effects;
 * the GM can still switch any effect off (`disabled`).
 */
const EQUIPMENT_TYPES = ["weapon", "armor", "gear"];

export class DtdActiveEffect extends ActiveEffect {
  /** @override */
  get isSuppressed() {
    const item = this.parent;
    if (!(item instanceof Item) || !EQUIPMENT_TYPES.includes(item.type)) return super.isSuppressed;
    const system = item.system;
    // A piece of power armor does nothing on its own (p. 332).
    if (item.type === "armor" && system.piece && system.suitOnly) return true;
    if (item.type === "gear" && system.category === "drug") return !system.active;
    if (item.type === "gear" && system.category === "hearthstone") {
      const host = system.socketedIn ? item.actor?.items.get(system.socketedIn) : null;
      return !host?.system.equipped;
    }
    return !system.equipped;
  }
}
