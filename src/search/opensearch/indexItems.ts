import { Client } from "@opensearch-project/opensearch";
import { categoriesType } from "../../data/categories.js";
import { ITEMS_INDEX, EMBEDDING_DIMENSION } from "./buildQuery.js";

export interface IndexableItem {
  id: string;
  name: { en: string; fr: string };
  categories: categoriesType[];
  embeddings: number[];
}

const INDEX_MAPPING = {
  settings: {
    index: {
      "knn": true,
    },
  },
  mappings: {
    properties: {
      "name.en": { type: "text" },
      "name.fr": { type: "text" },
      categories: { type: "keyword" },
      // Pinned to EMBEDDING_DIMENSION (128), sized for the local sandbox
      // benchmark's stand-in vectors. Real Vertex AI embeddings
      // (text-multilingual-embedding-002, already stored per item in
      // Mongo) are 768-dimensional - indexing those for real would need
      // this mapping recreated at 768, a stated gap, not silently patched
      // over here.
      embeddings: {
        type: "knn_vector",
        dimension: EMBEDDING_DIMENSION,
        method: {
          name: "hnsw",
          space_type: "cosinesimil",
          engine: "lucene",
        },
      },
    },
  },
};

/**
 * Creates the `items` index if it does not already exist, with a
 * `knn_vector` mapping for `embeddings` (dimension `EMBEDDING_DIMENSION`,
 * cosine similarity, HNSW).
 */
export const ensureItemsIndex = async (client: Client): Promise<void> => {
  const { body: exists } = await client.indices.exists({ index: ITEMS_INDEX });
  if (exists) return;
  // The client's generated request types don't model `knn_vector` mappings
  // (a plugin-provided field type, not part of the base OpenSearch spec),
  // so the body is cast rather than fought into a type it doesn't have.
  await client.indices.create({
    index: ITEMS_INDEX,
    body: INDEX_MAPPING as unknown as Record<string, unknown>,
  });
};

/**
 * Bulk-indexes a batch of items into the `items` index. Reindexing (not
 * creating) is idempotent - documents are indexed by `id`, so a rerun
 * overwrites rather than duplicates.
 *
 * @returns Number of items indexed and any per-item errors reported by
 *   OpenSearch's bulk API.
 */
export const indexItems = async (
  client: Client,
  items: IndexableItem[]
): Promise<{ indexed: number; errors: unknown[] }> => {
  if (items.length === 0) return { indexed: 0, errors: [] };

  const body = items.flatMap((item) => [
    { index: { _index: ITEMS_INDEX, _id: item.id } },
    {
      name: item.name,
      categories: item.categories,
      embeddings: item.embeddings,
    },
  ]);

  const response = await client.bulk({ body, refresh: true });
  const errors = response.body.items.filter(
    (result: Record<string, { error?: unknown }>) =>
      Object.values(result)[0]?.error
  );

  return { indexed: items.length - errors.length, errors };
};
