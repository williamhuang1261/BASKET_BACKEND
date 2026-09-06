import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { getSqsClient } from "./sqsClient.js";
import { ensureReindexQueue } from "./reindexQueue.js";

export interface ReindexMessage {
  itemIds: string[];
}

/**
 * Enqueues a reindex message so the OpenSearch side of a catalog write
 * happens off the request path (see `reindexWorker.ts` for the consumer).
 * The existing synchronous MongoDB write in
 * `src/routes/restricted/items.ts` is unchanged - this only adds a second,
 * async step for OpenSearch.
 *
 * Best-effort: a queue failure is logged, not thrown, matching this
 * project's existing "search gets worse, it does not go down" convention
 * for `getVectorSearchObject.ts` degrading to full-text on failure. The
 * catalog write itself must not fail because the queue is unavailable.
 */
export const enqueueReindex = async (
  itemIds: string[],
  client: SQSClient = getSqsClient()
): Promise<boolean> => {
  if (itemIds.length === 0) return true;
  try {
    const queueUrl = await ensureReindexQueue(client);
    const message: ReindexMessage = { itemIds };
    await client.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
      })
    );
    return true;
  } catch (err) {
    console.error("Failed to enqueue reindex message:", err);
    return false;
  }
};

export default enqueueReindex;
