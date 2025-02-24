import { categoriesType } from "../../data/categories.js";
import { vectorSearchObjectType } from "../../data/interface/HybridSearchTypes.js";
import getEmbeddings from "./getEmbeddings.js";

/**
 * Creates a vector search object for MongoDB aggregation
 * @param {string} query - Unformatted search query
 * @param {categoriesType[]} categories - Categories to filter by
 * @param {string} language - Search language (en|fr)
 * @returns {Promise<vectorSearchObjectType|null>} MongoDB vector search object or null if embeddings fail
 */
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

  const res: vectorSearchObjectType = {
    $vectorSearch: {
      index: "vector_search_index",
      path: "embeddings",
      queryVector: vector as number[],
      numCandidates: 300,
      limit: 24,
    },
  };
  if (categories.length > 0) {
    const modifiedRes: vectorSearchObjectType = {
      $vectorSearch: {
        ...res.$vectorSearch,
        ...{ filter: { categories: { $in: categories } } },
      },
    };
    return modifiedRes;
  }
  return res;
};

export default getVectorSearchObject;
