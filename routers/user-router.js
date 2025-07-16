/**
 * The following code was refactored using the
 * following Github Copilot prompt and manually editted:
 *
 * Right now the program uses session cookies, refactor to use bearer tokens instead.
 *
 *
 */
import { User } from "../models/user.js";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/jwt-auth.js";

export const usersRouter = Router();

// Helper function to generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
}

usersRouter.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    if (username.length < 3 || username.length > 32) {
      return res
        .status(400)
        .json({ error: "Username must be between 3 and 32 characters." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists." });
    }

    const user = User.build({
      username: username,
    });

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    user.password = hashedPassword;
    await user.save();

    // Generate JWT token for the new user
    const token = generateToken(user.id);

    return res.status(201).json({
      username: user.username,
      token: token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(422).json({ error: "User creation failed." });
  }
});

usersRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    const user = await User.findOne({
      where: {
        username: username,
      },
    });

    if (user === null) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }
    // Check password
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return res.json({
      username: user.username,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed." });
  }
});

usersRouter.post("/logout", function (req, res, next) {
  // With JWT, logout is handled client-side by removing the token
  // Server-side logout would require token blacklisting (more complex)
  res.json({
    message: "Logged out successfully. Please remove token from client.",
  });
});

usersRouter.get("/me", authenticateToken, async (req, res) => {
  // User is already attached to req by the authenticateToken middleware
  return res.json({ username: req.user.username });
});

usersRouter.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;

    // Validate limit and offset are positive integers
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: "Invalid limit parameter" });
    }
    if (isNaN(offset) || offset < 0) {
      return res.status(400).json({ error: "Invalid offset parameter" });
    }

    const users = await User.findAll({
      attributes: ["id", "username"], // Don't include password
      order: [["username", "ASC"]],
      limit,
      offset,
    });

    const totalCount = await User.count();

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
      totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Cannot fetch users" });
  }
});
