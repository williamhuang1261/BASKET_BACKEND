import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { getSqsClient } from "./sqsClient.js";
import { ensureReindexQueue } from "./reindexQueue.js";
import { ReindexMessage } from "./reindexProducer.js";

export type ReindexFn = (itemIds: string[]) => Promise<void>;

/**
 * Receives and processes whatever reindex messages are currently on the
 * queue (up to 10, SQS's per-call max), calling `reindexFn` for each and
 * deleting the message only after `reindexFn` succeeds - a failure leaves
 * the message on the queue to retry after its visibility timeout, rather
 * than silently dropping a reindex.
 *
 * `reindexFn` is injected so this module stays testable against a real
 * LocalStack queue without also depending on a real OpenSearch cluster or
 * MongoDB in the same test.
 *
 * @returns Number of messages successfully processed and deleted.
 */
export const processReindexBatch = async (
  client: SQSClient,
  reindexFn: ReindexFn
): Promise<number> => {
  const queueUrl = await ensureReindexQueue(client);
  const { Messages } = await client.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 1,
    })
  );
  if (!Messages || Messages.length === 0) return 0;

  let processed = 0;
  for (const message of Messages) {
    if (!message.Body || !message.ReceiptHandle) continue;
    const { itemIds }: ReindexMessage = JSON.parse(message.Body);
    try {
      await reindexFn(itemIds);
      await client.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        })
      );
      processed += 1;
    } catch (err) {
      console.error("Reindex failed, leaving message on the queue:", err);
    }
  }
  return processed;
};

/**
 * Long-running poll loop. Not itself unit-tested (a loop with no exit
 * condition, matching the existing `analyze:experiment` script's
 * convention of a real, run-manually entrypoint) - `processReindexBatch`
 * above is the tested unit.
 */
export const runReindexWorker = async (reindexFn: ReindexFn): Promise<void> => {
  const client = getSqsClient();
  console.log("Reindex worker started, polling", REINDEX_POLL_INTERVAL_MS, "ms");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const processed = await processReindexBatch(client, reindexFn);
    if (processed > 0) console.log(`Reindexed ${processed} message(s)`);
    await new Promise((resolve) => setTimeout(resolve, REINDEX_POLL_INTERVAL_MS));
  }
};

const REINDEX_POLL_INTERVAL_MS = 2000;
