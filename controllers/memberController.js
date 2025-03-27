import Member from "../models/Member.js";  // Import the Member model
import upload from "../middleware/upload.js";  // Import the upload middleware

// Controller to create a new member
 const createMember = async (req, res) => {
    try {
        const { name, role, email, bio, socials } = req.body;

        // Handle the image file upload
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newMember = new Member({
            name,
            role,
            email,
            bio,
            socials: JSON.parse(socials),  // Parsing the JSON string of socials
            image: imageUrl,  // Store the image URL
        });

        await newMember.save();  // Save to the database
        res.status(201).json(newMember);  // Return the created member
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};
export default createMember;