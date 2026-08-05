import { pipeline } from "@xenova/transformers";

let extractor = null;

// Load the model only once
const getExtractor = async () => {
  if (!extractor) {
    console.log("🔄 Loading embedding model...");

    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("✅ Embedding model loaded");
  }

  return extractor;
};

// Generate embedding
export const generateEmbedding = async (text) => {
  const model = await getExtractor();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};