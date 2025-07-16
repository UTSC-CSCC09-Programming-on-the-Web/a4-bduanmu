import { Router } from "express";
import { Image } from "../models/image.js";
import { Comment } from "../models/comment.js";
import { authenticateToken } from "../middleware/jwt-auth.js";
import path from "path";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const imageRouter = Router();

/**
 * The following code was generated using Github
 * Copilot autocomplete and manually editted:
 */

imageRouter.post("/", upload.single("image"), authenticateToken, async (req, res) => {
  try {
    const { author, content } = req.body;

    if (!author || !content) {
      return res.status(400).json({ error: "Author and title are required" });
    }

    const imageFile = req.file
      ? { path: req.file.path, mimetype: req.file.mimetype }
      : null;

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const date = new Date();

    const image = await Image.create({
      author,
      title: content,
      image: imageFile,
      date,
    });

    res.status(201).json({ message: "Image posted successfully", image });
  } catch (error) {
    console.error("Error creating image:", error);
    return res.status(500).json({ error: "Cannot post image" });
  }
});

imageRouter.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  // Validate limit and offset are positive integers
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ error: "Invalid limit parameter" });
  }
  if (isNaN(offset) || offset < 0) {
    return res.status(400).json({ error: "Invalid offset parameter" });
  }

  try {
    const images = await Image.findAll({
      order: [["date", "ASC"]],
      limit,
      offset,
    });

    return res
      .status(200)
      .json({ message: "Images fetched successfully", images });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// Get images by author
imageRouter.get("/author/:authorUsername", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const author = req.params.authorUsername;

  // Validate limit and offset are positive integers
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ error: "Invalid limit parameter" });
  }
  if (isNaN(offset) || offset < 0) {
    return res.status(400).json({ error: "Invalid offset parameter" });
  }

  try {
    const images = await Image.findAll({
      where: {
        author: author,
      },
      order: [["date", "DESC"]],
      limit,
      offset,
    });

    const count = await Image.count({
      where: {
        author: author,
      },
    });

    return res.status(200).json({
      message: "Images by author fetched successfully",
      images,
      count,
      author,
    });
  } catch (error) {
    console.error("Error fetching images by author:", error);
    return res.status(500).json({ error: "Cannot fetch images by author" });
  }
});

imageRouter.get("/count", async (req, res) => {
  try {
    const count = await Image.count();
    return res
      .status(200)
      .json({ message: "Image count fetched successfully", count });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

imageRouter.get("/count/author/:authorUsername", async (req, res) => {
  const author = req.params.authorUsername;

  try {
    const count = await Image.count({
      where: {
        author: author,
      },
    });

    return res
      .status(200)
      .json({ message: "Image count by author fetched successfully", count });
  } catch (error) {
    return res
      .status(500)
      .json({ error });
  }
});

imageRouter.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid image ID" });
    }

    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    return res
      .status(200)
      .json({ message: "Image fetched successfully", image });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

imageRouter.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid image ID" });
    }

    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Delete all comments associated with this image first
    await Comment.destroy({
      where: { ImageId: id },
    });

    // Then delete the image
    await image.destroy();
    return res
      .status(200)
      .json({ message: "Image and associated comments deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

imageRouter.get("/:id/file", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid image ID" });
    }

    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.setHeader("Content-Type", image.image.mimetype);
    res.sendFile(image.image.path, {
      root: path.resolve(),
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

imageRouter.get("/:id/comments", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid image ID" });
  }

  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;

  // Validate page and limit are non-negative integers
  if (isNaN(page) || page < 0) {
    return res.status(400).json({ error: "Invalid page parameter" });
  }
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ error: "Invalid limit parameter" });
  }

  const offset = page * limit;

  try {
    const comments = await Comment.findAll({
      where: { ImageId: id },
      order: [["date", "DESC"]],
      limit,
      offset,
    });

    return res
      .status(200)
      .json({ message: "Comments fetched successfully", comments });
  } catch (error) {
    return res.status(500).json({ error });
  }
});
