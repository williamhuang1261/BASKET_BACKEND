import fs from "fs";
import { getOpenSearchClient } from "./client.js";
import { ensureItemsIndex, indexItems, IndexableItem } from "./indexItems.js";
import { buildOpenSearchQuery, ITEMS_INDEX } from "./buildQuery.js";
import { sandboxEmbedding } from "./sandboxEmbedding.js";
import { categoriesType } from "../../data/categories.js";

interface SampleItem {
  name: { en: string; fr: string };
  categories: categoriesType[];
  ref: { code: string };
}

const QUERIES = ["banana", "milk", "bread", "cheese"];

const percentile = (sorted: number[], p: number): number => {
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
};

const timeQuery = async (
  client: ReturnType<typeof getOpenSearchClient>,
  vector: number[] | null,
  query: string
): Promise<number> => {
  const body = buildOpenSearchQuery(query, vector, [], "en");
  const start = performance.now();
  await client.search({ index: ITEMS_INDEX, body });
  return performance.now() - start;
};

const runMode = async (
  client: ReturnType<typeof getOpenSearchClient>,
  mode: "bm25" | "hybrid"
): Promise<{ mode: string; p50: number; p95: number; runs: number }> => {
  const timings: number[] = [];
  for (const query of QUERIES) {
    const vector = mode === "hybrid" ? sandboxEmbedding(query) : null;
    // Run each query a few times to get a stable-ish percentile from a tiny sample.
    for (let i = 0; i < 5; i++) {
      timings.push(await timeQuery(client, vector, query));
    }
  }
  timings.sort((a, b) => a - b);
  return {
    mode,
    p50: Number(percentile(timings, 50).toFixed(2)),
    p95: Number(percentile(timings, 95).toFixed(2)),
    runs: timings.length,
  };
};

const main = async () => {
  const client = getOpenSearchClient();
  await ensureItemsIndex(client);

  const raw = fs.readFileSync("assets/items.json", "utf-8");
  const items: SampleItem[] = JSON.parse(raw);

  const indexable: IndexableItem[] = items.map((item) => ({
    id: item.ref.code,
    name: item.name,
    categories: item.categories,
    embeddings: sandboxEmbedding(`${item.name.en} ${item.name.fr}`),
  }));

  const { indexed, errors } = await indexItems(client, indexable);
  console.log(`Indexed ${indexed}/${indexable.length} sample items into "${ITEMS_INDEX}" (${errors.length} errors)`);

  const bm25Result = await runMode(client, "bm25");
  const hybridResult = await runMode(client, "hybrid");

  console.log("\nQuery latency (ms), real local OpenSearch, sandbox embeddings for the kNN side (see sandboxEmbedding.ts):");
  console.table([bm25Result, hybridResult]);

  console.log(
    "\nNote: this compares OpenSearch's own query modes against each other on this machine. " +
    "It is not a comparison against production MongoDB Atlas Search - see docs/prd-search-infra-extension.md."
  );
};

main().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exitCode = 1;
});
