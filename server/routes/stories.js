// routes/stories.js
const express = require("express");
const router = express.Router();
const { createStory, getStoriesFeed, viewStory } = require("../controllers/storyController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/create", protect, upload.single("media"), createStory);
router.get("/feed", protect, getStoriesFeed);
router.put("/view/:id", protect, viewStory);

module.exports = router;
