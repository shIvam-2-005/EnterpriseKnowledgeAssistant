import Chunk from "../models/Chunk.js";
import { generateEmbedding } from "./embeddingService.js";

export const retrieveRelevantChunks = async (
  documentId,
  question,
  topK = 5
) => {
  // Generate embedding for user's question
  const queryEmbedding = await generateEmbedding(question);

  // Vector Search
  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: topK,
      },
    },
    {
      $match: {
        documentId: documentId,
      },
    },
    {
      $project: {
        _id: 0,
        text: 1,
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
  ]);

  console.log("Top Similar Chunks:");
  console.log(results);

  return results.map((r) => r.text);
};