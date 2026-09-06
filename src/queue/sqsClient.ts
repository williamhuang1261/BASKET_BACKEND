import { SQSClient } from "@aws-sdk/client-sqs";

/**
 * Builds an SQS client. Points at `AWS_SQS_ENDPOINT` when set (LocalStack,
 * per `docker-compose.dev.yml`) or real AWS otherwise - only the endpoint
 * changes, the client and every call site are the same either way.
 *
 * LocalStack accepts any non-empty credentials, so a local run needs no
 * real AWS account; a real deployment would rely on the environment's
 * normal AWS credential chain instead of these fallbacks.
 */
export const getSqsClient = (): SQSClient => {
  const endpoint = process.env.AWS_SQS_ENDPOINT;
  return new SQSClient({
    region: process.env.AWS_REGION ?? "us-east-1",
    // A short timeout so a missing/unreachable queue (e.g. AWS_SQS_ENDPOINT
    // not set and no real AWS credentials configured) fails the
    // best-effort enqueue call quickly instead of hanging the request.
    requestHandler: { requestTimeout: 2000 },
    ...(endpoint && {
      endpoint,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
      },
    }),
  });
};

export default getSqsClient;
