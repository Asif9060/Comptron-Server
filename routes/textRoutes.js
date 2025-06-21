import express from "express";
import Text from "../models/Text.js";
import protectAdminRoute from '../middleware/adminAuth.js';

const router = express.Router();

// POST /api/text - Save rich text content
router.post('/text', protectAdminRoute, async (req, res) => {
  try {
    const { textContent } = req.body;
    const newText = new Text({ textContent });
    await newText.save();
    res.status(201).json(newText);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/text/:id - Retrieve content by ID
router.get('/text/:id', protectAdminRoute, async (req, res) => {
  try {
    const text = await Text.findById(req.params.id);
    if (!text) return res.status(404).json({ message: 'Text not found' });
    res.json(text);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 