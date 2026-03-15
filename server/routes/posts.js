// routes/posts.js
const express = require("express");
const router = express.Router();
const {
  createPost, getFeed, getPost, deletePost,
  likePost, commentPost, savePost, getSavedPosts,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/create", protect, upload.single("image"), createPost);
router.get("/feed", protect, getFeed);
router.get("/saved", protect, getSavedPosts);
router.get("/:id", protect, getPost);
router.delete("/:id", protect, deletePost);
router.put("/like/:id", protect, likePost);
router.post("/comment/:id", protect, commentPost);
router.put("/save/:id", protect, savePost);

module.exports = router;
