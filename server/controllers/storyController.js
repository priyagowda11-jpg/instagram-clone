/**
 * controllers/storyController.js
 */

const Story = require("../models/Story");
const { uploadToCloudinary } = require("../config/cloudinary");

/**
 * @route   POST /api/stories/create
 * @access  Private
 */
const createStory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Media is required" });

    const isVideo = req.file.mimetype.startsWith("video/");
    const result = await uploadToCloudinary(
      req.file.buffer,
      "stories",
      isVideo ? "video" : "image"
    );

    const story = await Story.create({
      user: req.user._id,
      media: result.secure_url,
      mediaPublicId: result.public_id,
      mediaType: isVideo ? "video" : "image",
    });

    const populated = await story.populate("user", "username profilePic");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/stories/feed
 * @access  Private
 * Groups stories by user — one circle per user like Instagram
 */
const getStoriesFeed = async (req, res) => {
  try {
    const following = [...req.user.following, req.user._id];
    const now = new Date();

    // Get all non-expired stories from followed users
    const stories = await Story.find({
      user: { $in: following },
      expiresAt: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    // Group stories by user
    const grouped = {};
    stories.forEach((story) => {
      const uid = story.user._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = {
          user: story.user,
          stories: [],
          hasUnviewed: false,
        };
      }
      grouped[uid].stories.push(story);
      if (!story.viewers.includes(req.user._id)) {
        grouped[uid].hasUnviewed = true;
      }
    });

    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/stories/view/:id
 * @access  Private
 */
const viewStory = async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, {
      $addToSet: { viewers: req.user._id }, // addToSet prevents duplicates
    });
    res.json({ message: "Story viewed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createStory, getStoriesFeed, viewStory };
