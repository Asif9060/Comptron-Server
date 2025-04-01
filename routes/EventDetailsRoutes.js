import express from "express";
import multer from "multer";
import Event from "../models/DetailedEvent.js";

const router = express.Router();

// Multer storage setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new event
router.post("/create", upload.array("galleryImages", 5), async (req, res) => {
  try {
    const { title, description, mainImage } = req.body;
    const galleryImages = req.files.map(file => `data:image/png;base64,${file.buffer.toString("base64")}`);

    const newEvent = new Event({
      title,
      description,
      mainImage,
      galleryImages,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
});

// Get single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event", error });
  }
});

export default router;
