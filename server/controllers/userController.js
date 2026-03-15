/**
 * ════════════════════════════════════════════
 * controllers/userController.js
 * ════════════════════════════════════════════
 */

const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const { uploadToCloudinary } = require("../config/cloudinary");

/**
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username profilePic")
      .populate("following", "username profilePic");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Get user's posts count
    const postsCount = await Post.countDocuments({ user: user._id });

    res.json({ ...user._doc, postsCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/users/:id/posts
 * @access  Private
 */
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic");

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/users/update
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { username, bio, fullName, website } = req.body;

    // Check if new username taken by someone else
    if (username) {
      const existing = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    let profilePic = req.user.profilePic;

    // Handle profile picture upload
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "profiles",
        "image"
      );
      profilePic = result.secure_url;
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { username, bio, fullName, website, profilePic },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/users/follow/:id
 * @access  Private
 */
const followUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) return res.status(404).json({ message: "User not found" });

    // Check already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add to following/followers
    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user._id },
    });

    // Create follow notification
    await Notification.create({
      recipient: req.params.id,
      sender: req.user._id,
      type: "follow",
      message: `${req.user.username} started following you`,
    });

    // Emit real-time notification via Socket.io
    const io = req.app.get("io");
    io.to(req.params.id).emit("notification", {
      type: "follow",
      sender: { _id: req.user._id, username: req.user.username, profilePic: req.user.profilePic },
      message: `${req.user.username} started following you`,
    });

    res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/users/unfollow/:id
 * @access  Private
 */
const unfollowUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id },
    });

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/users/search?q=username
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const users = await User.find({
      username: { $regex: query, $options: "i" }, // Case-insensitive search
      _id: { $ne: req.user._id }, // Exclude self
    })
      .select("username profilePic fullName followers")
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/users/suggestions
 * @access  Private
 */
const getSuggestions = async (req, res) => {
  try {
    // Users not yet followed, excluding self
    const users = await User.find({
      _id: { $nin: [...req.user.following, req.user._id] },
    })
      .select("username profilePic fullName followers")
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  getUserPosts,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers,
  getSuggestions,
};
