import { categoriesType } from "../../data/categories.js";
import {
  fullTextSearchObjectType,
  vectorSearchObjectType,
  hybridSearchPipelineType,
  noVectorPipelineType,
} from "../../interface/HybridSearchTypes.js";
import getEmbeddings from "./getEmbeddings.js";

const getFullTextSearchObject = (
  query: string,
  categories: categoriesType[],
  language: string
) => {
  let res: fullTextSearchObjectType = {
    $search: {
      index: "item_search_" + language,
      compound: {
        must: [
          {
            text: {
              query: query,
              path: "name." + language,
              fuzzy: {
                maxEdits: 2,
                prefixLength: 0,
                maxExpansions: 50,
              },
            },
          },
        ],
      },
    },
  };
  if (categories.length > 0) {
    res = {
      ...res,
      ...{
        compound: {
          ...res.$search.compound,
          ...{ filter: [{ in: { path: "categories", value: categories } }] },
        },
      },
    };
  }
  return res;
};

const getVectorSearchObject = async (
  query: string,
  categories: categoriesType[],
  language: string
) => {
  const formattedQuery = [
    `[LANG: ${language.toUpperCase()}] [QUERY: ${query}]`,
  ];

  let embeddings: ((number | null | undefined)[] | undefined)[] | undefined;
  try {
    embeddings = await getEmbeddings(formattedQuery);
    if (!embeddings) return null;
  } catch {
    return null;
  }
  const vector = embeddings[0];
  if (!vector) return null;

  let res: vectorSearchObjectType = {
    $vectorSearch: {
      index: "vector_search_index",
      path: "embeddings",
      queryVector: vector as number[],
      numCandidates: 300,
      limit: 20,
    },
  };
  if (categories.length > 0)
    res = { ...res, ...{ filter: { categories: { $in: categories } } } };
  return res;
};

const getHybridSearchPipeline = async (
  query: string,
  categories: categoriesType[],
  language: string
): Promise<hybridSearchPipelineType | noVectorPipelineType> => {
  // Get full text search and vector search objects
  const fullTextSearchObject = getFullTextSearchObject(
    query,
    categories,
    language
  );
  const vectorSearchObject = await getVectorSearchObject(
    query,
    categories,
    language
  );

  // If vector search fails, return full text search only
  if (!vectorSearchObject) {
    const pipeline: noVectorPipelineType = [
      fullTextSearchObject,
      { $addFields: { score: { $meta: "searchScore" } } },
    ];
    return pipeline;
  }

  // Hybrid search pipeline
  const pipeline: hybridSearchPipelineType = [
    vectorSearchObject,
    {
      $unionWith: {
        coll: "items",
        pipeline: [fullTextSearchObject],
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
  ];

  return pipeline;
};

export default getHybridSearchPipeline;
