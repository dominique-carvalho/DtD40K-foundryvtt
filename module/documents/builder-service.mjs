import { CHARACTERISTICS, SKILLS } from "../config.mjs";
import { buildPlan } from "../rules/builder.mjs";
import { SINGLE_BACKGROUNDS } from "../rules/backgrounds.mjs";
import { silently } from "./silent.mjs";
import { applyRace } from "./race-service.mjs";
import { applyExaltation } from "./exaltation-service.mjs";
import { startClass } from "./class-service.mjs";
import { setAlignment } from "./alignment-service.mjs";
import { addInstance, raiseBackground } from "./background-service.mjs";
import { addFeat } from "./feat-service.mjs";
import { addExaltedAsset } from "./asset-service.mjs";
import { advance } from "./xp-service.mjs";
import { addEquipment } from "./equipment-service.mjs";

/**
 * Character builder (spec 023): the draft kept on the user, the creation of the actor (directly, or by the active GM
 * for players who cannot create actors) and the plan that fills it through the system's services in silent mode.
 * Contract: specs/023-character-builder/contracts/foundry-api.md.
 */

const FLAG = "builderDraft";
const DRAFT_VERSION = 1;
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);

/** A blank draft. */
export function blankDraft() {
  return {
    version: DRAFT_VERSION, step: "concept", released: [], ownerId: game.user.id,
    concept: { name: "", concept: "", img: CONFIG.DTD.ICONS.actor.character },
    race: { uuid: "", choice: { characteristic: "", skills: [] } },
    exaltation: { uuid: "", selection: { statuesque: "", element: "" } },
    priorities: { characteristic: [], skill: [] },
    characteristic: {}, skill: {}, specialties: {},
    class: { uuid: "" },
    backgrounds: {}, wealth: 0, artifacts: [],
    deity: { uuid: "" },
    hindrances: [], assets: [], exaltedAsset: { uuid: "" },
    purchases: [], equipment: []
  };
}

/** The saved draft, if any. */
export function loadDraft() {
  const draft = game.user.getFlag("dtd40k", FLAG);
  return draft?.version === DRAFT_VERSION ? foundry.utils.mergeObject(blankDraft(), draft, { inplace: false }) : null;
}

/** Save the draft on the user. */
export async function saveDraft(draft) {
  await game.user.setFlag("dtd40k", FLAG, foundry.utils.deepClone(draft));
}

/** Drop the saved draft. */
export async function clearDraft() {
  await game.user.unsetFlag("dtd40k", FLAG);
}

/**
 * The active GM creates the character for a player (CONFIG.queries, research R5).
 * @param {{name: string, img: string, userId: string}} data
 * @returns {Promise<string>}  the new actor's UUID
 */
export async function createCharacterForPlayer({ name, img, userId }) {
  if (game.users.activeGM !== game.user) throw new Error("dtd40k | only the active GM creates characters for players");
  const actor = await Actor.implementation.create({
    name, img, type: "character", ownership: { default: 0, [userId]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER }
  });
  return actor.uuid;
}

/**
 * Create the actor: directly when the user may create actors; otherwise through the active GM.
 * @param {{name: string, img: string, ownerId: string}} data
 * @returns {Promise<Actor|null>}
 */
export async function createActor({ name, img, ownerId }) {
  const ownership = { default: 0, [ownerId]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER };
  if (game.user.can("ACTOR_CREATE")) return Actor.implementation.create({ name, img, type: "character", ownership });
  const gm = game.users.activeGM;
  if (!gm) {
    ui.notifications.warn(localize("DTD.Builder.NoGM"));
    return null;
  }
  const uuid = await gm.query("dtd40k.createCharacter", { name, img, userId: ownerId }, { timeout: 30000 });
  return uuid ? foundry.utils.fromUuid(uuid) : null;
}

/**
 * Apply the plan to the new actor (research R1), in silent mode. Stops at the first failure.
 * @param {Actor} actor
 * @param {object} draft
 * @param {Record<string, Item>} docs  compendium documents by UUID
 * @returns {Promise<{ok: boolean, failed: string}>}
 */
export async function applyPlan(actor, draft, docs) {
  const get = (uuid) => docs[uuid] ?? null;
  const steps = {
    race: () => applyRace(actor, get(draft.race.uuid), { choice: draft.race.choice }),
    exaltation: () => applyExaltation(actor, get(draft.exaltation.uuid), { selection: draft.exaltation.selection }),
    ratings: () => actor.update({
      ...Object.fromEntries(Object.keys(CHARACTERISTICS).map((key) => [`system.characteristics.${key}.value`, 1 + (draft.characteristic[key] ?? 0)])),
      ...Object.fromEntries(Object.keys(SKILLS).map((key) => [`system.skills.${key}.value`, draft.skill[key] ?? 0]))
    }),
    specialties: () => {
      const update = {};
      for (const [path, text] of Object.entries(foundry.utils.flattenObject(draft.specialties))) {
        if (!String(text).trim()) continue;
        const [kind, key] = path.split(".");
        update[`system.${kind === "characteristic" ? "characteristics" : "skills"}.${key}.specialties`] = [String(text).trim()];
      }
      return Object.keys(update).length ? actor.update(update) : true;
    },
    class: () => startClass(actor, get(draft.class.uuid)),
    deity: () => setAlignment(actor, get(draft.deity.uuid)),
    backgrounds: async () => {
      for (let i = 0; i < (draft.wealth ?? 0); i++) await raiseBackground(actor, "wealth");
      for (const key of SINGLE_BACKGROUNDS) for (let i = 0; i < (draft.backgrounds[key] ?? 0); i++) await raiseBackground(actor, key);
      for (const artifact of draft.artifacts ?? []) {
        if (!artifact.name?.trim() || !artifact.value) continue;
        await addInstance(actor, "artifact", artifact.name);
        const instance = actor._source.system.backgrounds.artifacts.at(-1);
        for (let i = 1; i < artifact.value; i++) await raiseBackground(actor, "artifact", { id: instance?.id ?? "" });
      }
      return true;
    },
    hindrances: async () => { for (const h of draft.hindrances) await addFeat(actor, get(h.uuid)); return true; },
    assets: async () => { for (const a of draft.assets) await addFeat(actor, get(a.uuid)); return true; },
    exaltedAsset: () => addExaltedAsset(actor, get(draft.exaltedAsset.uuid)),
    purchases: async () => {
      for (const p of draft.purchases) {
        if (p.kind === "feat") await addFeat(actor, get(p.uuid));
        else await advance(actor, p.kind, p.key ?? "");
      }
      return true;
    },
    equipment: async () => {
      for (const pick of draft.equipment) if (pick.uuid) await addEquipment(actor, get(pick.uuid), { starting: true });
      return true;
    }
  };
  for (const { op } of buildPlan({ draft })) {
    try {
      const out = await silently(steps[op]);
      if (out === null || out === false) return { ok: false, failed: op };
    } catch (error) {
      console.error(`dtd40k | builder step ${op} failed`, error);
      return { ok: false, failed: op };
    }
  }
  return { ok: true, failed: "" };
}

/**
 * Finish (FR-013 to FR-016): create the actor, apply the plan, open the sheet; the draft is dropped only on success.
 * @param {object} draft
 * @param {Record<string, Item>} docs
 * @returns {Promise<Actor|null>}
 */
export async function finish(draft, docs) {
  const actor = await createActor({ name: draft.concept.name.trim(), img: draft.concept.img, ownerId: draft.ownerId || game.user.id });
  if (!actor) return null;
  const result = await applyPlan(actor, draft, docs);
  if (result.ok) {
    await clearDraft();
    ui.notifications.info(format("DTD.Builder.Done", { name: actor.name }));
  } else {
    ui.notifications.warn(format("DTD.Builder.Failed", { name: actor.name, step: localize(`DTD.Builder.Step.${result.failed}`) }));
  }
  actor.sheet.render(true);
  return actor;
}
