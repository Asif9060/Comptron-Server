import express from "express";
import Comment from "../models/Comment.js";
import { checkOrigin } from '../middleware/checkOrigin.js';

const router = express.Router();

// POST: Add a new comment
router.post("/add", checkOrigin, async (req, res) => {
  try {
    const { name, email, message, eventId  } = req.body;
    const newComment = new Comment({ name, email, message, eventId });
    await newComment.save();
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Fetch all comments
router.get("/", checkOrigin, async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:eventId", checkOrigin, async (req, res) => {
  try {
    const comments = await Comment.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments", error });
  }
});


// DELETE: Remove a comment
router.delete("/:id", checkOrigin, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
