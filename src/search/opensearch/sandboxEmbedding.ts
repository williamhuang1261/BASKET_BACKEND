import { EMBEDDING_DIMENSION } from "./buildQuery.js";

/**
 * NOT a real embedding model. This project's real query-vector path is
 * `getEmbeddings.ts`, which calls Vertex AI's `text-multilingual-embedding-002`
 * - the same call the existing MongoDB `$vectorSearch` pipeline already
 * makes. That call needs live GCP credentials this benchmark environment
 * does not have.
 *
 * This is a deterministic, dependency-free stand-in used only by
 * `benchmarkSearch.ts`, so the OpenSearch kNN mechanism (indexing a vector,
 * querying it, getting a ranked result back) can actually run end to end
 * here. It hashes each token into a fixed-size vector and L2-normalizes it -
 * good enough to exercise the kNN code path with a stable, reproducible
 * vector, not good enough to carry any real semantic meaning. Production
 * wiring of `buildOpenSearchQuery` would pass a real Vertex AI vector
 * instead, exactly like `getVectorSearchObject.ts` does for MongoDB today.
 */
export const sandboxEmbedding = (text: string): number[] => {
  const vector = new Array(EMBEDDING_DIMENSION).fill(0);
  const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    for (let d = 0; d < EMBEDDING_DIMENSION; d++) {
      // Mix the hash differently per dimension so tokens spread across the
      // vector instead of collapsing onto one component.
      const mixed = (hash ^ (hash >>> (d % 16 + 1))) * (d + 1);
      vector[d] += Math.sin(mixed) ;
    }
  }

  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
};

export default sandboxEmbedding;
