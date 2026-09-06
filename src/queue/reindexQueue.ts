import { SQSClient, CreateQueueCommand, GetQueueUrlCommand } from "@aws-sdk/client-sqs";

export const REINDEX_QUEUE_NAME = "basket-reindex-queue";

/**
 * Returns the reindex queue's URL, creating the queue first if it does not
 * exist yet (idempotent - `CreateQueueCommand` on an existing queue just
 * returns its URL). Local dev only calls this against LocalStack; a real
 * deployment would provision the queue with infrastructure-as-code instead
 * and just call `GetQueueUrlCommand`.
 */
export const ensureReindexQueue = async (client: SQSClient): Promise<string> => {
  try {
    const { QueueUrl } = await client.send(
      new GetQueueUrlCommand({ QueueName: REINDEX_QUEUE_NAME })
    );
    if (QueueUrl) return QueueUrl;
  } catch {
    // Queue doesn't exist yet - fall through and create it.
  }
  const { QueueUrl } = await client.send(
    new CreateQueueCommand({ QueueName: REINDEX_QUEUE_NAME })
  );
  if (!QueueUrl) throw new Error("Failed to create or locate the reindex queue");
  return QueueUrl;
};
