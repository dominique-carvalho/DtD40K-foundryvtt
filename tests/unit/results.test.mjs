import { describe, expect, it } from "vitest";
import { evaluateOutcome } from "../../module/rules/results.mjs";

describe("evaluateOutcome", () => {
  it.each([
    [27, 15, { success: true, raises: 2, checks: 0 }],
    [9, 20, { success: false, raises: 0, checks: 2 }],
    [15, 15, { success: true, raises: 0, checks: 0 }],
    [14, 15, { success: false, raises: 0, checks: 0 }],
    [40, 15, { success: true, raises: 5, checks: 0 }]
  ])("total %i vs TN %i", (total, tn, expected) => {
    expect(evaluateOutcome(total, tn)).toEqual(expected);
  });

  it("returns null without a TN", () => {
    expect(evaluateOutcome(20, null)).toBeNull();
    expect(evaluateOutcome(20, undefined)).toBeNull();
    expect(evaluateOutcome(20, "")).toBeNull();
  });

  it("accepts a numeric string TN", () => {
    expect(evaluateOutcome(20, "15")).toEqual({ success: true, raises: 1, checks: 0 });
  });
});
