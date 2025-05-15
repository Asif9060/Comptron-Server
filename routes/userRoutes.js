import express from "express";
import User from "../models/User.js";
import Event from "../models/Event.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import PendingUser from '../models/PendingUser.js';
import RejectedUser from '../models/RejectedUser.js';
const router = express.Router();

// Helper function to generate Unique ID like CM2025xxxx
const generateUniqueId = async () => {
  const year = new Date().getFullYear();
  let randomDigits = Math.floor(1000 + Math.random() * 9000);

  let existingUser = await User.findOne({
    customId: `CGM${year}-${randomDigits}`,
  });
  while (existingUser) {
    randomDigits = Math.floor(1000 + Math.random() * 9000);
    existingUser = await User.findOne({
      customId: `CGM${year}-${randomDigits}`,
    });
  }

  return `CGM${year}-${randomDigits}`;
};

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
      dateOfBirth,
    } = req.body;
    let imageUrl = req.body.image;

    if (req.file) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users",
      });
      imageUrl = result.secure_url;
    }

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
      image: imageUrl,
      password,
      validityDate,
      studentId,
      bloodGroup,
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

    // Add isValid flag
    const isValid = user.validityDate >= new Date();
    res.json({ ...user.toObject(), isValid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/update/:id", async (req, res) => {
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

    const isValid = user.validityDate >= new Date();
    res.json({ ...user.toObject(), isValid });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: error.message || "Failed to update profile" });
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

// Update user profile by customId with Cloudinary image upload
router.put("/profile/:id", upload.single("image"), async (req, res) => {
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
      dateOfBirth,
    } = req.body;

    let imageUrl = req.body.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users",
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

    // Add isValid flag
    const isValid = user.validityDate >= new Date();
    res.json({ ...user.toObject(), isValid });
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
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() },
    });

    res.json({
      totalUsers,
      activeUsers,
      upcomingEvents,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
});

// New route to fetch users grouped by year of validation
router.get("/byYear", async (req, res) => {
  try {
    const users = await User.find();

    // Group users by year of validation
    const usersByYear = users.reduce((acc, user) => {
      const year = user.validityDate.getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push({
        id: user._id,
        name: user.name,
        customId: user.customId,
      });
      return acc;
    }, {});

    res.json(usersByYear);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users by year", error });
  }
});

// Get all pending users
router.get("/pending", async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find().sort({ createdAt: -1 });
    res.status(200).json(pendingUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get count of pending users for dashboard
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingUsers = await PendingUser.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const deletedUsers = await User.countDocuments({ status: "deleted" });
    
    // Add any other stats you might need
    res.status(200).json({
      totalUsers,
      pendingUsers,
      activeUsers,
      deletedUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve a user
router.post("/approve/:id", async (req, res) => {
  try {
    // Find the pending user
    const pendingUser = await PendingUser.findById(req.params.id);
    if (!pendingUser) {
      return res.status(404).json({ message: "Pending user not found" });
    }

    // Create a new user in the main Users collection
    const newUser = new User({
      name: pendingUser.name,
      email: pendingUser.email,
      phone: pendingUser.phone,
      skills: pendingUser.skills,
      gender: pendingUser.gender,
      image: pendingUser.image,
      firebaseUserId: pendingUser.firebaseUserId,
      customId: await generateUniqueId(),
      studentId: pendingUser.studentId,
      bloodGroup: pendingUser.bloodGroup,
      dateOfBirth: pendingUser.dateOfBirth,
      status: "active"
    });

    // Save the new user
    await newUser.save();
    
    // Remove the user from the pending collection
    await PendingUser.findByIdAndDelete(req.params.id);
    
    // Send an approval notification email
    try {
      await sendEmail({
        email: pendingUser.email,
        subject: "Account Approved - Welcome to Comptron",
        message: `Dear ${pendingUser.name},\n\nYour registration has been approved. You can now access all platform features with your account.\n\nWelcome to Comptron!\n\nBest regards,\nThe Comptron Team`
      });
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
      // Continue with the approval process even if email fails
    }

    res.status(200).json({ message: "User approved successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject a user
router.post("/reject/:id", async (req, res) => {
  try {
    // Find the pending user
    const pendingUser = await PendingUser.findById(req.params.id);
    if (!pendingUser) {
      return res.status(404).json({ message: "Pending user not found" });
    }

    // Optionally move to rejected users collection for record keeping
    const rejectedUser = new RejectedUser({
      name: pendingUser.name,
      email: pendingUser.email,
      phone: pendingUser.phone,
      skills: pendingUser.skills,
      gender: pendingUser.gender,
      image: pendingUser.image,
      firebaseUserId: pendingUser.firebaseUserId,
      rejectionReason: req.body.reason || "Not specified",
      rejectedAt: new Date()
    });

    await rejectedUser.save();
    
    // Send a rejection notification email
    try {
      await sendEmail({
        email: pendingUser.email,
        subject: "Registration Status Update - Comptron",
        message: `Dear ${pendingUser.name},\n\nThank you for your interest in joining Comptron. After reviewing your application, we regret to inform you that we are unable to approve your registration at this time.\n\n${req.body.reason ? `Reason: ${req.body.reason}` : ''}\n\nIf you have any questions, please feel free to contact us.\n\nBest regards,\nThe Comptron Team`
      });
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
      // Continue with the rejection process even if email fails
    }

    // Remove from pending collection
    await PendingUser.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "User rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk approve users
router.post("/bulk-approve", async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // Process each user sequentially
    for (const userId of userIds) {
      try {
        // Find the pending user
        const pendingUser = await PendingUser.findById(userId);
        if (!pendingUser) {
          results.failed++;
          results.errors.push(`User ${userId} not found`);
          continue;
        }
        
        // Create in main users collection
        const newUser = new User({
          name: pendingUser.name,
          email: pendingUser.email,
          phone: pendingUser.phone,
          skills: pendingUser.skills,
          gender: pendingUser.gender,
          image: pendingUser.image,
          firebaseUserId: pendingUser.firebaseUserId,
          customId: await generateUniqueId(),
          studentId: pendingUser.studentId,
          bloodGroup: pendingUser.bloodGroup,
          dateOfBirth: pendingUser.dateOfBirth,
          status: "active"
        });
        
        await newUser.save();
        await PendingUser.findByIdAndDelete(userId);
        
        // Send approval email (async without waiting)
        sendEmail({
          email: pendingUser.email,
          subject: "Account Approved - Welcome to Comptron",
          message: `Dear ${pendingUser.name},\n\nYour registration has been approved. You can now access all platform features with your account.\n\nWelcome to Comptron!\n\nBest regards,\nThe Comptron Team`
        }).catch(err => console.error(`Failed to send approval email to ${pendingUser.email}:`, err));
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Error processing ${userId}: ${error.message}`);
      }
    }
    
    res.status(200).json({
      message: `Processed ${userIds.length} users. ${results.success} approved, ${results.failed} failed.`,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register a new pending user
router.post("/pending/register", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      skills,
      gender,
      firebaseUserId,
      studentId,
      bloodGroup,
      dateOfBirth,
    } = req.body;
    let imageUrl = req.body.image;

    if (req.file) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users",
      });
      imageUrl = result.secure_url;
    }

    // Check if the user already exists in the main collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Check if the user is already in the pending collection
    const existingPendingUser = await PendingUser.findOne({ email });
    if (existingPendingUser) {
      return res.status(400).json({ error: "Registration already pending approval" });
    }

    // Create a new pending user
    const newPendingUser = new PendingUser({
      name,
      email,
      phone,
      skills,
      gender,
      image: imageUrl,
      firebaseUserId,
      studentId,
      bloodGroup,
      dateOfBirth,
    });

    await newPendingUser.save();

    // Send email notification to admin (optional)
    try {
      await sendEmail({
        email: "admin@comptron.com", // Admin email
        subject: "New User Registration Pending Approval",
        message: `A new user has registered and is pending approval:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nPlease login to the admin dashboard to review this registration.`
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      // Continue with the registration process even if email fails
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        email: email,
        subject: "Registration Received - Comptron",
        message: `Dear ${name},\n\nThank you for registering with Comptron. Your registration has been received and is pending admin approval.\n\nYou will receive another email once your account has been approved.\n\nBest regards,\nThe Comptron Team`
      });
    } catch (emailError) {
      console.error("Failed to send user confirmation email:", emailError);
      // Continue with the registration process even if email fails
    }

    res.status(201).json({ message: "Registration submitted for approval", user: newPendingUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
