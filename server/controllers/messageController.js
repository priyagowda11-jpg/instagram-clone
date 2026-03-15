/**
 * ════════════════════════════════════════════
 * controllers/messageController.js
 * ════════════════════════════════════════════
 *
 * FLOW:
 * 1. sendMessage: find/create conversation → save message
 *    → emit via Socket.io to receiver
 * 2. getConversations: all conversations for current user
 * 3. getMessages: all messages in one conversation
 */

const { Conversation, Message } = require("../models/Message");
const { uploadToCloudinary } = require("../config/cloudinary");

/**
 * @route   POST /api/messages/send
 */
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    // Find existing conversation or create new one
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
      });
    }

    // Handle image upload if present
    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "messages", "image");
      imageUrl = result.secure_url;
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: text || "",
      image: imageUrl,
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      lastMessageText: text || "📷 Image",
      lastMessageAt: new Date(),
    });

    const populated = await message.populate("sender", "username profilePic");

    // Emit real-time message via Socket.io
    const io = req.app.get("io");
    io.to(receiverId).emit("newMessage", {
      message: populated,
      conversationId: conversation._id,
    });

    res.status(201).json({ message: populated, conversationId: conversation._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/messages/conversations
 */
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "username profilePic")
      .populate("lastMessage");

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/messages/:conversationId
 */
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username profilePic");

    // Mark all messages as read
    await Message.updateMany(
      { conversation: req.params.conversationId, sender: { $ne: req.user._id } },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getConversations, getMessages };
