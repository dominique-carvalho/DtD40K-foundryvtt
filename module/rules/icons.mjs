/**
 * Updating the world's documents to the compendium icons (spec 024, FR-010, research R8). Pure: the caller lists the
 * documents and the images of their compendium sources.
 */

/** Prefix of the compendiums of the system. */
const SYSTEM_SOURCE = "Compendium.dtd40k.";

/**
 * Whether an image is one of Foundry's own (or missing): those are the only ones the update replaces.
 * @param {string|null|undefined} img
 * @returns {boolean}
 */
export function isCoreImage(img) {
  return !img || String(img).startsWith("icons/");
}

/**
 * New image of an effect (spec 025, research R6): a condition takes its seal, an effect a service created takes its
 * seal, and an effect carried by an item takes the item's icon (only when the item already uses a system icon).
 * @param {{statuses?: string[], flags?: object, itemImg?: string}} effect
 * @param {Record<string, string>} conditionImages
 * @param {Record<string, string>} effectImages
 * @returns {string|null}
 */
function effectImage(effect, conditionImages, effectImages) {
  const condition = (effect.statuses ?? []).find((id) => conditionImages[id]);
  if (condition) return conditionImages[condition];
  const flags = effect.flags?.dtd40k ?? {};
  const key = flags.effectIcon ?? (flags.degeneration ? "degeneration" : null);
  if (key && effectImages[key]) return effectImages[key];
  return effect.itemImg && !isCoreImage(effect.itemImg) ? effect.itemImg : null;
}

/**
 * Plan the image updates.
 * @param {{docs: {uuid: string, kind: "item"|"actor"|"embedded"|"token"|"effect", img: string, source?: string,
 *   statuses?: string[], flags?: object, itemImg?: string}[], sourceImages: Record<string, {img: string, token?: string}>,
 *   conditionImages?: Record<string, string>, effectImages?: Record<string, string>}} input
 *   docs: world items and actors, items embedded in actors, prototype tokens (each with its compendium source) and
 *   Active Effects (with their statuses, flags and the icon of the item carrying them)
 * @returns {{updates: {uuid: string, kind: string, img: string}[], counts: Record<string, number>, skipped: number}}
 */
export function planIconUpdates({ docs, sourceImages, conditionImages = {}, effectImages = {} }) {
  const counts = { item: 0, actor: 0, token: 0, embedded: 0, effect: 0 };
  const updates = [];
  let skipped = 0;
  for (const doc of docs) {
    let img;
    if (doc.kind === "effect") img = effectImage(doc, conditionImages, effectImages);
    else {
      const images = String(doc.source ?? "").startsWith(SYSTEM_SOURCE) ? sourceImages[doc.source] : null;
      img = doc.kind === "token" ? images?.token ?? images?.img : images?.img;
    }
    if (!img || !isCoreImage(doc.img) || img === doc.img) {
      skipped += 1;
      continue;
    }
    updates.push({ uuid: doc.uuid, kind: doc.kind, img });
    counts[doc.kind] += 1;
  }
  return { updates, counts, skipped };
}

/**
 * Default icon of a document created in the world (research R7): "type:category" (weapons: "type:weaponType"), then
 * the type alone.
 * @param {{item: Record<string, string>, actor: Record<string, string>}} icons  DTD.ICONS
 * @param {"item"|"actor"} kind
 * @param {{type?: string, system?: object}} data
 * @returns {string|null}
 */
export function defaultIconFor(icons, kind, data) {
  const map = icons[kind] ?? {};
  const sub = data?.system?.category ?? data?.system?.weaponType;
  return (sub && map[`${data.type}:${sub}`]) || map[data?.type] || null;
}
