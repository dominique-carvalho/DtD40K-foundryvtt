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
 * Plan the image updates.
 * @param {{docs: {uuid: string, kind: "item"|"actor"|"embedded"|"token", img: string, source: string}[],
 *   sourceImages: Record<string, {img: string, token?: string}>}} input
 *   docs: world items and actors, items embedded in actors and prototype tokens, each with its compendium source
 * @returns {{updates: {uuid: string, kind: string, img: string}[], counts: Record<string, number>, skipped: number}}
 */
export function planIconUpdates({ docs, sourceImages }) {
  const counts = { item: 0, actor: 0, token: 0, embedded: 0 };
  const updates = [];
  let skipped = 0;
  for (const doc of docs) {
    const images = String(doc.source ?? "").startsWith(SYSTEM_SOURCE) ? sourceImages[doc.source] : null;
    const img = doc.kind === "token" ? images?.token ?? images?.img : images?.img;
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
