import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
    },
chunks: [
  {
    text: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      default: [],
    },
  },
],

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Document", documentSchema);