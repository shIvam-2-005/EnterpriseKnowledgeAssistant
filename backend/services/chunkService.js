import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const splitIntoChunks = async (text) => {
  // Clean extra whitespace
  const cleaned = text.replace(/\s+/g, " ").trim();

  console.log("Cleaned text length:", cleaned.length);

  if (cleaned.length === 0) {
    return [];
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([cleaned]);

  console.log("Documents created:", docs.length);

  return docs.map((doc) => doc.pageContent);
};