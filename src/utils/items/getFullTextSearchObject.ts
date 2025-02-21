import { categoriesType } from "../../data/categories.js";
import { fullTextSearchObjectType } from "../../interface/HybridSearchTypes.js";

/**
 * Creates a full-text search object for MongoDB aggregation
 * @param {string} query - Unformatted search query
 * @param {categoriesType[]} categories - Categories to filter by
 * @param {string} language - Search language (en|fr)
 * @returns {fullTextSearchObjectType} MongoDB full-text search object
 */
const getFullTextSearchObject = (
  query: string,
  categories: categoriesType[],
  language: string
) => {
  const res: fullTextSearchObjectType = {
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
    const modifiedRes: fullTextSearchObjectType = {
      $search: {
        ...res.$search,
        ...{
          compound: {
            ...res.$search.compound,
            ...{ filter: [{ in: { path: "categories", value: categories } }] },
          },
        },
      },
    };
    return modifiedRes;
  }
  return res;
};

export default getFullTextSearchObject;
