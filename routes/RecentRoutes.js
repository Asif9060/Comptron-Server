import express from "express";
import upload from "../middleware/upload.js"; 
import EventImage from "../models/EventImage.js";

const router = express.Router();

// Add new event image
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newImage = new EventImage({ imageUrl, title, description });
        await newImage.save();

        res.status(201).json(newImage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all event images
router.get("/", async (req, res) => {
    try {
        const images = await EventImage.find();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an event image
router.put("/:id", upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

        const updatedImage = await EventImage.findByIdAndUpdate(
            req.params.id,
            { imageUrl, title, description },
            { new: true }
        );

        res.status(200).json(updatedImage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an event image
router.delete("/:id", async (req, res) => {
    try {
        await EventImage.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
