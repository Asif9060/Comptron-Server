import express from "express";
import multer from "multer";
import AboutImage from "../models/AboutImage.js";
import cloudinary from '../config/cloudinary.js';
import { checkOrigin } from '../middleware/checkOrigin.js';
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", checkOrigin, upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        let imageUrl = null;
        if (req.file) {
            
            const result = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
                if (error) throw error;
                imageUrl = result.secure_url;
                const newImage = new AboutImage({ imageUrl, title, description });
                await newImage.save();
                res.status(201).json(newImage);
            });
            result.end(req.file.buffer);
            return;
        } else {
            const newImage = new AboutImage({ imageUrl, title, description });
            await newImage.save();
            res.status(201).json(newImage);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/", checkOrigin, async (req, res) => {
    try {
        const images = await AboutImage.find();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", checkOrigin, upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        let updateData = { title, description };
        if (req.file) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
                if (error) throw error;
                updateData.imageUrl = result.secure_url;
                const updatedImage = await AboutImage.findByIdAndUpdate(
                    req.params.id,
                    updateData,
                    { new: true }
                );
                res.status(200).json(updatedImage);
            });
            result.end(req.file.buffer);
            return;
        }
        const updatedImage = await AboutImage.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.status(200).json(updatedImage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete("/:id", checkOrigin, async (req, res) => {
    try {
        const image = await AboutImage.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        // Extract public_id from imageUrl
        // Assuming imageUrl is like "http://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.jpg"
        // Or "https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.jpg"
        if (image.imageUrl) {
            const imageUrlParts = image.imageUrl.split('/');
            const publicIdWithExtension = imageUrlParts[imageUrlParts.length -1];
            const public_id = publicIdWithExtension.split('.')[0];
            
            // Delete from Cloudinary
            await cloudinary.uploader.destroy(public_id, (error, result) => {
                if (error) {
                    console.error("Cloudinary delete error:", error);
                    // Decide if you want to stop or continue if Cloudinary deletion fails
                    // For now, we'll log the error and proceed to delete from DB
                }
                console.log("Cloudinary delete result:", result);
            });
        }

        await AboutImage.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Image deleted successfully from Cloudinary and database" });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;