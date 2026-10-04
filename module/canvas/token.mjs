/**
 * Token placeable of the system (spec 022, research R3): a Crawler is never slowed by terrain (p. 521), so its
 * movement cost ignores the terrain difficulty of Regions and keeps only the movement action's own cost.
 */
export class DtdToken extends foundry.canvas.placeables.Token {
  /** @override */
  _getMovementCostFunction(options) {
    if (!this.document.actor?.system?.traitFlags?.crawler) return super._getMovementCostFunction(options);
    const actionCostFunctions = {};
    return (from, to, distance, segment) => {
      const calculateActionCost = actionCostFunctions[segment.action]
        ??= segment.actionConfig.getCostFunction(this.document, options);
      return calculateActionCost(distance, from, to, distance, segment);
    };
  }
}
