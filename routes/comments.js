const express = require("express");
const Comment = require("../models/Comment");

const router = express.Router();

// POST: Add a new comment
router.post("/add", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newComment = new Comment({ name, email, message });
    await newComment.save();
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Fetch all comments
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remove a comment
router.delete("/:id", async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
