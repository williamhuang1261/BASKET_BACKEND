/**
 * @fileoverview Seeds a local MongoDB Atlas Local instance (see
 * `docker-compose.dev.yml`'s `mongo-atlas-local` service) with the existing
 * 25-item sample catalog (`assets/items.json`) and creates the Atlas Search
 * indexes `/items/search` and `/items/autocomplete` actually query at
 * runtime (`item_search_{en,fr}`, `item_autocomplete_{en,fr}`).
 *
 * This is what makes `loadtest/search.js` a real load test instead of a
 * mocked one: MongoDB's official `mongodb-atlas-local` image bundles
 * `mongot`, so the app's real `$search` aggregation stage runs against a
 * real search index here, not a stand-in.
 *
 * No `vector_search_index` is created - `getVectorSearchObject.ts` needs a
 * live Vertex AI embeddings call this environment has no credentials for,
 * so it throws and the app's own existing fallback (see
 * `getHybridSearchPipeline.ts`) already degrades to full-text-only. That
 * fallback path is exactly what this load test exercises; the `embeddings`
 * field is only populated (via the existing `sandboxEmbedding` stand-in
 * used by `benchmarkSearch.ts`) because the schema requires it, not because
 * vector search runs here.
 *
 * Usage: BASKET_DB_CONNECTION_STRING=mongodb://localhost:27777/basket_loadtest npm run seed:loadtest
 */
import fs from "fs";
import mongoose from "mongoose";
import Item from "../models/items.js";
import { sandboxEmbedding } from "../search/opensearch/sandboxEmbedding.js";

interface SampleItem {
  name: { en: string; fr: string };
  categories?: string[];
  [key: string]: unknown;
}

const SEARCH_INDEX_DEFINITION = {
  mappings: { dynamic: true },
};

const AUTOCOMPLETE_INDEX_DEFINITION = (language: "en" | "fr") => ({
  mappings: {
    dynamic: false,
    fields: {
      name: {
        type: "document",
        fields: {
          [language]: {
            type: "autocomplete",
            tokenization: "edgeGram",
            minGrams: 2,
            maxGrams: 15,
          },
        },
      },
    },
  },
});

const waitUntilReady = async (
  collection: mongoose.mongo.Collection,
  indexName: string,
): Promise<void> => {
  for (let attempt = 0; attempt < 60; attempt++) {
    const indexes = await collection.listSearchIndexes(indexName).toArray();
    const index = indexes[0] as { status?: string; queryable?: boolean } | undefined;
    if (index?.status === "READY" && index.queryable) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Search index "${indexName}" did not become READY in time`);
};

const seed = async (): Promise<void> => {
  const db = process.env.BASKET_DB_CONNECTION_STRING;
  if (!db) {
    throw new Error(
      "FATAL ERROR: BASKET_DB_CONNECTION_STRING is not defined (expected the local mongo-atlas-local URI).",
    );
  }

  await mongoose.connect(db);
  try {
    const raw = fs.readFileSync("assets/items.json", "utf-8");
    const items: SampleItem[] = JSON.parse(raw);
    const image = fs.readFileSync("assets/1_1image.jpg");

    await Item.deleteMany({});
    const docs = items.map((item) => ({
      ...item,
      image,
      embeddings: sandboxEmbedding(item.name.en),
    }));
    await Item.insertMany(docs);
    console.log(`Seeded ${docs.length} items into "${Item.collection.collectionName}".`);

    const collection = mongoose.connection.collection(Item.collection.collectionName);

    const indexSpecs: { name: string; definition: Record<string, unknown> }[] = [
      { name: "item_search_en", definition: SEARCH_INDEX_DEFINITION },
      { name: "item_search_fr", definition: SEARCH_INDEX_DEFINITION },
      { name: "item_autocomplete_en", definition: AUTOCOMPLETE_INDEX_DEFINITION("en") },
      { name: "item_autocomplete_fr", definition: AUTOCOMPLETE_INDEX_DEFINITION("fr") },
    ];

    for (const spec of indexSpecs) {
      const existing = await collection.listSearchIndexes(spec.name).toArray();
      if (existing.length > 0) {
        console.log(`Index "${spec.name}" already exists, skipping creation.`);
        continue;
      }
      await collection.createSearchIndex({ name: spec.name, definition: spec.definition });
      console.log(`Created search index "${spec.name}", waiting for it to become READY...`);
    }

    for (const spec of indexSpecs) {
      await waitUntilReady(collection, spec.name);
      console.log(`Index "${spec.name}" is READY.`);
    }

    const sample = await collection.aggregate([
      { $search: { index: "item_search_en", text: { query: "banana", path: "name.en" } } },
      { $limit: 1 },
    ]).toArray();
    if (sample.length === 0) {
      throw new Error("Sanity check failed: $search on item_search_en returned no hits for \"banana\".");
    }
    console.log(`Sanity check passed: $search found "${(sample[0] as { name: { en: string } }).name.en}".`);
  } finally {
    await mongoose.disconnect();
  }
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
