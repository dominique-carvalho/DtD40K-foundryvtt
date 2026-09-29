import { describe, expect, it } from "vitest";
import {
  inCone, opposedResult, pinningImmune, pinningTn, pushDistance, restriction, slipFreeTn, suppressionHits
} from "../../module/rules/maneuvers.mjs";

describe("opposedResult (research R1)", () => {
  it("gives the win to the highest total and a raise per 5", () => {
    expect(opposedResult(22, 13)).toEqual({ winner: "a", raises: 1 });
    expect(opposedResult(10, 31)).toEqual({ winner: "b", raises: 4 });
  });

  it("gives a tie to the defender", () => {
    expect(opposedResult(13, 13)).toEqual({ winner: "b", raises: 0 });
  });
});

describe("inCone (research R2)", () => {
  const cone = { origin: { x: 0, y: 0 }, direction: 0, angle: 45, distance: 1000 };
  const at = (deg, r) => ({ x: Math.cos((deg * Math.PI) / 180) * r, y: Math.sin((deg * Math.PI) / 180) * r });

  it("keeps points within half the angle and the distance", () => {
    expect(inCone({ ...cone, point: at(20, 500) })).toBe(true);
    expect(inCone({ ...cone, point: at(-22, 999) })).toBe(true);
    expect(inCone({ ...cone, point: at(45, 500) })).toBe(false);
    expect(inCone({ ...cone, point: at(0, 1001) })).toBe(false);
  });

  it("wraps the direction around 360°", () => {
    expect(inCone({ ...cone, direction: 350, point: at(5, 300) })).toBe(true);
    expect(inCone({ ...cone, direction: 180, point: at(-170, 300) })).toBe(true);
  });
});

describe("suppressionHits (p. 430)", () => {
  const targets = [
    { id: "a", sd: 20, covered: false },
    { id: "b", sd: 22, covered: false },
    { id: "c", sd: 15, covered: true },
    { id: "d", sd: 25, covered: false }
  ];

  it("hits uncovered targets with a Static Defense below the total", () => {
    expect(suppressionHits({ total: 25, targets, rof: 10 })).toEqual(["a", "b"]);
  });

  it("draws at random past the rate of fire", () => {
    const many = ["a", "b", "c", "d", "e"].map((id) => ({ id, sd: 10, covered: false }));
    const hits = suppressionHits({ total: 30, targets: many, rof: 3, rng: () => 0 });
    expect(hits).toHaveLength(3);
    expect(new Set(hits).size).toBe(3);
  });
});

describe("Pinning (pp. 443–444)", () => {
  it("uses TN 20, and 10 to escape out of fire", () => {
    expect(pinningTn({})).toBe(20);
    expect(pinningTn({ escape: true, underFire: true })).toBe(20);
    expect(pinningTn({ escape: true, underFire: false })).toBe(10);
  });

  it("knows the immune feats", () => {
    expect(pinningImmune(["Fearless"])).toBe(true);
    expect(pinningImmune(["Headstrong", "Hardy"])).toBe(true);
    expect(pinningImmune(["Hardy"])).toBe(false);
  });
});

describe("Grapple (p. 427)", () => {
  it("pushes 2 m plus 2 m per raise up to the Speed", () => {
    expect(pushDistance({ raises: 1, speed: 6 })).toBe(4);
    expect(pushDistance({ raises: 5, speed: 6 })).toBe(6);
  });

  it("raises the Slip Free TN against Bear Hug", () => {
    expect(slipFreeTn({ bearHug: false })).toBe(20);
    expect(slipFreeTn({ bearHug: true })).toBe(25);
  });
});

describe("restriction", () => {
  const act = (key, type) => ({ key, type });

  it("refuses Full Actions while Pinned", () => {
    expect(restriction({ statuses: ["pinned"], action: act("charge", "full") })).toEqual({ allowed: false, reason: "pinnedFull" });
    expect(restriction({ statuses: ["pinned"], action: act("move", "varies"), as: "full" }).reason).toBe("pinnedFull");
    expect(restriction({ statuses: ["pinned"], action: act("standardAttack", "half") }).allowed).toBe(true);
  });

  it("limits the grappled to the escape actions", () => {
    expect(restriction({ statuses: ["grappled"], action: act("charge", "full") })).toEqual({ allowed: false, reason: "grappled" });
    expect(restriction({ statuses: ["grappled"], action: act("breakFree", "full") }).allowed).toBe(true);
    expect(restriction({ statuses: ["grappled"], action: act("dodge", "reaction") }).allowed).toBe(true);
    expect(restriction({ statuses: ["grappled"], action: act("dropProne", "free") }).allowed).toBe(true);
  });

  it("limits the controller to the grapple", () => {
    expect(restriction({ statuses: ["grappling"], action: act("standardAttack", "half") })).toEqual({ allowed: false, reason: "grappling" });
    expect(restriction({ statuses: ["grappling"], action: act("grappleControl", "full") }).allowed).toBe(true);
  });

  it("lets everyone else act", () => {
    expect(restriction({ statuses: [], action: act("charge", "full") }).allowed).toBe(true);
  });
});
