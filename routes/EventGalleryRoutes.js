
import express from "express";
import multer from "multer";
import Event from "../models/EventGallery.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Fetch all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new event image
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "Image URL required" });

    const newEvent = new Event({ imageUrl });
    await newEvent.save();
    res.json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing event image
router.put("/:id", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { imageUrl },
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
