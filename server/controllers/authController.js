/**
 * ════════════════════════════════════════════
 * controllers/authController.js — AUTH LOGIC
 * ════════════════════════════════════════════
 *
 * WHY CONTROLLERS SEPARATE FROM ROUTES?
 * - Routes = URL mapping (thin)
 * - Controllers = business logic (thick)
 * - Easier to test + maintain
 *
 * TOKEN STRATEGY:
 * - JWT signed with secret + 30 day expiry
 * - Stored in AsyncStorage on client
 * - Sent in every request Authorization header
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper: generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check duplicates
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "Email" : "Username";
      return res.status(400).json({ message: `${field} already taken` });
    }

    // Create user (password hashed in model pre-save hook)
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      fullName: fullName || "",
    });

    // Return user + token
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      fullName: user.fullName,
      followers: user.followers,
      following: user.following,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find user with password (select: false in schema, so must explicitly select)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password using bcrypt
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update push token if provided
    if (req.body.pushToken) {
      user.pushToken = req.body.pushToken;
      await user.save();
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      fullName: user.fullName,
      followers: user.followers,
      following: user.following,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };
