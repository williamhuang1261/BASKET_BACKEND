import { categoriesType } from "../../data/categories.js";

export const ITEMS_INDEX = "items";
export const EMBEDDING_DIMENSION = 128;

export interface OpenSearchQueryBody {
  size: number;
  query: Record<string, unknown>;
}

/**
 * Builds an OpenSearch query for the items index, mirroring
 * `getHybridSearchPipeline`'s degrade-on-failure shape: a BM25-only query
 * when no query vector is available, or a BM25 + kNN hybrid query when one
 * is. Pure function - the caller is responsible for producing the query
 * vector (production would reuse the existing `getEmbeddings` Vertex AI
 * call, the same one the MongoDB pipeline already uses).
 *
 * @param query - Raw search text
 * @param queryVector - Precomputed query embedding, or null to fall back to
 *   BM25-only (mirrors `getVectorSearchObject` returning null on failure)
 * @param categories - Categories to filter by
 * @param language - "en" | "fr"
 * @example
 * buildOpenSearchQuery("apple", null, [], "en")
 * // BM25-only multi_match query
 * buildOpenSearchQuery("apple", [0.1, 0.2, ...], ["Produce"], "en")
 * // bool query: BM25 multi_match should-clause + kNN should-clause, filtered by category
 */
export const buildOpenSearchQuery = (
  query: string,
  queryVector: number[] | null,
  categories: categoriesType[],
  language: "en" | "fr"
): OpenSearchQueryBody => {
  const bm25Clause = {
    match: {
      [`name.${language}`]: {
        query,
        fuzziness: "AUTO",
      },
    },
  };

  const filter =
    categories.length > 0
      ? [{ terms: { categories } }]
      : [];

  if (!queryVector) {
    return {
      size: 24,
      query: {
        bool: {
          must: [bm25Clause],
          filter,
        },
      },
    };
  }

  const knnClause = {
    knn: {
      embeddings: {
        vector: queryVector,
        k: 24,
      },
    },
  };

  return {
    size: 24,
    query: {
      bool: {
        should: [bm25Clause, knnClause],
        minimum_should_match: 1,
        filter,
      },
    },
  };
};

export default buildOpenSearchQuery;
