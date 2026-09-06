import express from "express";
import fs from "fs";
import Item from "../../models/items.js";
import getEmbeddings from "../../utils/items/getEmbeddings.js";
import { enqueueReindex } from "../../queue/reindexProducer.js";

const router = express.Router();
router.get("/", (req, res) => {
  res.status(200).send({ message: "Items Route Success" });
  return;
});

router.post("/populate", async (req, res) => {
  const errs: any[] = [];
  let times: number[] = [];
  let good = 0;
  const image = fs.readFileSync("assets/1_1image.jpg");
  const absStart = new Date();
  const items = req.body.items;
  const length = items.length;
  const savedRefCodes: string[] = [];
  for (let i = 0; i < length; i++) {
    const locStart = new Date();
    const exist = await Item.findOne({
      "ref.code": items[i].ref.code,
      "ref.standard": items[i].ref.standard,
    });
    if (!exist) {
      let embeddings = undefined;
      let tries = 0;
      do {
        try {
          embeddings = await getEmbeddings(items[i].name.en);
        } catch (err) {
          errs.push("Error during embeddings");
        }
      } while (!embeddings && tries < 3);
      const pack = {
        ...(items[i] as Object),
        image: image,
        embeddings: embeddings?.[0],
      };
      const newItem = new Item(pack);
      try {
        await newItem.save();
        good += 1;
        savedRefCodes.push(items[i].ref.code);
      } catch (err) {
        errs.push("Error during save");
        console.error(err);
      }
    }
    const locEnd = new Date();
    times.push(locEnd.getTime() - locStart.getTime());
  }
  const absEnd = new Date();

  // OpenSearch indexing happens off the request path: enqueue and move on.
  // Best-effort, per enqueueReindex's own contract - a queue failure here
  // must not fail a MongoDB write that already succeeded.
  await enqueueReindex(savedRefCodes);

  if (errs.length > 0) {
    res.status(400).send({ message: errs.length, errors: errs });
    return;
  }
  res.status(200).send({
    message: "Items Populated",
    good: good,
    time: absEnd.getTime() - absStart.getTime(),
    times: times,
  });
  return;
});

export default router;
