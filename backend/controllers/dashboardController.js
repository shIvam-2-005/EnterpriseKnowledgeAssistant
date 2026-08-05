import Document from "../models/Document.js";
import Chat from "../models/Chat.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Total uploaded PDFs
    const documents = await Document.countDocuments();

    // Total chats
    const chats = await Chat.countDocuments();

    // Count total user questions
    const allChats = await Chat.find();

    let queries = 0;

    allChats.forEach((chat) => {
      chat.messages.forEach((message) => {
        if (message.sender === "user") {
          queries++;
        }
      });
    });

    // Latest uploaded document
    const latestDocument = await Document.findOne().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      stats: {
        documents,
        chats,
        queries,
        latestDocument,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};