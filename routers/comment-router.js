import { Router } from "express";
import { Image } from "../models/image.js";
import { Comment } from "../models/comment.js";
import { authenticateToken } from "../middleware/jwt-auth.js";

export const commentRouter = Router();

/**
 * The following code was generated using Github
 * Copilot autocomplete and manually editted:
 */

commentRouter.post("/", authenticateToken, async (req, res) => {
  try {
    const { author, content, imageId } = req.body;

    if (!author || !content || !imageId) {
      return res
        .status(400)
        .json({ error: "Author, content, and imageId are required" });
    }

    const image = await Image.findByPk(imageId);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    const date = new Date();

    const comment = await Comment.create({
      author,
      content,
      date,
      ImageId: imageId,
    });

    res.status(201).json({ message: "Comment posted successfully", comment });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

commentRouter.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await comment.destroy();
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error });
  }
});
