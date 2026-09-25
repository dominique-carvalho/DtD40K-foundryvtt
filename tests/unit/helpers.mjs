/**
 * Deterministic RNG for dice tests: returns values that map to the given d10 faces
 * (face = floor(rng * 10) + 1). Throws if the test consumes more faces than provided.
 * @param {number[]} faces
 * @returns {() => number}
 */
export function facesRng(faces) {
  const queue = [...faces];
  return () => {
    if (!queue.length) throw new Error("facesRng: no more faces");
    return (queue.shift() - 1) / 10 + 0.05;
  };
}
