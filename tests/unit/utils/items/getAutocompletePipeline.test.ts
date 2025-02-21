import { beforeEach, describe, expect, it } from "vitest";
import getAutocompletePipeline from "../../../../src/utils/items/getAutocompletePipeline";

describe("getAutocompletePipeline", () => {
  let query: string;
  let language: string;
  let count: number;
  let expected: any;

  beforeEach(() => {
    query = "test";
    language = "en";
    count = 10;
    expected = [
      {
        $search: {
          index: "item_autocomplete_" + language,
          autocomplete: {
            query: query,
            path: "name." + language,
            fuzzy: { maxEdits: 1, prefixLength: 1, maxExpansions: 30 },
            tokenOrder: "sequential",
          },
          returnStoredSource: true,
        },
      },
      { $limit: count },
      { $addFields: { suggestion: "$name." + language } },
      { $unset: ["_id", "name"] },
    ];
  });

  const exec = () => {
    return getAutocompletePipeline(query, language, count);
  };

  it("Should return the correct pipeline", () => {
    const res = exec();
    expect(res).toEqual(expected);
  });
  it("Should handle different query values", () => {
    query = "test2";
    expected[0].$search.autocomplete.query = query;
    const res = exec();
    expect(res).toEqual(expected);
  });
  it("Should handle multiple languages", () => {
    language = "fr";
    expected[0].$search.index = "item_autocomplete_" + language;
    expected[0].$search.autocomplete.path = "name." + language;
    expected[2].$addFields.suggestion = "$name." + language;
    const res = exec();
    expect(res).toEqual(expected);
  });
  it("Should handle different count values", () => {
    count = 5;
    expected[1].$limit = count;
    const res = exec();
    expect(res).toEqual(expected);
  });
});
