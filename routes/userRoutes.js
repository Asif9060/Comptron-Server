import express from "express";
import User from "../models/User.js"; // your mongoose model
const router = express.Router();

// Helper function to generate Unique ID like CM2025xxxx
const generateUniqueId = async () => {
  const year = new Date().getFullYear();
  let randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 random digits

  // Ensure no duplicate IDs (optional but good practice)
  let existingUser = await User.findOne({ customId: `CM${year}-${randomDigits}` });
  while (existingUser) {
    randomDigits = Math.floor(1000 + Math.random() * 9000);
    existingUser = await User.findOne({ customId: `CM${year}-${randomDigits}` });
  }

  return `CM${year}-${randomDigits}`;
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, skills, image } = req.body; // <-- added image

    const customId = await generateUniqueId(); // Generate the ID

    const newUser = new User({
      name,
      email,
      phone,
      skills,
      customId,
      image, // <-- store base64 image here
    });

    await newUser.save();
    res.status(201).json(newUser); // Return the created user
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET USER PROFILE BY ID
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findOne({ customId: req.params.id });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/profile/:id", async (req, res) => {
  try {
    const { name, skills, email, phone, image } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Validate image size (optional, e.g., max 5MB as base64)
    if (image && image.length > 7 * 1024 * 1024) { // ~5MB after base64 encoding
      return res.status(400).json({ message: "Image size exceeds 5MB" });
    }

    const updateData = { name, skills, email, phone, image };

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Failed to update profile" });
  }
});

router.get("/", async (req, res) => {
    try {
      const users = await User.find(); // Fetch all users
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  });

export default router;
