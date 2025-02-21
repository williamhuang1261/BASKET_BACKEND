import { categoriesType } from "../../data/categories.js";
import {
  hybridSearchPipelineType,
  noVectorPipelineType,
} from "../../data/interface/HybridSearchTypes.js";
import getFullTextSearchObject from "./getFullTextSearchObject.js";
import getVectorSearchObject from "./getVectorSearchObject.js";

/**
 * Generates a hybrid search pipeline combining vector and full-text search
 * @param {string} query - Search query
 * @param {categoriesType[]} categories - Categories to filter by
 * @param {string} language - Search language (en|fr)
 * @example
 * // Basic search in English
 * const pipeline = await getHybridSearchPipeline("hammer", [], "en");
 *
 * // Filtered search in French
 * const pipeline = await getHybridSearchPipeline("marteau", ["tools"], "fr");
 * @returns {Promise<hybridSearchPipelineType|noVectorPipelineType>} MongoDB aggregation pipeline
 */
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
      { $limit: 24 },
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
    {
      $limit: 24,
    },
  ];

  return pipeline;
};

export default getHybridSearchPipeline;
