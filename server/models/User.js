/**
 * ════════════════════════════════════════════
 * models/User.js — USER SCHEMA
 * ════════════════════════════════════════════
 *
 * WHY MONGOOSE SCHEMA?
 * - Enforces data structure in MongoDB (which is schemaless)
 * - Built-in validation (required, unique, minlength)
 * - Middleware hooks (pre-save for password hashing)
 *
 * KEY DECISIONS:
 * - Password is never returned (select: false)
 * - followers/following stored as User ID arrays
 *   (efficient for count + lookup)
 * - savedPosts stores post IDs for bookmarks feature
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscores, and dots"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // NEVER return password in queries
    },
    profilePic: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg",
    },
    bio: {
      type: String,
      default: "",
      maxlength: [150, "Bio cannot exceed 150 characters"],
    },
    fullName: {
      type: String,
      default: "",
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },
    website: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    pushToken: {
      type: String,
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt + updatedAt automatically
  }
);

/**
 * PRE-SAVE HOOK — Hash password before saving
 *
 * WHY HERE and not in controller?
 * - If we update password anywhere, it auto-hashes
 * - isModified check prevents re-hashing on other updates
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12); // 12 rounds = secure but not too slow
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method — compare passwords at login
 * Available on any user document: user.matchPassword(enteredPassword)
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
