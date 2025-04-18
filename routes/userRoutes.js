import express from "express";
import User from "../models/User.js";
import Event from "../models/Event.js";
const router = express.Router();

// Helper function to generate Unique ID like CM2025xxxx
const generateUniqueId = async () => {
  const year = new Date().getFullYear();
  let randomDigits = Math.floor(1000 + Math.random() * 9000);

  let existingUser = await User.findOne({ customId: `CGM${year}-${randomDigits}` });
  while (existingUser) {
    randomDigits = Math.floor(1000 + Math.random() * 9000);
    existingUser = await User.findOne({ customId: `CGM${year}-${randomDigits}` });
  }

  return `CGM${year}-${randomDigits}`;
};

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, skills, image,gender, password  } = req.body;

    const customId = await generateUniqueId();
    const validityDate = new Date();
    validityDate.setFullYear(validityDate.getFullYear() + 1); // Valid for 1 year

    const newUser = new User({
      name,
      email,
      phone,
      skills,
      customId,
      gender,
      image,
      password,
      validityDate,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile by customId
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findOne({ customId: req.params.id });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add isValid flag
    const isValid = user.validityDate >= new Date();
    res.json({ ...user.toObject(), isValid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { name, skills, email, phone, image, linkedIn, github, gender, portfolio, cv } = req.body;

    const updateData = { name, skills, email, phone, image, linkedIn, github, gender, portfolio, cv };

    const user = await User.findOneAndUpdate(
      { customId: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = user.validityDate >= new Date();
    res.json({ ...user.toObject(), isValid });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Failed to update profile" });
  }
});


router.put("/validate/:id", async (req, res) => {
  try {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    // Generate new customId
    const newCustomId = await generateUniqueId();

    const user = await User.findOneAndUpdate(
      { customId: req.params.id },
      {
        validityDate: oneYearFromNow,
        customId: newCustomId,
        isValid: true,
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Validation updated and Custom ID changed",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update user profile by customId
router.put("/profile/:id", async (req, res) => {
  try {
    const { name, skills, email, phone, image, linkedIn, github, gender,  portfolio, cv } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Validate image size (max 5MB as base64)
    if (image && image.length > 7 * 1024 * 1024) {
      return res.status(400).json({ message: "Image size exceeds 5MB" });
    }

    // const validityDate = new Date();
    // validityDate.setFullYear(validityDate.getFullYear() + 1); // Extend validity by 1 year

    const updateData = { name, skills, email, phone, image, linkedIn, github, gender, portfolio, cv };

    const user = await User.findOneAndUpdate(
      { customId: req.params.id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // Add isValid flag
    const isValid = user.validityDate >= new Date();
    res.json({ ...user.toObject(), isValid });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || "Failed to update profile" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    // Add isValid flag to each user
    const usersWithValidity = users.map((user) => ({
      ...user.toObject(),
      isValid: user.validityDate >= new Date(),
    }));
    res.json(usersWithValidity);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

router.get("/getByEmail/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
});
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOneAndDelete({ customId: id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete user account" });
  }
});

router.get("/user-growth", async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user growth data", error });
  }
});

// Stats Route (Admin Only)
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isValid: true });
    const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } });

    res.json({
      totalUsers,
      activeUsers,
      upcomingEvents,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
});

export default router;