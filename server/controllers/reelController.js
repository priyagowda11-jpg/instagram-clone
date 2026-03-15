/**
 * controllers/reelController.js
 */

const Reel = require("../models/Reel");
const { uploadToCloudinary } = require("../config/cloudinary");

const createReel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Video is required" });

    const result = await uploadToCloudinary(req.file.buffer, "reels", "video");

    const reel = await Reel.create({
      user: req.user._id,
      video: result.secure_url,
      videoPublicId: result.public_id,
      caption: req.body.caption || "",
      audio: req.body.audio || "Original Audio",
    });

    const populated = await reel.populate("user", "username profilePic");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReelsFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const reels = await Reel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePic");

    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    const isLiked = reel.likes.includes(req.user._id);

    const update = isLiked
      ? { $pull: { likes: req.user._id } }
      : { $push: { likes: req.user._id } };

    await Reel.findByIdAndUpdate(req.params.id, update);
    res.json({ isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReel, getReelsFeed, likeReel };
