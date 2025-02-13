import { categoriesType } from "../data/categories.js";

type fullTextSearchObjectType = {
  $search: {
    index: string;
    compound: {
      filter?: [{ in: { path: string; value: categoriesType[] } }];
      must: [
        {
          text: {
            query: string;
            path: string;
            fuzzy: {
              maxEdits: number;
              prefixLength: number;
              maxExpansions: number;
            };
          };
        }
      ];
    };
  };
};

type fullTextSearchObjectNoCategoriesType = {
  $search: {
    index: string;
    compound: {
      must: [
        {
          text: {
            query: string;
            path: string;
            fuzzy: {
              maxEdits: number;
              prefixLength: number;
              maxExpansions: number;
            };
          };
        }
      ];
    };
  };
};

type vectorSearchObjectType = {
  $vectorSearch: {
    index: string;
    path: string;
    queryVector: number[];
    numCandidates: number;
    limit: number;
    filter?: {
      categories: {
        $in: categoriesType[];
      };
    };
  };
};

type vectorSearchObjectNoCategoriesType = {
  $vectorSearch: {
    index: string;
    path: string;
    queryVector: number[];
    numCandidates: number;
    limit: number;
  };
};

type hybridSearchPipelineType = [
  vectorSearchObjectType | vectorSearchObjectNoCategoriesType,
  {
    $unionWith: {
      coll: string;
      pipeline: [
        fullTextSearchObjectType | fullTextSearchObjectNoCategoriesType
      ];
    };
  },
  {
    $addFields: {
      searchScore: { $meta: "searchScore" };
      vectorSearchScore: { $meta: "vectorSearchScore" };
    };
  },
  {
    $addFields: {
      name: "$name";
      fts_score: { $ifNull: ["$searchScore", 0] };
      vs_score: { $ifNull: ["$vectorSearchScore", 0] };
    };
  },
  {
    $group: {
      _id: "$_id";
      name: { $first: "$name" };
      ref: { $first: "$ref" };
      amount: { $first: "$amount" };
      suppliers: { $first: "$suppliers" };
      categories: { $first: "$categories" };
      image: { $first: "$image" };
      fts_score: { $max: "$fts_score" };
      vs_score: { $max: "$vs_score" };
    };
  },
  {
    $addFields: {
      score: {
        $add: [
          {
            $multiply: [2, { $pow: ["$fts_score", 2] }];
          },
          {
            $divide: [
              { $multiply: [2, { $pow: ["$vs_score", 2] }] },
              { $add: ["$fts_score", 9] }
            ];
          }
        ];
      };
    };
  },
  { $sort: { score: -1 } }
];

type noVectorPipelineType = [
  fullTextSearchObjectType | fullTextSearchObjectNoCategoriesType,
  {
    $addFields: {
      score: {
        $meta: "searchScore";
      };
    };
  }
];

export type {
  fullTextSearchObjectType,
  vectorSearchObjectType,
  hybridSearchPipelineType,
  noVectorPipelineType,
};
