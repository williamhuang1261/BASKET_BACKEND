import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { categoriesType } from "../../../../src/data/categories";
import { vectorSearchObjectType } from "../../../../src/interface/HybridSearchTypes";
import getVectorSearchObject from "../../../../src/utils/items/getVectorSearchObject";

// Mock getEmbeddings
vi.mock("../../../../src/utils/items/getEmbeddings", () => ({
  default: async (values: string[]) => {
    const match = values[0].match(/\[QUERY: (.*?)\]/);
    if (match && match[1] === "fail") return null;
    return values.map(() => [1, 1, 1]);
  },
}));

describe("getVectorSearchObject", () => {
  let query: string;
  let categories: categoriesType[];
  let language: string;
  let expected: vectorSearchObjectType;

  beforeEach(() => {
    query = "test";
    categories = ["Produce", "Bio"];
    language = "en";
    expected = {
      $vectorSearch: {
        index: "vector_search_index",
        path: "embeddings",
        queryVector: [1, 1, 1],
        numCandidates: 300,
        limit: 24,
        filter: {
          categories: {
            $in: ["Produce", "Bio"],
          },
        },
      },
    };
  });
  afterEach(() => {
    vi.resetAllMocks();
  });
  const exec = async () => {
    return await getVectorSearchObject(query, categories, language);
  };
  it("Should return the vector search object", async () => {
    const res = await exec();
    expect(res).toEqual(expected);
  });
  it("Should return the vector search object without categories", async () => {
    categories = [];
    expected = {
      $vectorSearch: {
        index: "vector_search_index",
        path: "embeddings",
        queryVector: [1, 1, 1],
        numCandidates: 300,
        limit: 24,
      },
    };
    const res = await exec();
    expect(res).toEqual(expected);
  });
  it("Should return null if getEmbeddings fails", async () => {
    query = "fail";
    const res = await exec();
    expect(res).toBeNull();
  });
});
