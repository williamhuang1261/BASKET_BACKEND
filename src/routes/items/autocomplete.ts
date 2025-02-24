import express, { Request, Response } from "express";
import Item from "../../models/items.js";
import valAutocomplete from "../../validation/items/valAutocomplete.js";
import getAutoCompletePipeline from "../../utils/items/getAutocompletePipeline.js";

const router = express.Router();

/**
 * Get autocomplete suggestions for item names
 * @route POST /items/autocomplete
 * @param {Object} req.body.config - Autocomplete configuration
 * @param {string} req.body.config.value - Partial search query
 * @param {string} req.body.config.language - Language for suggestions
 * @param {number} req.body.config.count - Maximum number of suggestions
 * @example
 * // Request body
 * {
 *   "config": {
 *     "value": "ham",
 *     "language": "en",
 *     "count": 5
 *   }
 * }
 * @returns {Object} 200 - Autocomplete suggestions
 * @returns {Object} 400 - Invalid request body
 * @returns {Object} 500 - Server error
 */
router.post("/", async (req: Request, res: Response) => {
  const { error } = valAutocomplete(req.body);
  if (error) {
    if (error.details[0].context?.key === "value") {
      res.status(400).send({
        message: "Autocomplete queries must be between 2 and 20 characters",
        error: error.details[0].message,
      });
      return;
    } else {
      res.status(400).send({
        message: "Some autocomplete parameters are invalid",
        error: error.details[0].message,
      });
      return;
    }
  }

  const { config } = req.body;
  const { value, language, count } = config as {
    value: string;
    language: string;
    count: number;
  };
  const pipeline = getAutoCompletePipeline(value, language, count);

  try {
    const suggestions = await Item.aggregate(pipeline);
    res
      .status(200)
      .send({ message: "Autocomplete succeeded", data: suggestions });
    return;
  } catch {
    res
      .status(500)
      .send({ message: "Failed to fetch autcomplete suggestions suggestions" });
    return;
  }
});

export default router;
