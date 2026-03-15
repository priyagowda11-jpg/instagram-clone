/**
 * models/Reel.js — SHORT VIDEO SCHEMA
 * Similar to Post but video-only with extra metadata
 */

const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: String,
      required: true, // Cloudinary video URL
    },
    videoPublicId: {
      type: String,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
      maxlength: [2200],
    },
    audio: {
      type: String,
      default: "Original Audio",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Reel = mongoose.model("Reel", reelSchema);
module.exports = Reel;
