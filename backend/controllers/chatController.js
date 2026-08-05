import Chat from "../models/Chat.js";
import Document from "../models/Document.js";
import { askGemini } from "../services/geminiService.js";
import { retrieveRelevantChunks } from "../services/retrievalService.js";

// Ask AI
export const chatWithDocument = async (req, res) => {
  try {
    const { question, documentId } = req.body;

    if (!question || !documentId) {
      return res.status(400).json({
        success: false,
        message: "Question and documentId are required",
      });
    }

    // Find the document
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Retrieve only relevant chunks
  const relevantChunks = await retrieveRelevantChunks(
    document._id,
    question,
    5
);

    console.log("Relevant Chunks:");
    console.log(relevantChunks);

    const context = relevantChunks.join("\n\n");

    // Get or create chat
    let chat = await Chat.findOne({
      document: documentId,
    });

    if (!chat) {
      chat = await Chat.create({
        document: documentId,
        messages: [],
      });
    }

    // Save user message
    chat.messages.push({
      sender: "user",
      text: question,
    });

    // Ask Gemini using only relevant chunks
    const answer = await askGemini(context, question);

    // Save AI response
    chat.messages.push({
      sender: "assistant",
      text: answer,
    });

    await chat.save();

    res.json({
      success: true,
      answer,
      messages: chat.messages,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Chat History
export const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    let chat = await Chat.findOne({
      document: documentId,
    });

    if (!chat) {
      return res.json({
        success: true,
        messages: [],
      });
    }

    res.json({
      success: true,
      messages: chat.messages,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};