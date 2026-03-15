// routes/reels.js
const express = require("express");
const router = express.Router();
const { createReel, getReelsFeed, likeReel } = require("../controllers/reelController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/create", protect, upload.single("video"), createReel);
router.get("/feed", protect, getReelsFeed);
router.put("/like/:id", protect, likeReel);

module.exports = router;
