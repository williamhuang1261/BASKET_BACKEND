import express, { Request, Response } from "express";
import getEmbeddings from "../../utils/items/getEmbeddings.js";
import getHybridSearchPipeline from "../../utils/items/getHybridSearchPipeline.js";
import { categoriesType } from "../../data/categories.js";
import Item from "../../models/items.js";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { config } = req.body;
  const { value, categories, language } = config as {
    value: string;
    categories: categoriesType[];
    language: "en" | "fr";
  };
  const query = [`[LANG: ${language.toUpperCase()}] [QUERY: ${value}]`];

  const embeddings = await getEmbeddings(query);
  if (!embeddings) {
    res.status(400).send({ message: "Query could not be processed." });
    return;
  }
  const vector = embeddings[0];
  if (!vector) {
    res.status(400).send({ message: "Query could not be processed." });
    return;
  }

  try {
    const pipeline = await getHybridSearchPipeline(value, categories, language);
    const results = await Item.aggregate(pipeline);
    res.status(200).send({message: 'Search succeeded', data: results});
  }
  catch {
    res.status(500).send({ message: "Search failed." });
    return;
  }


});

export default router;
