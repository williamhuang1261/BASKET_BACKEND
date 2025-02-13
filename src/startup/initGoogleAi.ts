import aiplatform from "@google-cloud/aiplatform";

const { PredictionServiceClient } = aiplatform.v1beta1;
const apiEndpoint = "us-central1-aiplatform.googleapis.com";
export const client = await new PredictionServiceClient({ apiEndpoint: apiEndpoint });
console.log('Google AI Platform client initialized');
