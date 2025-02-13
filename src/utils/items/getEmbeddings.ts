import params from "../../../config/googleAi.json" with {type: 'json'}
import aiplatform from "@google-cloud/aiplatform";
import { client } from "../../startup/initGoogleAi.js";

/**
 * Generates embeddings for an array of text strings using Google's AI Platform.
 * Uses the text-multilingual-embedding-002 model optimized for multilingual retrieval queries.
 *
 * @param {string[]} values - Array of text strings to generate embeddings for
 * @returns {Promise<((number | null | undefined)[] | undefined)[] | undefined>} Array of embedding vectors (as number arrays) or undefined if the operation fails
 *
 * @example
 * // Generate embeddings for two texts
 * const embeddings = await getEmbeddings([
 *   "How to play basketball",
 *   "Basketball rules and regulations"
 * ]);
 * // Returns: [[0.123, 0.456, ...], [0.789, 0.012, ...]]
 *
 * @example
 * // Single text embedding
 * const embedding = await getEmbeddings(["What is a slam dunk?"]);
 * // Returns: [[0.234, 0.567, ...]]
 */
const getEmbeddings = async (values: string[]) => {
  // Initialize constants
  const task = "RETRIEVAL_QUERY";
  const model = "text-multilingual-embedding-002";
  const { helpers } = aiplatform;
  const endpoint = `projects/${params.projectId}/locations/${params.location}/publishers/google/models/${model}`;

  // Build request
  let instances: (object | protobuf.common.IValue)[] = [];
  for (const value of values) {
    const formatted = helpers.toValue({ content: value, task_type: task });
    if (formatted) instances.push(formatted);
  }
  const request = { endpoint, instances };

  // Get embeddings
  const [response] = await client.predict(request);

  // Extract embeddings
  const predictions = response.predictions;
  if (!predictions) return;
  const embeddings = predictions.map((p) => {
    const embeddingsProto = p.structValue?.fields?.embeddings;
    const valuesProto = embeddingsProto?.structValue?.fields?.values;
    const res = valuesProto?.listValue?.values?.map((v) => v.numberValue);
    return res;
  });
  return embeddings;
};

export default getEmbeddings;
