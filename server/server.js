/**
 * ════════════════════════════════════════════
 * server.js — MAIN ENTRY POINT
 * ════════════════════════════════════════════
 *
 * WHY THIS STRUCTURE?
 * - We separate http server from express app so
 *   Socket.io can share the same port as REST API
 * - All routes are modular (easier to maintain)
 * - CORS allows our Expo app to call the API
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables FIRST before anything else
dotenv.config();

const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");

// ─── Route Imports ───────────────────────────
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const storyRoutes = require("./routes/stories");
const reelRoutes = require("./routes/reels");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");

// ─── Init Express ────────────────────────────
const app = express();

// ─── Create HTTP Server ──────────────────────
// We wrap express in http.createServer so Socket.io
// can attach to the SAME server instance
const server = http.createServer(app);

// ─── Init Socket.io ──────────────────────────
const io = new Server(server, {
  cors: {
    origin: "*", // In production, set to your domain
    methods: ["GET", "POST"],
  },
});

// Pass io instance to socket handler
initSocket(io);

// Make io accessible in routes via req.io
app.set("io", io);

// ─── Middleware ───────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ─── API Routes ───────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/reels", reelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// ─── Health Check ────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Instagram Clone API Running" });
});

// ─── Global Error Handler ────────────────────
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// ─── Start Server ────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready`);
    console.log(`🌐 http://localhost:${PORT}/health\n`);
  });
});
