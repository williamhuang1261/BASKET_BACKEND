/**
 * @fileoverview Reads logged experiment events from MongoDB and prints a
 * conversion-rate and chi-square significance readout per variant. Reports
 * whatever the data actually shows, including "not enough data" or "not
 * significant" - see docs/prd-ab-testing.md for what this significance test
 * does and does not establish (no real production traffic exists yet, so
 * this is a demonstration of the method on whatever events have been
 * logged, not a real product decision).
 *
 * Usage: npm run analyze:experiment -- <experimentId>
 * Needs BASKET_DB_CONNECTION_STRING, same as the rest of the app.
 */
import mongoose from "mongoose";
import ExperimentEvent from "../models/experimentEvent.js";
import { chiSquareTest } from "../utils/chiSquare.js";

interface VariantCounts {
  exposures: number;
  conversions: number;
}

const MINIMUM_EXPOSURES_FOR_A_READOUT = 30;

const countVariant = async (
  experimentId: string,
  variant: "A" | "B",
): Promise<VariantCounts> => {
  const [exposures, conversions] = await Promise.all([
    ExperimentEvent.countDocuments({ experimentId, variant, eventType: "exposure" }),
    ExperimentEvent.countDocuments({ experimentId, variant, eventType: "conversion" }),
  ]);
  return { exposures, conversions };
};

const conversionRate = (counts: VariantCounts): number =>
  counts.exposures === 0 ? 0 : counts.conversions / counts.exposures;

const analyzeExperiment = async (experimentId: string): Promise<void> => {
  const [a, b] = await Promise.all([
    countVariant(experimentId, "A"),
    countVariant(experimentId, "B"),
  ]);

  console.log(`Experiment: ${experimentId}`);
  console.log(
    `Variant A: ${a.conversions}/${a.exposures} (${(conversionRate(a) * 100).toFixed(2)}%)`,
  );
  console.log(
    `Variant B: ${b.conversions}/${b.exposures} (${(conversionRate(b) * 100).toFixed(2)}%)`,
  );

  if (
    a.exposures < MINIMUM_EXPOSURES_FOR_A_READOUT ||
    b.exposures < MINIMUM_EXPOSURES_FOR_A_READOUT
  ) {
    console.log(
      `Insufficient data: fewer than ${MINIMUM_EXPOSURES_FOR_A_READOUT} exposures on at least one variant. No significance readout.`,
    );
    return;
  }

  const result = chiSquareTest(
    a.exposures,
    a.conversions,
    b.exposures,
    b.conversions,
  );
  const verdict = result.pValue < 0.05 ? "significant" : "not significant";
  console.log(
    `chi-square = ${result.chiSquare.toFixed(4)}, p = ${result.pValue.toFixed(6)} (${verdict} at alpha=0.05)`,
  );
};

const main = async (): Promise<void> => {
  const experimentId = process.argv[2];
  if (!experimentId) {
    console.error("Usage: npm run analyze:experiment -- <experimentId>");
    process.exit(1);
  }

  const db = process.env.BASKET_DB_CONNECTION_STRING;
  if (!db) {
    throw new Error("FATAL ERROR: BASKET_DB_CONNECTION_STRING is not defined.");
  }

  await mongoose.connect(db);
  try {
    await analyzeExperiment(experimentId);
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
