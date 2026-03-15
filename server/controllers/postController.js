/**
 * ════════════════════════════════════════════
 * controllers/postController.js
 * ════════════════════════════════════════════
 */

const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { uploadToCloudinary, cloudinary } = require("../config/cloudinary");

/**
 * @route   POST /api/posts/create
 * @access  Private
 */
const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "posts", "image");

    const post = await Post.create({
      user: req.user._id,
      image: result.secure_url,
      imagePublicId: result.public_id,
      caption: req.body.caption || "",
      location: req.body.location || "",
    });

    // Populate user info before returning
    const populated = await post.populate("user", "username profilePic");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/posts/feed
 * @access  Private
 * Infinite scroll: ?page=1&limit=10
 */
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts from followed users + own posts
    const following = [...req.user.following, req.user._id];

    const posts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic");

    const total = await Post.countDocuments({ user: { $in: following } });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/posts/:id
 * @access  Private
 */
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic");

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   DELETE /api/posts/:id
 * @access  Private (own posts only)
 */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Authorization check
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Delete from Cloudinary
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    await post.deleteOne();

    // Remove from all users' savedPosts
    await User.updateMany(
      { savedPosts: req.params.id },
      { $pull: { savedPosts: req.params.id } }
    );

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/posts/like/:id
 * @access  Private
 * Toggles like/unlike
 */
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      await Post.findByIdAndUpdate(req.params.id, {
        $pull: { likes: req.user._id },
      });
    } else {
      // Like
      await Post.findByIdAndUpdate(req.params.id, {
        $push: { likes: req.user._id },
      });

      // Notify post owner (not if liking own post)
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: "like",
          post: post._id,
          message: `${req.user.username} liked your post`,
        });

        const io = req.app.get("io");
        io.to(post.user.toString()).emit("notification", {
          type: "like",
          sender: { _id: req.user._id, username: req.user.username, profilePic: req.user.profilePic },
          post: { _id: post._id, image: post.image },
          message: `${req.user.username} liked your post`,
        });
      }
    }

    const updated = await Post.findById(req.params.id);
    res.json({ likes: updated.likes, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/posts/comment/:id
 * @access  Private
 */
const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.user._id,
            text,
          },
        },
      },
      { new: true }
    ).populate("comments.user", "username profilePic");

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Notify post owner
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        message: `${req.user.username} commented: ${text.slice(0, 50)}`,
      });

      const io = req.app.get("io");
      io.to(post.user.toString()).emit("notification", {
        type: "comment",
        sender: { _id: req.user._id, username: req.user.username, profilePic: req.user.profilePic },
        post: { _id: post._id, image: post.image },
        message: `${req.user.username} commented on your post`,
      });
    }

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/posts/save/:id
 * @access  Private
 * Toggles save/unsave
 */
const savePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isSaved = user.savedPosts.includes(req.params.id);

    if (isSaved) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { savedPosts: req.params.id },
      });
      await Post.findByIdAndUpdate(req.params.id, {
        $pull: { savedBy: req.user._id },
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { savedPosts: req.params.id },
      });
      await Post.findByIdAndUpdate(req.params.id, {
        $push: { savedBy: req.user._id },
      });
    }

    res.json({ isSaved: !isSaved, message: isSaved ? "Post unsaved" : "Post saved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/posts/saved
 * @access  Private
 */
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedPosts",
      populate: { path: "user", select: "username profilePic" },
    });
    res.json(user.savedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getFeed,
  getPost,
  deletePost,
  likePost,
  commentPost,
  savePost,
  getSavedPosts,
};
