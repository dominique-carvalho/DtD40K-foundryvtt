import { describe, expect, it } from "vitest";
import {
  TRAIT_TEXT, fearRating, immunities, isAmorphous, isMindless, regeneration, traitArmor, traitAura, traitValue
} from "../../module/rules/npc.mjs";
import { NPC_TRAITS } from "../../module/config.mjs";

const t = (key, value = "") => ({ key, value: String(value) });

describe("TRAIT_TEXT (pp. 520–522)", () => {
  it("describes the twenty traits in our own words", () => {
    expect(Object.keys(TRAIT_TEXT).sort()).toEqual(Object.keys(NPC_TRAITS).sort());
    for (const [key, text] of Object.entries(TRAIT_TEXT)) expect(text, key).not.toBe("");
  });
});

describe("trait values", () => {
  it("reads the rating of a trait", () => {
    expect(traitValue([t("armorPlating", 6)], "armorPlating")).toBe(6);
    expect(traitValue([t("flyer", 14)], "flyer")).toBe(14);
    expect(traitValue([t("undead")], "undead")).toBe(0);
    expect(traitValue([], "aura")).toBeNull();
  });

  it("adds natural armor from Armor Plating, Machine and Daemonic (Constitution)", () => {
    expect(traitArmor([t("armorPlating", 4)], 3)).toBe(4);
    expect(traitArmor([t("machine", 6)], 3)).toBe(6);
    expect(traitArmor([t("daemonic")], 5)).toBe(5);
    expect(traitArmor([t("daemonic"), t("armorPlating", 2)], 5)).toBe(7);
    expect(traitArmor([], 5)).toBe(0);
  });

  it("reads Aura, Regeneration and Fear", () => {
    expect(traitAura([t("aura", 4)])).toBe(4);
    expect(traitAura([])).toBe(0);
    expect(regeneration([t("regeneration", 1)])).toBe(1);
    expect(fearRating([t("fear", 2)])).toBe(2);
    expect(fearRating([])).toBe(0);
  });

  it("knows the immunities and the body rules", () => {
    expect(immunities([t("undead")])).toEqual(["stunned", "bloodLoss"]);
    expect(immunities([t("stuffOfNightmares")])).toEqual(["stunned", "bloodLoss"]);
    expect(immunities([t("fear", 1)])).toEqual([]);
    expect(isAmorphous([t("amorphous")])).toBe(true);
    expect(isMindless([t("mindless")])).toBe(true);
    expect(isMindless([])).toBe(false);
  });
});
