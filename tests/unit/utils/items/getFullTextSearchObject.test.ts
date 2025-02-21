import { beforeEach, describe, expect, it } from "vitest";
import { categoriesType } from "../../../../src/data/categories";
import getFullTextSearchObject from "../../../../src/utils/items/getFullTextSearchObject";
import { fullTextSearchObjectType } from "../../../../src/interface/HybridSearchTypes";

describe("getFullTextSearchObject", () => {
  let query: string;
  let categories: categoriesType[];
  let language: string;
  let expected: fullTextSearchObjectType;
  beforeEach(() => {
    query = "test";
    categories = ["Produce", "Bio"];
    language = "en";
    expected = {
      $search: {
        index: "item_search_en",
        compound: {
          must: [
            {
              text: {
                query: query,
                path: "name.en",
                fuzzy: {
                  maxEdits: 2,
                  prefixLength: 0,
                  maxExpansions: 50,
                },
              },
            },
          ],
          filter: [{ in: { path: "categories", value: categories } }],
        },
      },
    };
  });
  const exec = () => {
    return getFullTextSearchObject(query, categories, language);
  };
  it("Should return the full-text search object", () => {
    const res = exec();
    expect(res).toEqual(expected);
  });
  it("Should return the full-text search object without categories", () => {
    categories = [];
    expected = {
      $search: {
        index: "item_search_en",
        compound: {
          must: [
            {
              text: {
                query: query,
                path: "name.en",
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
    const res = exec();
    expect(res).toEqual(expected);
  });
});
