// routes/messages.js
const express = require("express");
const router = express.Router();
const { sendMessage, getConversations, getMessages } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/send", protect, upload.single("image"), sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/:conversationId", protect, getMessages);

module.exports = router;
