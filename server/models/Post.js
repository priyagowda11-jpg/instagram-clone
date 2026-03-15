/**
 * ════════════════════════════════════════════
 * models/Post.js — POST SCHEMA
 * ════════════════════════════════════════════
 *
 * KEY DECISIONS:
 * - likes is an array of User IDs
 *   → We check if user ID is IN array to know if liked
 *   → Array length = like count (no extra DB call)
 * - comments embedded with ref to User
 *   → Populated when needed
 * - savedBy tracks which users bookmarked this post
 */

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String, // Cloudinary public_id for deletion
    },
    caption: {
      type: String,
      default: "",
      maxlength: [2200, "Caption cannot exceed 2200 characters"],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    location: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster feed queries (sorted by newest)
postSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
