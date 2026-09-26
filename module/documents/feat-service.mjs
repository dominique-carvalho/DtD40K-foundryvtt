import { CHARACTERISTICS, GROUPS, SKILLS } from "../config.mjs";
import { activeGrants, buildFeatEffects, characteristicOptions, fullName, grantedByOf, grantPlan, needsFeatSelection,
  releasePlan, validateFeatAdd, validateFeatSelection } from "../rules/feat.mjs";
import { getRace } from "./race-service.mjs";

/**
 * Adding, removing and granting feats, racial feats, assets and hindrances (spec 005, US2–US4).
 * Exalted Assets keep their own service (004). Contract: specs/005-feats-assets-hindrances/contracts/foundry-api.md.
 */

const CHOICE_TEMPLATE = "systems/dtd40k/templates/dialog/feat-choice.hbs";
const FEAT_PACK = "dtd40k.feats";
const localize = (key) => game.i18n.localize(key);
const EMPTY_SELECTION = { subcategory: "", characteristic: "", characteristic2: "", skill: "", specialty: "" };

/**
 * Feats of an actor (every category but Exalted Assets, unless asked).
 * @param {Actor} actor
 * @param {{category?: string}} [options]
 * @returns {Item[]}
 */
export function getFeats(actor, { category } = {}) {
  return actor.items.filter((item) => item.type === "feat"
    && (category ? item.system.category === category : item.system.category !== "exaltedAsset"));
}

/**
 * Ask for the sub-category, characteristics, skill or specialty a feat needs.
 * Invalid submissions are reported and the dialog is shown again.
 * @param {{name: string, system: object}} feat
 * @param {Actor} actor
 * @param {{selection?: object, exclude?: string[], subcategory?: string}} [options]
 *   exclude: sub-categories already taken (e.g. the first Academy proficiency)
 * @returns {Promise<object|null>}  null if cancelled
 */
export async function promptFeatSelection(feat, actor, { selection = EMPTY_SELECTION, exclude = [] } = {}) {
  const system = feat.system;
  const needs = needsFeatSelection(system);
  const characteristics = actor.system.characteristics;
  let current = { ...EMPTY_SELECTION, ...selection };
  for (;;) {
    const content = await foundry.applications.handlebars.renderTemplate(CHOICE_TEMPLATE, {
      intro: game.i18n.format("DTD.Feat.ChooseIntro", { feat: feat.name }),
      needs,
      subcategories: system.featGroup.options.filter((option) => !exclude.includes(option)),
      selection: current,
      characteristics: characteristicOptions(system, characteristics).map((key) => ({
        key,
        label: localize(CHARACTERISTICS[key].label),
        value: characteristics[key].value,
        selected: key === current.characteristic
      })),
      characteristics2: Object.keys(CHARACTERISTICS).map((key) => ({
        key,
        label: localize(CHARACTERISTICS[key].label),
        selected: key === current.characteristic2
      })),
      skillGroups: GROUPS.map((group) => ({
        label: localize(`DTD.SkillGroup.${group}`),
        options: Object.entries(SKILLS).filter(([, def]) => def.group === group)
          .map(([key, def]) => ({ key, label: localize(def.label), selected: key === current.skill }))
      }))
    });
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.format("DTD.Feat.ChooseTitle", { feat: feat.name }) },
      classes: ["dtd40k", "feat-choice-dialog"],
      position: { width: 520 },
      content,
      buttons: [
        {
          action: "confirm",
          label: localize("DTD.Exaltation.Confirm"),
          icon: "fa-solid fa-check",
          default: true,
          callback: (event, button) => readSelection(button.form)
        },
        { action: "cancel", label: localize("Cancel"), icon: "fa-solid fa-xmark" }
      ],
      rejectClose: false
    });
    if (!result || result === "cancel") return null;
    const check = validateFeatSelection(system, result, { characteristics });
    const excluded = needs.subcategory && exclude.includes(result.subcategory.trim());
    if (check.valid && !excluded) return result;
    ui.notifications.warn(localize(`DTD.Feat.Error.${excluded ? "duplicate" : check.error}`));
    current = result;
  }
}

/**
 * Add a feat, racial feat, asset or hindrance after the book's checks (FR-007 to FR-009).
 * A refused feat can still be added by the GM (constitution IV).
 * @param {Actor} actor
 * @param {Item} featItem  dropped from a compendium, the sidebar or another actor
 * @param {{selection?: object}} [options]  skip the dialog with a known selection
 * @returns {Promise<Item|null>}
 */
export async function addFeat(actor, featItem, { selection } = {}) {
  if (actor.type !== "character") {
    ui.notifications.warn(localize("DTD.Exaltation.NotCharacter"));
    return null;
  }
  const needs = Object.values(needsFeatSelection(featItem.system)).some(Boolean);
  const chosen = selection ?? (needs ? await promptFeatSelection(featItem, actor) : { ...EMPTY_SELECTION });
  if (!chosen) return null;

  const name = fullName({ name: featItem.name, system: { selection: chosen } });
  const owned = getFeats(actor);
  // Buying a feat the character already received from a race, exaltation or asset marks it as purchased.
  const granted = owned.find((item) => item.name === name && grantedByOf(item).length && !item.getFlag("dtd40k", "purchased"));
  if (granted) {
    await granted.setFlag("dtd40k", "purchased", true);
    ui.notifications.info(game.i18n.format("DTD.Feat.AlreadyGranted", { feat: name }));
    return granted;
  }

  const check = validateFeatAdd({ feat: featItem, selection: chosen, owned, race: getRace(actor) });
  if (check.errors.length) {
    const message = check.errors.map((error) => game.i18n.format(`DTD.Feat.Error.${error}`, {
      feat: name,
      race: featItem.system.prerequisites.race
    })).join(" ");
    ui.notifications.warn(message);
    if (!game.user.isGM || !(await confirm("DTD.Feat.GMOverrideTitle", `<p>${message}</p><p>${localize("DTD.Feat.GMOverride")}</p>`))) {
      return null;
    }
  }
  for (const warning of check.warnings) {
    const text = game.i18n.format("DTD.Feat.MissingDependency", { feat: name, names: warning.names.join(", ") });
    if (!(await confirm("DTD.Feat.MissingDependencyTitle", `<p>${text}</p>`))) return null;
  }

  const created = await createFeat(actor, featItem, chosen, { purchased: true });
  if (!created) return null;
  for (const notice of check.notices) {
    ui.notifications.info(game.i18n.format(`DTD.Feat.Notice.${notice.type}`, { count: notice.count ?? 0 }));
  }
  return created;
}

/**
 * Remove a feat after confirmation (FR-010). Granted feats are removed by the GM only; a feat both
 * granted and purchased just loses the purchase.
 * @param {Actor} actor
 * @param {string} itemId
 */
export async function removeFeat(actor, itemId) {
  const feat = actor.items.get(itemId);
  if (!feat) return;
  const origins = grantedByOf(feat);
  const purchased = Boolean(feat.getFlag("dtd40k", "purchased"));
  if (origins.length && !purchased && !game.user.isGM) {
    ui.notifications.warn(game.i18n.format("DTD.Feat.RemoveGranted", { feat: feat.name, origin: originNames(actor, feat) }));
    return;
  }
  if (!(await confirm("DTD.Feat.Remove", `<p>${game.i18n.format("DTD.Feat.RemoveConfirm", { feat: feat.name })}</p>`))) return;
  if (origins.length && purchased && !game.user.isGM) await feat.setFlag("dtd40k", "purchased", false);
  else await feat.delete();
  await clampHeroPoints(actor);
}

/**
 * Add the feats an item grants (race, exaltation from its Power Stat rank, feat or asset — FR-013).
 * Called by DtdItem#_onCreate on the author's client, and when the Power Stat changes.
 * @param {Actor} actor
 * @param {Item} origin  embedded item of the actor
 */
export async function grantFeats(actor, origin) {
  const grants = origin.type === "exaltation"
    ? activeGrants(origin.system, actor.system.exaltation?.powerStat.value ?? 1)
    : origin.system.grants ?? [];
  if (!grants.length) return;

  // Feats whose only origins already left the actor are being released: treat them as absent.
  const live = getFeats(actor).filter((item) => item.getFlag("dtd40k", "purchased")
    || grantedByOf(item).some((id) => id === "perfection" || actor.items.has(id))
    || !grantedByOf(item).length);
  const plan = grantPlan(grants, live, origin.id);
  for (const id of plan.attach) {
    const item = actor.items.get(id);
    await item.setFlag("dtd40k", "grantedBy", [...grantedByOf(item), origin.id]);
  }
  if (!plan.create.length) return;

  const pack = game.packs.get(FEAT_PACK);
  const index = pack ? await pack.getIndex() : [];
  const ids = [...new Set(plan.create.map((grant) => index.find((entry) => entry.name === grant.name)?._id).filter(Boolean))];
  const documents = ids.length ? await pack.getDocuments({ _id__in: ids }) : [];
  const taken = {};
  for (const grant of plan.create) {
    const source = documents.find((doc) => doc.name === grant.name);
    if (!source) {
      ui.notifications.warn(game.i18n.format("DTD.Feat.GrantMissing", { feat: grant.name, origin: origin.name }));
      continue;
    }
    let selection = { ...EMPTY_SELECTION, subcategory: grant.subcategory };
    if (grant.choose) {
      const exclude = [...(taken[grant.name] ?? []), ...getFeats(actor).filter((item) => item.name.startsWith(`${grant.name} (`))
        .map((item) => item.system.selection.subcategory)];
      selection = await promptFeatSelection(source, actor, { exclude });
      if (!selection) continue;
      (taken[grant.name] ??= []).push(selection.subcategory.trim());
    }
    const name = fullName({ name: source.name, system: { selection } });
    const existing = live.find((item) => item.name === name && actor.items.has(item.id));
    if (existing) {
      if (!grantedByOf(existing).includes(origin.id)) await existing.setFlag("dtd40k", "grantedBy", [...grantedByOf(existing), origin.id]);
      continue;
    }
    await createFeat(actor, source, selection, { grantedBy: [origin.id] });
  }
}

/**
 * Take an origin out of the feats it granted, deleting those left without origin (FR-014).
 * @param {Actor} actor
 * @param {string} originId
 */
export async function releaseGrants(actor, originId) {
  const plan = releasePlan(getFeats(actor, { category: undefined }).concat(getFeats(actor, { category: "exaltedAsset" })), originId);
  if (plan.update.length) {
    await actor.updateEmbeddedDocuments("Item", plan.update.map(({ id, grantedBy }) => ({ _id: id, "flags.dtd40k.grantedBy": grantedBy })));
  }
  const remove = plan.remove.filter((id) => actor.items.has(id));
  if (remove.length) await actor.deleteEmbeddedDocuments("Item", remove);
  await clampHeroPoints(actor);
}

/**
 * Names of the items that granted a feat, for badges and messages.
 * @param {Actor} actor
 * @param {Item} feat
 * @returns {string}
 */
export function originNames(actor, feat) {
  return grantedByOf(feat).map((id) => (id === "perfection" ? "Perfection" : actor.items.get(id)?.name ?? "?")).join(", ");
}

/* -------------------------------------------- */

/**
 * Create the embedded feat with its name, selection and effects.
 * @param {Actor} actor
 * @param {Item} source
 * @param {object} selection
 * @param {{purchased?: boolean, grantedBy?: string[]}} flags
 * @returns {Promise<Item|null>}
 */
async function createFeat(actor, source, selection, { purchased = false, grantedBy = [] }) {
  const data = source.toObject();
  delete data._id;
  delete data.folder;
  data.name = fullName({ name: data.name, system: { selection } });
  data.system.selection = { ...EMPTY_SELECTION, ...selection };
  data.effects = buildFeatEffects(data.system, data.system.selection).map((effect) => ({
    name: game.i18n.format("DTD.Feat.Effect", {
      feat: data.name,
      effect: localize(`DTD.Feat.Automation.${effect.feat}`)
    }),
    img: data.img,
    transfer: true,
    changes: effect.changes,
    flags: { dtd40k: { feat: effect.feat } }
  }));
  foundry.utils.setProperty(data, "flags.dtd40k.purchased", purchased);
  foundry.utils.setProperty(data, "flags.dtd40k.grantedBy", grantedBy);

  const [created] = await actor.createEmbeddedDocuments("Item", [data]);
  if (created?.system.automation === "nineLives") {
    // Nine Lives (p. 207): the extra Hero Point is available right away.
    await actor.update({ "system.heroPoints.value": actor._source.system.heroPoints.value + 1 });
  }
  return created ?? null;
}

/**
 * Keep the current Hero Points within the maximum after an effect that raised it is gone.
 * @param {Actor} actor
 */
async function clampHeroPoints(actor) {
  const max = actor.system.heroPoints.max;
  if (actor._source.system.heroPoints.value > max) await actor.update({ "system.heroPoints.value": max });
}

/**
 * Yes/no confirmation dialog.
 * @param {string} titleKey
 * @param {string} content
 * @returns {Promise<boolean>}
 */
async function confirm(titleKey, content) {
  return Boolean(await foundry.applications.api.DialogV2.confirm({
    window: { title: localize(titleKey) },
    content,
    rejectClose: false
  }));
}

/**
 * Read the choice dialog form.
 * @param {HTMLFormElement} form
 * @returns {object}
 */
function readSelection(form) {
  const value = (name) => form.querySelector(`[name='${name}']:checked, select[name='${name}'], input[type='text'][name='${name}']`)?.value ?? "";
  return {
    subcategory: value("subcategory").trim(),
    characteristic: value("characteristic"),
    characteristic2: value("characteristic2"),
    skill: value("skill"),
    specialty: value("specialty").trim()
  };
}
