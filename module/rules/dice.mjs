/**
 * Roll & Keep dice engine with compounding explosions.
 * PURE module: must never reference Foundry globals (constitution, principle III).
 * Foundry's `x` modifier appends separate results instead of compounding, so the
 * Roll & Keep semantics live here (research R2, constitution principle II).
 */

/**
 * @typedef {object} DieResult
 * @property {number[]} chain        faces of the explosion chain, e.g. [10, 10, 4]
 * @property {number} total          sum of the chain (10 = 0 under the zero-characteristic rule)
 * @property {number[]} [rerolled]   faces discarded by rerolling 1s
 * @property {boolean} kept
 */

/**
 * Roll a pool and keep the highest dice.
 * @param {{rolled: number, kept: number, flat: number}} pool   normalized pool
 * @param {object} options
 * @param {() => number} options.rng                   uniform random number in [0, 1)
 * @param {number} [options.explodeOn=10]              faces ≥ this value explode
 * @param {boolean} [options.rerollOnes=false]         specialty: reroll 1s once
 * @param {number} [options.rerollBelow=0]            reroll once faces below this value (Proven, p. 320);
 *                                                     the specialty is rerollBelow 2
 * @param {boolean} [options.zeroCharacteristic=false] 10s are worth 0 and never explode
 * @returns {{dice: DieResult[], keptSum: number, total: number}}
 */
export function rollAndKeep(pool, { rng, explodeOn = 10, rerollOnes = false, rerollBelow = 0, zeroCharacteristic = false }) {
  const face = () => Math.floor(rng() * 10) + 1;
  const below = Math.max(rerollOnes ? 2 : 0, rerollBelow);

  const dice = Array.from({ length: pool.rolled }, () => {
    /** @type {DieResult} */
    const die = { chain: [], total: 0, kept: false };
    let value = face();
    if (value < below) {
      die.rerolled = [value];
      value = face();
    }
    die.chain.push(value);
    if (!zeroCharacteristic) {
      while (value >= explodeOn) {
        value = face();
        die.chain.push(value);
      }
    }
    die.total = zeroCharacteristic
      ? die.chain.reduce((sum, f) => sum + (f === 10 ? 0 : f), 0)
      : die.chain.reduce((sum, f) => sum + f, 0);
    return die;
  });

  // Keep the highest totals; ties are resolved by roll order (stable sort).
  const order = dice.map((die, index) => ({ die, index })).sort((a, b) => b.die.total - a.die.total || a.index - b.index);
  for (const { die } of order.slice(0, pool.kept)) die.kept = true;

  const keptSum = dice.filter((die) => die.kept).reduce((sum, die) => sum + die.total, 0);
  return { dice, keptSum, total: keptSum + (pool.flat ?? 0) };
}
