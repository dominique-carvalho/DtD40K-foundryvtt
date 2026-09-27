import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { afterFailure, alignmentCheck, changeAlignment, degenerationRow, recover } from "../../module/rules/alignment.mjs";

describe("alignmentCheck (p. 284)", () => {
  it("passes when the die plus the bonus meets the Devotion", () => {
    expect(alignmentCheck({ d10: 7, bonus: 0, devotion: 6 })).toEqual({ total: 7, pass: true });
    expect(alignmentCheck({ d10: 6, bonus: 0, devotion: 6 }).pass).toBe(true);
    expect(alignmentCheck({ d10: 4, bonus: 2, devotion: 6 })).toEqual({ total: 6, pass: true });
    expect(alignmentCheck({ d10: 3, bonus: 0, devotion: 8 })).toEqual({ total: 3, pass: false });
  });
});

describe("afterFailure (pp. 284–285)", () => {
  it("loses a point; at 6 or less a second check follows; 0 is out of play", () => {
    expect(afterFailure(8)).toEqual({ devotion: 7, second: false, outOfPlay: false });
    expect(afterFailure(7)).toEqual({ devotion: 6, second: true, outOfPlay: false });
    expect(afterFailure(6)).toEqual({ devotion: 5, second: true, outOfPlay: false });
    expect(afterFailure(1)).toEqual({ devotion: 0, second: false, outOfPlay: true });
  });
});

describe("recover (p. 285)", () => {
  it("gains a point on a pass and cures the Degeneration of the point left", () => {
    expect(recover({ pass: true, devotion: 5 })).toEqual({ devotion: 6, cures: 5 });
    expect(recover({ pass: false, devotion: 5 })).toEqual({ devotion: 5, cures: null });
    expect(recover({ pass: true, devotion: 10 })).toEqual({ devotion: 10, cures: null });
  });
});

describe("changeAlignment (p. 286)", () => {
  it("costs 2 Devotion in the same pantheon, resets to 4 with a Degeneration at 7 across pantheons, only once", () => {
    expect(changeAlignment({ fromPantheon: "blessedPantheon", toPantheon: "blessedPantheon", devotion: 6, changes: 0 })).toEqual({ devotion: 4, degenerationAt: null, refused: false });
    expect(changeAlignment({ fromPantheon: "blessedPantheon", toPantheon: "blessedPantheon", devotion: 2, changes: 0 }).devotion).toBe(1);
    expect(changeAlignment({ fromPantheon: "blessedPantheon", toPantheon: "ruinousPowers", devotion: 9, changes: 0 })).toEqual({ devotion: 4, degenerationAt: 7, refused: false });
    expect(changeAlignment({ fromPantheon: "blessedPantheon", toPantheon: "grayCouncil", devotion: 6, changes: 1 }).refused).toBe(true);
  });
});

describe("degenerationRow (p. 286)", () => {
  const table = JSON.parse(readFileSync("src/packs/combat-tables/degeneration.json", "utf8"));
  const name = (row) => row?.flags.dtd40k.name ?? null;
  it("finds the row of a roll, 62 as Malign Sight, 00 as the last row", () => {
    expect(name(degenerationRow(table.results, 5, []))).toBe("Palsy");
    expect(name(degenerationRow(table.results, 62, []))).toBe("Malign Sight");
    expect(name(degenerationRow(table.results, 63, []))).toBe("Ashen Taste");
    expect(name(degenerationRow(table.results, 100, []))).toBe("Blighted Mind");
  });

  it("returns null for a Degeneration the character already has (roll again)", () => {
    expect(degenerationRow(table.results, 5, ["Palsy"])).toBeNull();
    expect(name(degenerationRow(table.results, 8, ["Palsy"]))).toBe("Dark-Hearted");
  });
});
