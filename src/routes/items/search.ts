import express, { Request, Response } from "express";
import getHybridSearchPipeline from "../../utils/items/getHybridSearchPipeline.js";
import { categoriesType } from "../../data/categories.js";
import Item from "../../models/items.js";
import valSearch from "../../validation/items/valSearch.js";

const router = express.Router();

/**
 * Search items using hybrid search (vector + full-text search)
 * @route POST /items/search
 * @param {Object} req.body.config - Search configuration
 * @param {string} req.body.config.value - Search query
 * @param {string[]} req.body.config.categories - Categories to filter by
 * @param {'en'|'fr'} req.body.config.language - Search language
 * @example
 * // Request body
 * {
 *   "config": {
 *     "value": "apple",
 *     "categories": ["Produce", "Bio"],
 *     "language": "en"
 *   }
 * }
 * @returns {Object} 200 - Search results with scores
 * @returns {Object} 500 - Search failed
 */
router.post("/", async (req: Request, res: Response) => {
  // Validating body fields
  const { error } = valSearch(req.body);
  if (error) {
    res
      .status(400)
      .send({
        message: "Some fields are invalid",
        error: error.details[0].message,
      });
    return;
  }

  // Desctructuring request body
  const { config } = req.body;
  const { value, categories, language } = config as {
    value: string;
    categories: categoriesType[];
    language: "en" | "fr";
  };

  // Searching items
  try {
    // Generating hybrid search pipeline
    const pipeline = await getHybridSearchPipeline(value, categories, language);
    // Executing search
    const results = await Item.aggregate(pipeline);
    // Sending response
    res.status(200).send({ message: "Search succeeded", data: results });
  } catch {
    // Sending error response
    res.status(500).send({ message: "Search failed." });
    return;
  }
});

export default router;
