import { describe, expect, it, vi, beforeEach } from "vitest";
import { categoriesType } from "../../../../src/data/categories";
import getHybridSearchPipeline from "../../../../src/utils/items/getHybridSearchPipeline";
import { query } from "express";

const mockVectorSearchObject = {
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

const mockFullTextSearchObject = {
  $search: {
    index: "item_search_en",
    compound: {
      must: [
        {
          text: {
            query: "test",
            path: "name.en",
            fuzzy: {
              maxEdits: 2,
              prefixLength: 0,
              maxExpansions: 50,
            },
          },
        },
      ],
      filter: [{ in: { path: "categories", value: ["Produce", "Bio"] } }],
    },
  },
};

const mockHybridSearchPipeline = [
  mockVectorSearchObject,
  {
    $unionWith: {
      coll: "items",
      pipeline: [mockFullTextSearchObject],
    },
  },
  {
    $addFields: {
      searchScore: { $meta: "searchScore" },
      vectorSearchScore: { $meta: "vectorSearchScore" },
    },
  },
  {
    $addFields: {
      name: "$name",
      fts_score: { $ifNull: ["$searchScore", 0] },
      vs_score: { $ifNull: ["$vectorSearchScore", 0] },
    },
  },
  {
    $group: {
      _id: "$_id",
      name: { $first: "$name" },
      ref: { $first: "$ref" },
      amount: { $first: "$amount" },
      suppliers: { $first: "$suppliers" },
      categories: { $first: "$categories" },
      image: { $first: "$image" },
      fts_score: { $max: "$fts_score" },
      vs_score: { $max: "$vs_score" },
    },
  },
  {
    $addFields: {
      score: {
        $add: [
          { $multiply: [2, { $pow: ["$fts_score", 2] }] },
          {
            $divide: [
              { $multiply: [2, { $pow: ["$vs_score", 2] }] },
              { $add: ["$fts_score", 9] },
            ],
          },
        ],
      },
    },
  },
  {
    $sort: { score: -1 },
  },
  {
    $limit: 24,
  },
];

vi.mock("../../../../src/utils/items/getVectorSearchObject", () => ({
  default: async (
    query: string,
    categories: categoriesType[],
    language: string
  ) => {
    if (query === "fail") return null;
    return mockVectorSearchObject;
  },
}));

vi.mock("../../../../src/utils/items/getFullTextSearchObject", () => ({
  default: (query: string, categories: categoriesType[], language: string) => {
    return mockFullTextSearchObject;
  },
}));

describe("getHybridSearchPipeline", () => {
  let query: string;
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    query = "test";
  });
  const exec = async () => {
    return await getHybridSearchPipeline(query, ["Produce", "Bio"], "en");
  };
  it("Should return the hybrid search pipeline if all is ok", async () => {
    const res = await exec();
    expect(res).toEqual(mockHybridSearchPipeline);
  });
  it("Should return the hybrid search pipeline without vector search object if getVectorSearchObject fails", async () => {
    query = "fail";
    const res = await exec();
    expect(res).toEqual([
      mockFullTextSearchObject,
      { $addFields: { score: { $meta: "searchScore" } } },
      { $limit: 24 },
    ]);
  });
});
