import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: "smart-cooking",
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    authorName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);
blogSchema.index({ createdAt: -1 });

export const Blog = mongoose.model("Blog", blogSchema);
