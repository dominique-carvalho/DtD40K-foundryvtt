import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  WEAPON_AVAILABILITY, WEAPON_CREATION_TYPES, WEAPON_MODS, WEAPON_TEMPLATES,
  availability, buildWeapon, compatibleMods, modLimit, reloadStep, unstableDamage
} from "../../module/rules/weapon-creation.mjs";

const build = (template, type, mods = [], damageType = "") => buildWeapon({
  family: WEAPON_TEMPLATES[template].family, template, type, damageType, mods
});

describe("weapon creation tables (pp. 516–519)", () => {
  it("has every template, type, mod and availability row", () => {
    expect(Object.keys(WEAPON_TEMPLATES)).toEqual(["pistol", "basic", "cannon", "heavyRifle", "melee"]);
    expect(Object.keys(WEAPON_CREATION_TYPES.ranged)).toEqual(["O", "L", "P", "M", "B", "S", "E", "F"]);
    expect(Object.keys(WEAPON_CREATION_TYPES.melee)).toEqual(["O", "P", "C", "F", "N", "T", "S", "A", "H", "U"]);
    expect([WEAPON_MODS.ranged.length, WEAPON_MODS.melee.length]).toEqual([46, 22]);
    expect(WEAPON_AVAILABILITY).toHaveLength(12);
    expect(new Set(WEAPON_MODS.ranged.map((m) => m.key)).size).toBe(46);
  });

  it("gives each type the group and proficiencies of the matching 007 weapons", () => {
    const pack = readdirSync("src/packs/equipment").map((f) => JSON.parse(readFileSync(join("src/packs/equipment", f), "utf8"))).filter((d) => d.type === "weapon");
    for (const [family, types] of Object.entries(WEAPON_CREATION_TYPES)) {
      for (const [letter, t] of Object.entries(types)) {
        const same = pack.filter((d) => d.system.group === t.group && (family === "melee" ? d.system.weaponType === "melee" : d.system.weaponType !== "melee"));
        expect(same.length, `${family} ${letter}`).toBeGreaterThan(0);
        expect(same.map((d) => d.system.proficiencies), `${family} ${letter}`).toContainEqual(t.proficiencies);
      }
    }
  });
});

describe("availability, compatibility and limits", () => {
  it("maps the rarity total to the chart, clamped at both ends", () => {
    expect(availability(2)).toMatchObject({ rarity: "rare", tn: 20 });
    expect(availability(0)).toMatchObject({ rarity: "common", tn: 10 });
    expect(availability(-4)).toMatchObject({ rarity: "worthless", tn: 0 });
    expect(availability(9)).toMatchObject({ rarity: "glittergold", tn: 50 });
  });

  it("lists only the mods open to a type letter", () => {
    const flamer = compatibleMods("ranged", "F").map((m) => m.key);
    expect(flamer).toEqual(expect.arrayContaining(["coneEffect", "explosiveRounds", "heavyWarhead"]));
    expect(flamer).not.toContain("advRifling");
    expect(compatibleMods("melee", "A").map((m) => m.key)).toContain("twoHands");
  });

  it("allows 2 mods, or 3 with an extra-mod type", () => {
    expect([modLimit("ranged", "L"), modLimit("ranged", "S"), modLimit("melee", "S")]).toEqual([2, 3, 3]);
  });
});

describe("buildWeapon", () => {
  it("builds a Las rifle with an Extended Clip and a Red-Dot Sight", () => {
    const r = build("basic", "L", ["extendedClip", "redDotSight"]);
    expect(r.system).toMatchObject({ weaponType: "basic", group: "Las", proficiencies: ["Basic", "Ranged 2"], damage: { rolled: 3, kept: 2, type: "E" }, pen: 0, rof: { single: true, auto: 0 }, range: { value: 40 }, clip: 48, reload: "Full", rarity: "rare" });
    expect(r.system.qualities).toEqual([{ key: "reliable", value: null }]);
    expect([r.cost, r.availability.tn]).toEqual([2, 20]);
    expect(r.conditions).toEqual(["redDotSight"]);
    expect(r.warnings).toEqual([]);
  });

  it("stacks equal damage bonuses", () => {
    const r = build("pistol", "B", ["highCaliber", "magnumRounds"]);
    expect(r.system).toMatchObject({ damage: { rolled: 5, kept: 2, type: "X" }, pen: 2 });
    expect(r.cost).toBe(2);
  });

  it("doubles the reload of a Plasma cannon", () => {
    const r = build("cannon", "P");
    expect(r.system).toMatchObject({ damage: { rolled: 3, kept: 3, type: "E" }, pen: 6, reload: "4 Full" });
    expect(r.cost).toBe(0);
  });

  it("halves range and ammo and reaches Worthless", () => {
    const r = build("heavyRifle", "O", ["sawedOff", "lowAmmo"]);
    expect(r.system).toMatchObject({ range: { value: 30 }, clip: 20 });
    expect(r.availability).toMatchObject({ cost: -3, rarity: "worthless", tn: 0 });
  });

  it("builds melee weapons", () => {
    const chain = build("melee", "A", ["twoHands"]);
    expect(chain.system).toMatchObject({ weaponType: "melee", group: "Chain", damage: { rolled: 2, kept: 3, type: "R" } });
    expect(chain.system.qualities.map((q) => q.key).sort()).toEqual(["tearing", "twoHands"]);
    expect(chain.cost).toBe(2);
    const syrneth = build("melee", "S", ["incendiary", "powerField", "extraPenI"], "R");
    expect(syrneth.system).toMatchObject({ damage: { type: "E" }, pen: 5 });
    expect(syrneth.system.qualities.map((q) => q.key).sort()).toEqual(["incendiary", "powerField"]);
    expect(syrneth.cost).toBe(5);
  });

  it("keeps the last rate-of-fire mod with a warning and adds Bullet Hose to full auto", () => {
    const r = build("basic", "O", ["burstFire", "machineGun"]);
    expect(r.system.rof).toEqual({ single: true, auto: 6 });
    expect(r.warnings).toContain("rofOverride");
    const hose = build("basic", "L", ["bulletHose"]);
    expect(hose.system.rof).toEqual({ single: true, auto: 2 });
    expect(hose.system.qualities.map((q) => q.key)).toContain("inaccurate");
  });

  it("warns on too many, incompatible or repeated mods and keeps the book's other effects as notes", () => {
    expect(build("basic", "L", ["extendedClip", "redDotSight", "quickDraw"]).warnings).toContain("tooMany");
    expect(build("basic", "F", ["advRifling"]).warnings).toContain("incompatible");
    expect(build("basic", "L", ["extendedClip", "extendedClip"]).warnings).toContain("duplicate");
    expect(build("basic", "L", ["quickDraw"]).notes.length).toBe(1);
    expect(build("melee", "O", ["throwing"]).system).toMatchObject({ thrown: true, range: { value: 10 } });
  });
});

describe("reload steps and Unstable", () => {
  it("steps reload times", () => {
    expect([reloadStep("Full", "double"), reloadStep("2 Full", "double"), reloadStep("Full", "half"), reloadStep("Half", "half")]).toEqual(["2 Full", "4 Full", "Half", "Half"]);
  });

  it("halves on a 1 and doubles on a 10", () => {
    expect([unstableDamage(20, 1), unstableDamage(20, 10), unstableDamage(21, 1), unstableDamage(20, 5)]).toEqual([10, 40, 10, 20]);
  });
});
