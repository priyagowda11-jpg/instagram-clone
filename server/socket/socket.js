/**
 * ════════════════════════════════════════════
 * socket/socket.js — REAL-TIME ENGINE
 * ════════════════════════════════════════════
 *
 * HOW SOCKET.IO WORKS:
 * 1. Client connects → gets a socket.id
 * 2. We map userId → socket.id (onlineUsers map)
 * 3. To send to specific user: io.to(socketId).emit()
 * 4. When user disconnects → remove from map
 *
 * USE CASES HERE:
 * - Real-time chat messages
 * - Like/comment/follow notifications
 * - Online status indicator
 * - Typing indicators
 */

const onlineUsers = new Map(); // userId → socketId

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * User comes online
     * Client emits: socket.emit('userOnline', userId)
     */
    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId); // Join room named after userId for direct messaging

      // Broadcast to everyone that this user is online
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log(`👤 ${userId} is online`);
    });

    /**
     * Typing indicator
     * Client emits when user starts/stops typing in chat
     */
    socket.on("typing", ({ conversationId, userId, receiverId }) => {
      socket.to(receiverId).emit("userTyping", { conversationId, userId });
    });

    socket.on("stopTyping", ({ conversationId, receiverId }) => {
      socket.to(receiverId).emit("userStopTyping", { conversationId });
    });

    /**
     * Mark messages as read
     */
    socket.on("markRead", ({ conversationId, senderId }) => {
      socket.to(senderId).emit("messagesRead", { conversationId });
    });

    /**
     * User disconnects
     */
    socket.on("disconnect", () => {
      // Find and remove user from online map
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("onlineUsers", Array.from(onlineUsers.keys()));
          console.log(`👤 ${userId} went offline`);
          break;
        }
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

const getOnlineUsers = () => Array.from(onlineUsers.keys());

module.exports = { initSocket, getOnlineUsers };
