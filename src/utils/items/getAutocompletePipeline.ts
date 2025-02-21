const getAutoCompletePipeline = (
  query: string,
  language: string,
  count: number
) => {
  return [
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
};

export default getAutoCompletePipeline;