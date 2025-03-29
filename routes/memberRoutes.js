import express from "express";
import createMember from "../controllers/memberController.js";  
import upload from "../middleware/upload.js";  
import Member from "../models/Member.js";
import DeletedMember from "../models/DeletedMember.js";

const router = express.Router();


router.post("/", upload.single("image"), createMember); 

router.get("/", async (req, res) => {
    try {
        const members = await Member.find(); 
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put("/:id", upload.single("image"), async (req, res) => {
    try {
        const { name, role, email, bio, socials } = req.body;
        const memberId = req.params.id;

       
        const existingMember = await Member.findById(memberId);
        if (!existingMember) {
            return res.status(404).json({ message: "Member not found" });
        }

        
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : existingMember.image;

        
        existingMember.name = name || existingMember.name;
        existingMember.role = role || existingMember.role;
        existingMember.email = email || existingMember.email;
        existingMember.bio = bio || existingMember.bio;
        existingMember.socials = socials ? JSON.parse(socials) : existingMember.socials;
        existingMember.image = imageUrl;

        await existingMember.save(); 

        res.status(200).json(existingMember);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating member", error });
    }
});


// router.delete("/:id", async (req, res) => {
//     const { id } = req.params;

//     try {
//         const deletedMember = await Member.findByIdAndDelete(id); // Assuming you're using Mongoose
//         if (!deletedMember) {
//             return res.status(404).json({ message: "Member not found" });
//         }
//         res.status(200).json({ message: "Member deleted successfully", deletedMember });
//     } catch (error) {
//         console.error("Error deleting member:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const memberToDelete = await Member.findById(id);
        if (!memberToDelete) {
            return res.status(404).json({ message: "Member not found" });
        }

        // Move to deleted members collection
        const deletedMember = new DeletedMember({
            name: memberToDelete.name,
            role: memberToDelete.role,
            email: memberToDelete.email,
            bio: memberToDelete.bio,
            socials: memberToDelete.socials,
            image: memberToDelete.image
        });

        await deletedMember.save(); 
        await Member.findByIdAndDelete(id); 

        res.status(200).json({ message: "Member archived successfully", deletedMember });
    } catch (error) {
        console.error("Error archiving member:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router; 