// routes/users.js
const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  getUserPosts,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers,
  getSuggestions,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/search", protect, searchUsers);
router.get("/suggestions", protect, getSuggestions);
router.get("/:id", protect, getUserProfile);
router.get("/:id/posts", protect, getUserPosts);
router.put("/update", protect, upload.single("profilePic"), updateProfile);
router.put("/follow/:id", protect, followUser);
router.put("/unfollow/:id", protect, unfollowUser);

module.exports = router;
