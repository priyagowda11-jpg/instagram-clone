/**
 * ════════════════════════════════════════════
 * models/Story.js — STORY SCHEMA
 * ════════════════════════════════════════════
 *
 * KEY DECISIONS:
 * - expiresAt set to 24 hours from creation
 * - MongoDB TTL index auto-deletes expired stories
 *   (no cron job needed!)
 * - viewers array tracks who viewed the story
 */

const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      type: String,
      required: true, // Cloudinary URL
    },
    mediaPublicId: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  {
    timestamps: true,
  }
);

// ✨ TTL INDEX — MongoDB auto-deletes document when expiresAt passes
// No manual cleanup needed!
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = mongoose.model("Story", storySchema);
module.exports = Story;
