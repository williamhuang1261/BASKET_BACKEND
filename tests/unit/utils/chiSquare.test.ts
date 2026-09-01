import { describe, expect, it } from "vitest";
import { chiSquareTest } from "../../../src/utils/chiSquare";

describe("chiSquareTest", () => {
  it("matches a hand-worked 2x2 example exactly", () => {
    // A: 100 exposures, 20 conversions (80 non). B: 100 exposures, 40
    // conversions (60 non). Expected counts under independence: 30/70 for
    // both rows (totals: 200 exposures, 60 conversions, 140 non).
    // chi-square = (20-30)^2/30 + (80-70)^2/70 + (40-30)^2/30 + (60-70)^2/70
    //            = 100/30 + 100/70 + 100/30 + 100/70 = 200/21
    const result = chiSquareTest(100, 20, 100, 40);
    expect(result.chiSquare).toBeCloseTo(200 / 21, 10);
    expect(result.degreesOfFreedom).toBe(1);
  });

  it("reports a small, significant p-value for a large observed difference", () => {
    // chi-square ~9.52 comfortably clears the df=1 critical value at
    // alpha=0.01 (6.63), so the p-value must sit below 0.01.
    const result = chiSquareTest(100, 20, 100, 40);
    expect(result.pValue).toBeLessThan(0.01);
    expect(result.pValue).toBeGreaterThan(0);
  });

  it("reports chi-square 0 and p-value 1 when both variants convert identically", () => {
    const result = chiSquareTest(100, 30, 100, 30);
    expect(result.chiSquare).toBeCloseTo(0, 10);
    expect(result.pValue).toBeCloseTo(1, 6);
  });

  it("reports a large, non-significant p-value for a small observed difference", () => {
    // A one-conversion difference on small samples should not clear even
    // the loosest conventional significance threshold (alpha=0.05).
    const result = chiSquareTest(20, 5, 20, 6);
    expect(result.pValue).toBeGreaterThan(0.05);
  });

  it("does not divide by zero when a variant has no exposures", () => {
    const result = chiSquareTest(0, 0, 100, 40);
    expect(result.chiSquare).toBe(0);
    expect(result.pValue).toBe(1);
  });

  it("increases as the gap between conversion rates widens, all else equal", () => {
    const small = chiSquareTest(100, 20, 100, 25);
    const large = chiSquareTest(100, 20, 100, 40);
    expect(large.chiSquare).toBeGreaterThan(small.chiSquare);
  });
});
