import express, { Request, Response } from "express";
import Item from "../../models/items.js";
import valAutocomplete from "../../validation/items/valAutocomplete.js";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { error } = valAutocomplete(req.body);
  if (error) {
    res
      .status(400)
      .send({
        message: "Some fields are invalid",
        error: error.details[0].message,
      });
    return;
  }

  const { config } = req.body;
  const { value, language, count } = config as {
    value: string;
    language: string;
    count: number;
  };
  const pipeline = [
    {
      $search: {
        index: "item_autocomplete_" + language,
        autocomplete: {
          query: value,
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

  try {
    const suggestions = await Item.aggregate(pipeline);
    res.status(200).send({message: 'Autocomplete succeeded', data: suggestions});
    return;
  } catch {
    res
      .status(500)
      .send({ message: "Autocomplete failed to fetch suggestions" });
    return;
  }
});

export default router;
