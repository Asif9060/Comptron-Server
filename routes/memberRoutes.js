import express from "express";
import createMember from "../controllers/memberController.js";  // Using import here
import upload from "../middleware/upload.js";  // Using import here
import Member from "../models/Member.js";

const router = express.Router();

// POST route for creating a member with image upload
router.post("/", upload.single("image"), createMember); 

router.get("/", async (req, res) => {
    try {
        const members = await Member.find(); // Fetch all members from the DB
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put("/:id", upload.single("image"), async (req, res) => {
    try {
        const { name, role, email, bio, socials } = req.body;
        const memberId = req.params.id;

        // Find member by ID
        const existingMember = await Member.findById(memberId);
        if (!existingMember) {
            return res.status(404).json({ message: "Member not found" });
        }

        // Handle optional image upload
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : existingMember.image;

        // Update member data
        existingMember.name = name || existingMember.name;
        existingMember.role = role || existingMember.role;
        existingMember.email = email || existingMember.email;
        existingMember.bio = bio || existingMember.bio;
        existingMember.socials = socials ? JSON.parse(socials) : existingMember.socials;
        existingMember.image = imageUrl;

        await existingMember.save(); // Save updated member to DB

        res.status(200).json(existingMember);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating member", error });
    }
});


router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMember = await Member.findByIdAndDelete(id); // Assuming you're using Mongoose
        if (!deletedMember) {
            return res.status(404).json({ message: "Member not found" });
        }
        res.status(200).json({ message: "Member deleted successfully", deletedMember });
    } catch (error) {
        console.error("Error deleting member:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;  // Use export default to export the router