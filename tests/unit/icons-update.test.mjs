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
    expect(plan.counts).toEqual({ item: 1, actor: 1, token: 1, embedded: 1, effect: 0 });
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
    expect(plan.counts).toEqual({ item: 0, actor: 0, token: 0, embedded: 0, effect: 0 });
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

describe("planIconUpdates with effects (spec 025, FR-006)", () => {
  const conditionImages = { stunned: "systems/dtd40k/assets/icons/conditions/stunned.svg" };
  const effectImages = { degeneration: "systems/dtd40k/assets/icons/effects/degeneration.svg", barrelRoll: "systems/dtd40k/assets/icons/effects/barrelRoll.svg" };
  const ITEM_IMG = "systems/dtd40k/assets/icons/drug/stimm.svg";

  it("gives conditions their seal, service effects theirs and item effects the item's icon", () => {
    const plan = planIconUpdates({
      docs: [
        { uuid: "Actor.a.ActiveEffect.1", kind: "effect", img: "icons/svg/stoned.svg", statuses: ["stunned"], flags: {} },
        { uuid: "Actor.a.ActiveEffect.2", kind: "effect", img: "icons/svg/skull.svg", statuses: [], flags: { dtd40k: { degeneration: "x" } } },
        { uuid: "Actor.a.ActiveEffect.3", kind: "effect", img: "icons/svg/wing.svg", statuses: [], flags: { dtd40k: { effectIcon: "barrelRoll" } } },
        { uuid: "Actor.a.Item.s.ActiveEffect.4", kind: "effect", img: "icons/svg/aura.svg", statuses: [], flags: {}, itemImg: ITEM_IMG }
      ],
      sourceImages: {}, conditionImages, effectImages
    });
    expect(plan.updates.map((u) => u.img)).toEqual([conditionImages.stunned, effectImages.degeneration, effectImages.barrelRoll, ITEM_IMG]);
    expect(plan.counts.effect).toBe(4);
  });

  it("keeps custom effect images and effects it cannot place", () => {
    const plan = planIconUpdates({
      docs: [
        { uuid: "Actor.a.ActiveEffect.1", kind: "effect", img: "worlds/mist/art/curse.webp", statuses: ["stunned"], flags: {} },
        { uuid: "Actor.a.ActiveEffect.2", kind: "effect", img: "icons/svg/aura.svg", statuses: [], flags: {}, itemImg: "icons/svg/item-bag.svg" },
        { uuid: "Actor.a.ActiveEffect.3", kind: "effect", img: "icons/svg/aura.svg", statuses: ["modded"], flags: {} }
      ],
      sourceImages: {}, conditionImages, effectImages
    });
    expect(plan.updates).toEqual([]);
    expect(plan.skipped).toBe(3);
  });
});
