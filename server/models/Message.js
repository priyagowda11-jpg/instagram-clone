/**
 * ════════════════════════════════════════════
 * models/Message.js — CHAT SCHEMA
 * ════════════════════════════════════════════
 *
 * WHY TWO MODELS (Conversation + Message)?
 * - Conversation: tracks participants + last message
 *   → Used for ChatList screen (show all conversations)
 * - Message: individual messages in a conversation
 *   → Used for ChatScreen (message history)
 *
 * This is the standard DM pattern (Instagram/WhatsApp)
 */

const mongoose = require("mongoose");

// ─── Conversation ─────────────────────────────
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageText: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ─── Message ──────────────────────────────────
const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: null, // Cloudinary URL for image messages
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = { Conversation, Message };
