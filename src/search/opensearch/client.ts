import { Client } from "@opensearch-project/opensearch";

/**
 * Builds an OpenSearch client pointed at `OPENSEARCH_NODE`
 * (default: http://localhost:9200, matching `docker-compose.dev.yml`'s
 * local single-node service, security plugin disabled for local dev).
 */
export const getOpenSearchClient = (): Client => {
  const node = process.env.OPENSEARCH_NODE ?? "http://localhost:9200";
  return new Client({ node });
};

export default getOpenSearchClient;
