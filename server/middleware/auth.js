/**
 * ════════════════════════════════════════════
 * middleware/auth.js — JWT PROTECTION
 * ════════════════════════════════════════════
 *
 * WHY MIDDLEWARE?
 * - Reusable across all protected routes
 * - Runs BEFORE the route handler
 * - Attaches req.user so any controller can use it
 *
 * HOW JWT WORKS:
 * 1. User logs in → server signs a token with secret
 * 2. Token sent to client → stored in AsyncStorage
 * 3. Every request → token in Authorization header
 * 4. THIS middleware verifies the token
 * 5. If valid → attach user → continue
 * 6. If invalid → 401 Unauthorized
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check Authorization header: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from "Bearer xxxxxx"
      token = req.headers.authorization.split(" ")[1];

      // Verify token signature + expiry
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user object (without password) to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next(); // ✅ Proceed to route handler
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
