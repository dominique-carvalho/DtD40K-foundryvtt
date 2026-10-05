import { describe, expect, it } from "vitest";
import { isCoreImage, planIconUpdates } from "../../module/rules/icons.mjs";

/**
 * Updating the world's documents to the new compendium icons (spec 024, FR-010, research R8): only documents that came
 * from a compendium of the system and still use a Foundry image change; custom images are kept.
 */

const SOURCE = "Compendium.dtd40k.equipment.Item.dtdE1";
const NPC = "Compendium.dtd40k.antagonists.Actor.dtdN1";
const sourceImages = {
  [SOURCE]: { img: "systems/dtd40k/assets/icons/weapon-pistol/autopistol.svg" },
  [NPC]: { img: "systems/dtd40k/assets/icons/npc/dragon.svg", token: "systems/dtd40k/assets/icons/npc/dragon.svg" }
};

describe("isCoreImage", () => {
  it("recognizes the Foundry images and the empty one", () => {
    expect(isCoreImage("icons/svg/target.svg")).toBe(true);
    expect(isCoreImage("icons/svg/mystery-man.svg")).toBe(true);
    expect(isCoreImage("")).toBe(true);
    expect(isCoreImage(null)).toBe(true);
    expect(isCoreImage("worlds/mist/art/aldred.webp")).toBe(false);
    expect(isCoreImage("systems/dtd40k/assets/icons/npc/dragon.svg")).toBe(false);
  });
});

describe("planIconUpdates", () => {
  it("updates items, actors, embedded items and prototype tokens that still use the old image", () => {
    const plan = planIconUpdates({
      docs: [
        { uuid: "Item.a", kind: "item", img: "icons/svg/target.svg", source: SOURCE },
        { uuid: "Actor.d", kind: "actor", img: "icons/svg/mystery-man.svg", source: NPC },
        { uuid: "Actor.d.Token", kind: "token", img: "icons/svg/mystery-man.svg", source: NPC },
        { uuid: "Actor.x.Item.b", kind: "embedded", img: "icons/svg/target.svg", source: SOURCE }
      ],
      sourceImages
    });
    expect(plan.updates).toEqual([
      { uuid: "Item.a", kind: "item", img: sourceImages[SOURCE].img },
      { uuid: "Actor.d", kind: "actor", img: sourceImages[NPC].img },
      { uuid: "Actor.d.Token", kind: "token", img: sourceImages[NPC].token },
      { uuid: "Actor.x.Item.b", kind: "embedded", img: sourceImages[SOURCE].img }
    ]);
    expect(plan.counts).toEqual({ item: 1, actor: 1, token: 1, embedded: 1 });
  });

  it("keeps custom images, other sources, unknown sources and documents already up to date", () => {
    const plan = planIconUpdates({
      docs: [
        { uuid: "Item.custom", kind: "item", img: "worlds/mist/art/sword.webp", source: SOURCE },
        { uuid: "Item.other", kind: "item", img: "icons/svg/target.svg", source: "Compendium.world.loot.Item.z" },
        { uuid: "Item.none", kind: "item", img: "icons/svg/target.svg", source: "" },
        { uuid: "Item.gone", kind: "item", img: "icons/svg/target.svg", source: "Compendium.dtd40k.equipment.Item.missing" },
        { uuid: "Item.done", kind: "item", img: sourceImages[SOURCE].img, source: SOURCE }
      ],
      sourceImages
    });
    expect(plan.updates).toEqual([]);
    expect(plan.counts).toEqual({ item: 0, actor: 0, token: 0, embedded: 0 });
    expect(plan.skipped).toBe(5);
  });
});

describe("default icons (FR-009)", () => {
  it("picks the icon of the category, then of the type", async () => {
    const { ICONS } = await import("../../module/config.mjs");
    const { defaultIconFor } = await import("../../module/rules/icons.mjs");
    expect(defaultIconFor(ICONS, "item", { type: "gear", system: { category: "drug" } })).toMatch(/defaults\/drug\.svg$/);
    expect(defaultIconFor(ICONS, "item", { type: "weapon", system: { weaponType: "pistol" } })).toMatch(/defaults\/weapon-pistol\.svg$/);
    expect(defaultIconFor(ICONS, "item", { type: "weapon", system: {} })).toMatch(/defaults\/weapon-melee\.svg$/);
    expect(defaultIconFor(ICONS, "actor", { type: "npc" })).toMatch(/defaults\/npc\.svg$/);
    expect(defaultIconFor(ICONS, "item", { type: "unknown" })).toBeNull();
  });

  it("mirrors the categories and points at existing files", async () => {
    const { readFileSync, existsSync } = await import("node:fs");
    const { ICONS } = await import("../../module/config.mjs");
    const categories = JSON.parse(readFileSync("src/icons/categories.json", "utf8"));
    const expected = { item: {}, actor: {} };
    for (const c of categories) for (const d of c.defaultFor ?? []) {
      const path = `systems/dtd40k/assets/icons/defaults/${c.key}.svg`;
      if (d.startsWith("actor:")) expected.actor[d.slice(6)] = path; else expected.item[d] = path;
    }
    expect({ item: ICONS.item, actor: ICONS.actor }).toEqual(expected);
    for (const path of [...Object.values(ICONS.item), ...Object.values(ICONS.actor)]) expect(existsSync(path.replace("systems/dtd40k/", "")), path).toBe(true);
  });

  it("covers every document type of the system", async () => {
    const { readFileSync } = await import("node:fs");
    const { ICONS } = await import("../../module/config.mjs");
    const types = JSON.parse(readFileSync("system.json", "utf8")).documentTypes;
    expect(Object.keys(types.Item).filter((t) => !ICONS.item[t])).toEqual([]);
    expect(Object.keys(types.Actor).filter((t) => !ICONS.actor[t])).toEqual([]);
  });
});
