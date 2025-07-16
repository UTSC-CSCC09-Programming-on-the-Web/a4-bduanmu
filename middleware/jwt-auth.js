/**
 * The following code was refactored using the
 * following Github Copilot prompt and manually editted:
 *
 * Right now the program uses session cookies, refactor to use bearer tokens instead.
 *
 *
 */
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid token - user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      console.error("Token verification error:", error);
      return res.status(500).json({ error: "Token verification failed" });
    }
  }
};

// Optional middleware - doesn't fail if no token provided
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }

  next();
};
