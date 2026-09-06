import Item from "../models/items.js";
import { getOpenSearchClient } from "../search/opensearch/client.js";
import { ensureItemsIndex, indexItems, IndexableItem } from "../search/opensearch/indexItems.js";
import { runReindexWorker } from "../queue/reindexWorker.js";

/**
 * Production reindex path: looks the item up in MongoDB (which already
 * carries the real Vertex AI embedding computed at creation time, in
 * `populate`'s `getEmbeddings` call) and indexes it into OpenSearch with
 * that same embedding - no new embedding calls, no sandbox stand-in. Only
 * `benchmarkSearch.ts` uses `sandboxEmbedding.ts`, for the reasons stated
 * there.
 */
const reindexFromMongo = async (itemIds: string[]): Promise<void> => {
  const openSearchClient = getOpenSearchClient();
  await ensureItemsIndex(openSearchClient);

  const items = await Item.find({ "ref.code": { $in: itemIds } });
  const indexable: IndexableItem[] = items.map((item) => ({
    id: item.ref.code,
    name: item.name as { en: string; fr: string },
    categories: item.categories as IndexableItem["categories"],
    embeddings: item.embeddings as number[],
  }));
  await indexItems(openSearchClient, indexable);
};

runReindexWorker(reindexFromMongo).catch((err) => {
  console.error("Reindex worker crashed:", err);
  process.exitCode = 1;
});
