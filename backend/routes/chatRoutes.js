import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { chatWithDocument, getChatHistory } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", authMiddleware, chatWithDocument);
router.get("/:documentId", authMiddleware, getChatHistory);

export default router;