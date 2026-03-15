/**
 * models/Notification.js — NOTIFICATION SCHEMA
 *
 * WHY 'type' field?
 * - Lets frontend render different UI per notification
 *   e.g. "like" → ❤️ | "follow" → 👤 | "comment" → 💬
 *
 * WHY 'isRead'?
 * - Unread badge count in bottom tab navigator
 */

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow", "message"],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null, // null for follow/message notifications
    },
    message: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast lookup of user's notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
