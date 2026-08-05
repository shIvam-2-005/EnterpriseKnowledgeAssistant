import fs from "fs";
import Document from "../models/Document.js";
import Chunk from "../models/Chunk.js";

import { extractPdfText } from "../services/pdfService.js";
import { splitIntoChunks } from "../services/chunkService.js";
import { generateEmbedding } from "../services/embeddingService.js";

// ============================
// Upload Document
// ============================
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    let extractedText = "";
    let chunkTexts = [];

    // Extract PDF
    if (req.file.mimetype === "application/pdf") {
      console.log("1. PDF detected");

      extractedText = await extractPdfText(req.file.path);

      console.log("2. PDF extracted");
      console.log("Text length:", extractedText.length);

      chunkTexts = await splitIntoChunks(extractedText);

      console.log("3. Chunking completed");
      console.log("Chunks:", chunkTexts.length);
    }

    // Save document
    const document = await Document.create({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      extractedText,
    });

    console.log("✅ Document saved:", document._id);

    // Generate embeddings and save chunks
    for (let i = 0; i < chunkTexts.length; i++) {
      console.log(
        `Generating embedding ${i + 1}/${chunkTexts.length}`
      );

      const embedding = await generateEmbedding(chunkTexts[i]);

      await Chunk.create({
        documentId: document._id,
        chunkIndex: i,
        text: chunkTexts[i],
        embedding,
      });

      console.log(
        `✅ Saved chunk ${i + 1}/${chunkTexts.length}`
      );
    }

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================
// Get All Documents
// ============================
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .select("_id fileName originalName fileSize fileType createdAt");

    res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================
// Get Single Document
// ============================
export const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      document,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ============================
// Delete Document
// ============================
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Delete physical file
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete all chunks of this document
    await Chunk.deleteMany({
      documentId: document._id,
    });

    // Delete document
    await document.deleteOne();

    res.json({
      success: true,
      message: "Document deleted successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};