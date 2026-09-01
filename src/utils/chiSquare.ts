export interface ChiSquareResult {
  chiSquare: number;
  degreesOfFreedom: number;
  /** Two-tailed p-value for a 2x2 contingency table (1 degree of freedom). */
  pValue: number;
}

/**
 * @description Abramowitz & Stegun 7.1.26 approximation of the error
 * function, max absolute error ~1.5e-7 - accurate enough for a significance
 * readout, and avoids pulling in a statistics dependency for one formula.
 * @param {number} x
 * @returns {number}
 */
const erf = (x: number): number => {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * absX);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
};

/**
 * @description The two-tailed p-value for a chi-square statistic with 1
 * degree of freedom, using the identity chi-square(1) = Z^2 for a standard
 * normal Z: P(chi-square > x) = P(|Z| > sqrt(x)) = erfc(sqrt(x / 2)).
 * @param {number} chiSquare
 * @returns {number}
 */
const pValueForOneDegreeOfFreedom = (chiSquare: number): number => {
  if (chiSquare <= 0) return 1;
  return 1 - erf(Math.sqrt(chiSquare / 2));
};

/**
 * @description Pearson's chi-square test of independence on a 2x2
 * contingency table (exposures vs. conversions for two variants). Used by
 * scripts/analyzeExperiment.ts to report whether an observed difference in
 * conversion rate between variant A and variant B is likely more than
 * chance - see docs/prd-ab-testing.md for what this significance test does
 * and does not establish.
 * @param {number} aExposures - Variant A exposure count
 * @param {number} aConversions - Variant A conversion count (<= aExposures)
 * @param {number} bExposures - Variant B exposure count
 * @param {number} bConversions - Variant B conversion count (<= bExposures)
 * @example
 * chiSquareTest(100, 20, 100, 40)
 * // { chiSquare: 9.523809523809524, degreesOfFreedom: 1, pValue: ~0.002 }
 * @returns {ChiSquareResult}
 */
export const chiSquareTest = (
  aExposures: number,
  aConversions: number,
  bExposures: number,
  bConversions: number,
): ChiSquareResult => {
  const total = aExposures + bExposures;
  if (total === 0 || aExposures === 0 || bExposures === 0) {
    return { chiSquare: 0, degreesOfFreedom: 1, pValue: 1 };
  }

  const aNonConversions = aExposures - aConversions;
  const bNonConversions = bExposures - bConversions;
  const totalConversions = aConversions + bConversions;
  const totalNonConversions = aNonConversions + bNonConversions;

  const expected = (rowTotal: number, colTotal: number): number =>
    (rowTotal * colTotal) / total;

  const term = (observed: number, expectedValue: number): number =>
    expectedValue === 0 ? 0 : (observed - expectedValue) ** 2 / expectedValue;

  const chiSquare =
    term(aConversions, expected(aExposures, totalConversions)) +
    term(aNonConversions, expected(aExposures, totalNonConversions)) +
    term(bConversions, expected(bExposures, totalConversions)) +
    term(bNonConversions, expected(bExposures, totalNonConversions));

  return {
    chiSquare,
    degreesOfFreedom: 1,
    pValue: pValueForOneDegreeOfFreedom(chiSquare),
  };
};
