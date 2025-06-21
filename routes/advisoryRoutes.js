import express from "express";
import User from "../models/AdvisoryPanel.js";
import Event from "../models/Event.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import protectAdminRoute from '../middleware/adminAuth.js';

const router = express.Router();

// Register new user with Cloudinary image upload
router.post("/register", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      skills,
      gender,
      password,
      studentId,
      bloodGroup,
      department,
      dateOfBirth,
    } = req.body;
    let imageUrl = req.body.image;

    if (req.file) {
      // Convert buffer to base64 for Cloudinary upload
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "users",
        resource_type: 'auto'
      });
      imageUrl = result.secure_url;
    }

    const customId = req.body.customId;

    const newUser = new User({
      name,
      email,
      phone,
      skills,
      customId,
      gender,
      image: imageUrl,
      password,
      studentId,
      bloodGroup,
      department,
      dateOfBirth,
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

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/update/:id", protectAdminRoute, async (req, res) => {
  try {
    const {
      name,
      skills,
      email,
      phone,
      image,
      linkedIn,
      github,
      gender,
      portfolio,
      cv,
      bio,
    } = req.body;

    const updateData = {
      name,
      skills,
      email,
      phone,
      image,
      linkedIn,
      github,
      gender,
      portfolio,
      cv,
      bio,
    };

    const user = await User.findOneAndUpdate(
      { customId: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: error.message || "Failed to update profile" });
  }
});

router.put("/validate/:id", protectAdminRoute, async (req, res) => {
  try {
    // Generate new customId
    const newCustomId = req.body.customId;

    const user = await User.findOneAndUpdate(
      { customId: req.params.id },
      {
        customId: newCustomId,
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

// Update user profile by customId with Cloudinary image upload
router.put("/profile/:id", protectAdminRoute, upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      skills,
      email,
      phone,
      linkedIn,
      github,
      gender,
      portfolio,
      cv,
      bio,
      studentId,
      bloodGroup,
      department,
      dateOfBirth,
    } = req.body;

    let imageUrl = req.body.image;
    if (req.file) {
      // Convert buffer to base64 for Cloudinary upload
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "users",
        resource_type: 'auto'
      });
      imageUrl = result.secure_url;
    }

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const updateData = {
      name,
      skills,
      email,
      phone,
      image: imageUrl,
      linkedIn,
      github,
      gender,
      portfolio,
      cv,
      bio,
      studentId,
      bloodGroup,
      department,
      dateOfBirth,
    };

    const user = await User.findOneAndUpdate(
      { customId: req.params.id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: error.message || "Failed to update profile" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
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

router.delete("/delete/:id", protectAdminRoute, async (req, res) => {
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
router.get("/stats", protectAdminRoute, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isValid: true });
    const pendingUsers = await PendingUser.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() },
    });

    res.json({
      totalUsers,
      activeUsers,
      pendingUsers,
      upcomingEvents,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
});

// New route to fetch users grouped by year of validation
router.get("/byYear", async (req, res) => {
  try {
    const users = await User.find(); // Group users by year of validation
    const usersByYear = users.reduce((acc, user) => {
      const year = user.validityDate.getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        skills: user.skills,
        bio: user.bio,
        studentId: user.studentId,
        bloodGroup: user.bloodGroup,
        department: user.department,
        dateOfBirth: user.dateOfBirth,
        customId: user.customId,
        gender: user.gender,
        linkedIn: user.linkedIn,
        github: user.github,
        portfolio: user.portfolio,
        cv: user.cv,
        validityDate: user.validityDate,
        isValid: user.validityDate >= new Date(),
      });
      return acc;
    }, {});

    res.json(usersByYear);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users by year", error });
  }
});

export default router;
