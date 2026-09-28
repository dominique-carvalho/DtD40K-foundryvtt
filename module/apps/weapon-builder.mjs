import { WEAPON_CREATION_TYPES, WEAPON_MODS, WEAPON_TEMPLATES, buildWeapon, modLimit } from "../rules/weapon-creation.mjs";
import { createCustomWeapon, updateCustomWeapon } from "../documents/weapon-craft-service.mjs";

/**
 * Custom weapon builder (spec 015, US1; research R5; pp. 516–519): template, type, damage type and mods with a live
 * preview of the profile, rarity and TN, notes and warnings. Foundry v13 DialogV2 whose body is redrawn on each
 * change (as the martial builder of spec 010).
 */
const TEMPLATE = "systems/dtd40k/templates/apps/weapon-builder.hbs";
const localize = (key) => game.i18n.localize(key);
const format = (key, data) => game.i18n.format(key, data);
const qualityLabel = (q) => localize(CONFIG.DTD.WEAPON_QUALITIES[q.key]?.label ?? q.key) + (q.value ? ` (${q.value})` : "");
const sign = (n) => (n > 0 ? `+${n}` : `${n}`);

/** Short description of a mod's effect for the list. */
function describeMod(mod) {
  const e = mod.effect;
  const parts = [];
  if (e.damage) parts.push(`${sign(e.damage.rolled ?? 0)}k${e.damage.kept ?? 0}`);
  if (e.pen) parts.push(`${sign(e.pen)} Pen`);
  if (e.damageType) parts.push(localize(`DTD.DamageType.${e.damageType}`));
  if (e.rof?.autoDelta) parts.push(format("DTD.WeaponBuilder.AutoPlus", { n: e.rof.autoDelta }));
  else if (e.rof) parts.push(`ROF ${e.rof.single ? "S" : "-"}/${e.rof.auto || "-"}`);
  if (e.range === "double" || e.range === "half") parts.push(localize(`DTD.WeaponBuilder.Range.${e.range}`));
  if (e.clip) parts.push(localize(`DTD.WeaponBuilder.Clip.${e.clip}`));
  if (e.reload) parts.push(localize(`DTD.WeaponBuilder.Reload.${e.reload}`));
  if (e.explodeOn) parts.push(localize("DTD.WeaponBuilder.Explode9"));
  if (e.noExplode) parts.push(localize("DTD.WeaponBuilder.NoExplode"));
  for (const q of e.qualities ?? []) parts.push(qualityLabel(q));
  if (mod.condition && !mod.note) parts.push(localize(`DTD.WeaponBuilder.Condition.${mod.condition}`));
  if (mod.note) parts.push(mod.note);
  return parts.join(", ");
}

/**
 * Context of the builder body for a state.
 * @param {{family: string, template: string, type: string, damageType: string, mods: string[], name: string}} state
 */
function context(state) {
  const family = state.family;
  const types = WEAPON_CREATION_TYPES[family];
  const type = types[state.type];
  const limit = modLimit(family, state.type);
  const result = buildWeapon(state);
  const s = result.system;
  return {
    state,
    families: ["ranged", "melee"].map((key) => ({ key, label: localize(`DTD.WeaponBuilder.Family.${key}`), selected: key === family })),
    templates: Object.entries(WEAPON_TEMPLATES).filter(([, t]) => t.family === family)
      .map(([key]) => ({ key, label: localize(`DTD.WeaponBuilder.Template.${key}`), selected: key === state.template })),
    types: Object.keys(types).map((key) => ({ key, label: `${key} — ${localize(`DTD.WeaponBuilder.Type.${family}.${key}`)}`, selected: key === state.type })),
    damageChoices: Array.isArray(type.damageType) ? type.damageType.map((key) => ({ key, label: localize(`DTD.DamageType.${key}`), selected: key === s.damage.type })) : null,
    limit,
    mods: WEAPON_MODS[family].map((mod) => {
      const checked = state.mods.includes(mod.key);
      const compatible = mod.compatibility.includes("any") || mod.compatibility.includes(state.type);
      const full = !checked && state.mods.length >= limit;
      return {
        key: mod.key, name: mod.name, cost: sign(mod.cost), effect: describeMod(mod), checked,
        disabled: !checked && (!compatible || full),
        reason: !compatible ? localize("DTD.WeaponBuilder.Warn.incompatible") : full ? localize("DTD.WeaponBuilder.Warn.tooMany") : ""
      };
    }),
    preview: {
      damage: `${s.damage.rolled}k${s.damage.kept} ${s.damage.type}`, pen: s.pen,
      rof: s.weaponType === "melee" ? "—" : `${s.rof.single ? "S" : "-"}/${s.rof.auto || "-"}`,
      range: s.range.value ? `${s.range.value} m${s.thrown ? ` (${localize("DTD.WeaponType.thrown")})` : ""}` : "—",
      clip: s.weaponType === "melee" ? "—" : s.clip, reload: s.reload || "—",
      qualities: s.qualities.map(qualityLabel).join(", ") || "—",
      proficiencies: s.proficiencies.join(", "), group: s.group,
      rarity: localize(CONFIG.DTD.RARITIES[s.rarity].label), tn: result.availability.tn, cost: sign(result.cost)
    },
    notes: result.notes,
    warnings: result.warnings.map((w) => localize(`DTD.WeaponBuilder.Warn.${w}`))
  };
}

/**
 * Read the state from the form; mods keep the order they were picked in (the last rate-of-fire mod wins).
 * @param {HTMLFormElement} form
 * @param {object} previous
 */
function readState(form, previous) {
  const family = form.elements.family.value;
  const familyChanged = family !== previous.family;
  const template = familyChanged ? Object.entries(WEAPON_TEMPLATES).find(([, t]) => t.family === family)[0] : form.elements.template.value;
  const type = familyChanged ? "O" : form.elements.type.value;
  const checked = familyChanged ? [] : WEAPON_MODS[family].filter((m) => form.elements[`mod-${m.key}`]?.checked).map((m) => m.key);
  const mods = [...previous.mods.filter((k) => checked.includes(k)), ...checked.filter((k) => !previous.mods.includes(k))];
  const limit = modLimit(family, type);
  const compatible = (k) => { const m = WEAPON_MODS[family].find((x) => x.key === k); return m && (m.compatibility.includes("any") || m.compatibility.includes(type)); };
  return {
    family, template, type,
    // Only types with a choice keep one; a fixed type drops a leftover choice.
    damageType: familyChanged || !Array.isArray(WEAPON_CREATION_TYPES[family][type].damageType) ? "" : form.elements.damageType?.value ?? "",
    mods: mods.filter(compatible).slice(0, limit),
    name: form.elements.name.value
  };
}

/**
 * Open the builder (FR-002). Without an item it creates a weapon — in the world (GM) or on the actor's sheet (pending
 * for a player); with an item it rebuilds it.
 * @param {{actor?: Actor|null, item?: Item|null}} [options]
 * @returns {Promise<Item|null>}
 */
export async function openWeaponBuilder({ actor = null, item = null } = {}) {
  const b = item?.system.custom?.build;
  let state = b?.family
    ? { family: b.family, template: b.template, type: b.type, damageType: b.damageType, mods: [...b.mods], name: item.name }
    : { family: "ranged", template: "basic", type: "O", damageType: "", mods: [], name: "" };
  const render = async () => foundry.applications.handlebars.renderTemplate(TEMPLATE, context(state));
  const content = `<div class="weapon-builder-body">${await render()}</div>`;
  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: item ? format("DTD.WeaponBuilder.TitleEdit", { name: item.name }) : localize("DTD.WeaponBuilder.Title"), resizable: true },
    classes: ["dtd40k", "weapon-builder"], position: { width: 720, height: 760 }, content, rejectClose: false,
    render: (event, dialog) => {
      const form = dialog.element.querySelector("form");
      form.addEventListener("change", async () => {
        state = readState(form, state);
        form.querySelector(".weapon-builder-body").innerHTML = await render();
      });
    },
    buttons: [
      { action: "ok", label: item ? "DTD.WeaponBuilder.Update" : "DTD.WeaponBuilder.Create", icon: "fa-solid fa-hammer", default: true, callback: () => state },
      { action: "cancel", label: "DTD.Roll.Dialog.Cancel", icon: "fa-solid fa-xmark" }
    ]
  });
  if (!choice || typeof choice !== "object") return null;
  const build = { family: choice.family, template: choice.template, type: choice.type, damageType: choice.damageType, mods: choice.mods };
  return item ? updateCustomWeapon(item, build, choice.name) : createCustomWeapon(build, { actor, name: choice.name });
}

