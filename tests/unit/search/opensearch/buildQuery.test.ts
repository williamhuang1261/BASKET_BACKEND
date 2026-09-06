import { describe, expect, it } from "vitest";
import { buildOpenSearchQuery } from "../../../../src/search/opensearch/buildQuery";
import { categoriesType } from "../../../../src/data/categories";

describe("buildOpenSearchQuery", () => {
  it("builds a BM25-only bool query when no query vector is given", () => {
    const result = buildOpenSearchQuery("apple", null, [], "en");

    expect(result.size).toBe(24);
    expect(result.query).toEqual({
      bool: {
        must: [{ match: { "name.en": { query: "apple", fuzziness: "AUTO" } } }],
        filter: [],
      },
    });
  });

  it("builds a BM25 + kNN hybrid query when a query vector is given", () => {
    const vector = [0.1, 0.2, 0.3];
    const result = buildOpenSearchQuery("apple", vector, [], "en");

    expect(result.query).toEqual({
      bool: {
        should: [
          { match: { "name.en": { query: "apple", fuzziness: "AUTO" } } },
          { knn: { embeddings: { vector, k: 24 } } },
        ],
        minimum_should_match: 1,
        filter: [],
      },
    });
  });

  it("adds a categories filter when categories are given", () => {
    const categories: categoriesType[] = ["Produce", "Bio"];
    const result = buildOpenSearchQuery("apple", null, categories, "en");

    expect(result.query).toEqual({
      bool: {
        must: [{ match: { "name.en": { query: "apple", fuzziness: "AUTO" } } }],
        filter: [{ terms: { categories } }],
      },
    });
  });

  it("uses the French name field for French queries", () => {
    const result = buildOpenSearchQuery("pomme", null, [], "fr");

    expect(result.query).toEqual({
      bool: {
        must: [{ match: { "name.fr": { query: "pomme", fuzziness: "AUTO" } } }],
        filter: [],
      },
    });
  });
});
