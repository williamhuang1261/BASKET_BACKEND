import { SQSClient, PurgeQueueCommand } from "@aws-sdk/client-sqs";
import { describe, it, beforeAll, beforeEach, expect, vi } from "vitest";
import { enqueueReindex } from "../../../src/queue/reindexProducer";
import { processReindexBatch } from "../../../src/queue/reindexWorker";
import { ensureReindexQueue } from "../../../src/queue/reindexQueue";

/**
 * Needs a real local LocalStack instance
 * (`docker compose -f docker-compose.dev.yml up -d localstack`), same
 * "needs local infra, documented" convention as this project's existing
 * Mongo integration tests - it will fail with a connection error rather
 * than hang if LocalStack isn't running (the client has a short timeout,
 * see sqsClient.ts).
 */
describe("SQS reindex queue (LocalStack)", () => {
  let client: SQSClient;

  beforeAll(() => {
    process.env.AWS_SQS_ENDPOINT = process.env.AWS_SQS_ENDPOINT ?? "http://localhost:4566";
    client = new SQSClient({
      region: "us-east-1",
      endpoint: process.env.AWS_SQS_ENDPOINT,
      credentials: { accessKeyId: "test", secretAccessKey: "test" },
    });
  });

  beforeEach(async () => {
    const queueUrl = await ensureReindexQueue(client);
    await client.send(new PurgeQueueCommand({ QueueUrl: queueUrl }));
    // LocalStack's purge takes effect asynchronously; a short wait avoids a
    // flaky race against the next test's enqueue.
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("round-trips a message: enqueue, receive, process, delete", async () => {
    const reindexFn = vi.fn(async () => {});

    const enqueued = await enqueueReindex(["4011", "0004"], client);
    expect(enqueued).toBe(true);

    const processed = await processReindexBatch(client, reindexFn);

    expect(processed).toBe(1);
    expect(reindexFn).toHaveBeenCalledWith(["4011", "0004"]);

    // The message was deleted, so a second poll finds nothing left.
    const secondPoll = await processReindexBatch(client, reindexFn);
    expect(secondPoll).toBe(0);
  });

  it("leaves the message on the queue when reindexing fails", async () => {
    const failingReindexFn = vi.fn(async () => {
      throw new Error("OpenSearch unreachable");
    });

    await enqueueReindex(["4011"], client);
    const processed = await processReindexBatch(client, failingReindexFn);

    expect(processed).toBe(0);
    expect(failingReindexFn).toHaveBeenCalledTimes(1);
  });

  it("does nothing for an empty item-id list", async () => {
    const result = await enqueueReindex([], client);
    expect(result).toBe(true);

    const reindexFn = vi.fn(async () => {});
    const processed = await processReindexBatch(client, reindexFn);
    expect(processed).toBe(0);
    expect(reindexFn).not.toHaveBeenCalled();
  });
});
