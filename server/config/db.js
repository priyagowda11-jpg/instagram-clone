/**
 * ════════════════════════════════════════════
 * config/db.js — MONGODB CONNECTION
 * ════════════════════════════════════════════
 *
 * WHY ASYNC/AWAIT?
 * - mongoose.connect returns a Promise
 * - We await it so the server only starts AFTER
 *   DB is connected (no requests before DB ready)
 *
 * WHY SEPARATE FILE?
 * - Single responsibility principle
 * - Easy to swap DB (e.g., PostgreSQL) later
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Kill process — app can't run without DB
  }
};

module.exports = connectDB;
