/**
 * ════════════════════════════════════════════
 * middleware/upload.js — FILE UPLOAD HANDLER
 * ════════════════════════════════════════════
 *
 * WHY MEMORY STORAGE (not disk)?
 * - On cloud servers (Heroku/Railway), disk is ephemeral
 * - Memory storage keeps file as Buffer in RAM
 * - We immediately stream it to Cloudinary
 * - No leftover files on server
 *
 * WHY MULTER?
 * - Handles multipart/form-data (file uploads)
 * - Works as Express middleware
 * - File available at req.file after middleware runs
 */

const multer = require("multer");

// Store files in memory (as Buffer)
const storage = multer.memoryStorage();

// File type filter — only allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/mov",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only images and videos are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

module.exports = upload;
