import { planIconUpdates } from "../rules/icons.mjs";

/**
 * GM menu "Update icons" (spec 024, FR-010, research R8): world documents that came from a compendium of the system and
 * still use a Foundry image take the icon of their source. Counts first, then a confirmation; custom images and tokens
 * already placed on scenes are left alone. Registered with game.settings.registerMenu: rendering it runs the update.
 */

const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);

/** Pack and id of a system compendium UUID ("Compendium.dtd40k.<pack>.<Type>.<id>"). */
function parseSource(uuid) {
  const match = String(uuid ?? "").match(/^Compendium\.dtd40k\.([^.]+)\.(Item|Actor|RollTable)\.([^.]+)$/);
  return match ? { pack: `dtd40k.${match[1]}`, id: match[3] } : null;
}

/** World documents with their compendium sources; embedded items without one follow their actor's source. */
function collectDocs() {
  const docs = [];
  for (const item of game.items) docs.push({ uuid: item.uuid, kind: "item", img: item.img, source: item._stats?.compendiumSource ?? "" });
  for (const actor of game.actors) {
    const source = actor._stats?.compendiumSource ?? "";
    docs.push({ uuid: actor.uuid, kind: "actor", img: actor.img, source });
    docs.push({ uuid: actor.uuid, kind: "token", img: actor.prototypeToken.texture.src, source });
    for (const item of actor.items) {
      const own = item._stats?.compendiumSource;
      docs.push({ uuid: item.uuid, kind: "embedded", img: item.img, source: own || (source ? `${source}#${item.type}/${item.name}` : "") });
    }
  }
  return docs;
}

/**
 * Active Effects of the world (spec 025): on actors, on the items they carry and on world items. An effect carried by an
 * item (or coming from one, by its origin) gets that item's icon, the new one when the item is updated in the same run.
 * @param {Map<string, string>} newImages  uuid → planned image of the items
 */
function collectEffects(newImages) {
  const docs = [];
  const itemImg = (item) => (item ? newImages.get(item.uuid) ?? item.img : undefined);
  const push = (effect, item) => docs.push({
    uuid: effect.uuid, kind: "effect", img: effect.img, statuses: [...effect.statuses], flags: effect.flags,
    itemImg: itemImg(item ?? (effect.origin ? foundry.utils.fromUuidSync(effect.origin, { strict: false }) : null))
  });
  for (const item of game.items) for (const effect of item.effects) push(effect, item);
  for (const actor of game.actors) {
    for (const effect of actor.effects) push(effect, null);
    for (const item of actor.items) for (const effect of item.effects) push(effect, item);
  }
  return docs;
}

/** Images of the sources the documents point at (one index per pack; actors loaded for their embedded items). */
async function sourceImages(docs) {
  const images = {};
  const byPack = new Map();
  for (const { source } of docs) {
    const [uuid] = String(source).split("#");
    const parsed = parseSource(uuid);
    if (parsed) byPack.set(parsed.pack, new Set([...(byPack.get(parsed.pack) ?? []), uuid]));
  }
  for (const [packId, uuids] of byPack) {
    const pack = game.packs.get(packId);
    if (!pack) continue;
    const index = await pack.getIndex({ fields: ["img", "prototypeToken.texture.src"] });
    for (const uuid of uuids) {
      const entry = index.get(parseSource(uuid).id);
      if (!entry) continue;
      images[uuid] = { img: entry.img, token: entry.prototypeToken?.texture?.src };
      if (pack.documentName !== "Actor" || !docs.some((d) => d.source.startsWith(`${uuid}#`))) continue;
      const actor = await pack.getDocument(entry._id);
      for (const item of actor?.items ?? []) images[`${uuid}#${item.type}/${item.name}`] ??= { img: item.img };
    }
  }
  return images;
}

/** Apply the planned updates in batches: world items, actors (portrait and token), items per actor, effects per parent. */
async function apply(updates) {
  const items = [];
  const actors = new Map();
  const embedded = new Map();
  const effects = new Map();
  for (const { uuid, kind, img } of updates) {
    const doc = foundry.utils.fromUuidSync(uuid);
    if (!doc) continue;
    if (kind === "effect") effects.set(doc.parent, [...(effects.get(doc.parent) ?? []), { _id: doc.id, img }]);
    else if (kind === "item") items.push({ _id: doc.id, img });
    else if (kind === "embedded") embedded.set(doc.parent.id, [...(embedded.get(doc.parent.id) ?? []), { _id: doc.id, img }]);
    else {
      const change = actors.get(doc.id) ?? { _id: doc.id };
      if (kind === "actor") change.img = img;
      else change["prototypeToken.texture.src"] = img;
      actors.set(doc.id, change);
    }
  }
  if (items.length) await Item.updateDocuments(items);
  if (actors.size) await Actor.updateDocuments([...actors.values()]);
  for (const [actorId, changes] of embedded) await game.actors.get(actorId)?.updateEmbeddedDocuments("Item", changes);
  for (const [parent, changes] of effects) await parent.updateEmbeddedDocuments("ActiveEffect", changes);
}

export class UpdateIconsMenu extends foundry.applications.api.ApplicationV2 {
  /** Rendering the menu runs the update instead of opening a window. */
  async render() {
    if (!game.user.isGM) return this;
    const docs = collectDocs();
    const documents = planIconUpdates({ docs, sourceImages: await sourceImages(docs) });
    // Effects after the documents, so an item's effect follows the item's new icon.
    const newImages = new Map(documents.updates.map((u) => [u.uuid, u.img]));
    const conditionImages = Object.fromEntries(CONFIG.statusEffects.map((s) => [s.id, s.img]));
    const effects = planIconUpdates({ docs: collectEffects(newImages), sourceImages: {}, conditionImages, effectImages: CONFIG.DTD.ICONS.effect });
    const plan = { updates: [...documents.updates, ...effects.updates], counts: { ...documents.counts, effect: effects.counts.effect } };
    const total = plan.updates.length;
    if (!total) {
      ui.notifications.info(localize("DTD.Icons.Update.Nothing"));
      return this;
    }
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: localize("DTD.Icons.Update.Title") },
      content: `<p>${format("DTD.Icons.Update.Confirm", { ...plan.counts, total })}</p>`,
      rejectClose: false
    });
    if (!confirmed) return this;
    await apply(plan.updates);
    ui.notifications.info(format("DTD.Icons.Update.Done", { total }));
    return this;
  }
}
