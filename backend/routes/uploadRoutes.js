import express from "express";
import upload from "../middleware/uploadMiddleware.js";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/uploadController.js";

const router = express.Router();

// Upload PDF
router.post(
  "/",
  upload.single("document"),
  uploadDocument
);

router.get("/", authMiddleware, getDocuments);

router.get("/:id", authMiddleware, getDocument);

router.delete("/:id", authMiddleware, deleteDocument);

export default router;