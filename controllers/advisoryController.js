import AdvisoryMember from "../models/AdvisoryMember.js";
import cloudinary from "../config/cloudinary.js";
import { unlinkSync } from "fs";

// Get all advisory members
export const getAllMembers = async (req, res) => {
  try {
    const members = await AdvisoryMember.find({ isDeleted: false });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get member by ID
export const getMemberById = async (req, res) => {
  try {
    const member = await AdvisoryMember.findOne({
      customId: req.params.id,
      isDeleted: false,
    });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new member
export const createMember = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      role,
      skills,
      bio,
      socials,
    } = req.body;

    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "advisory_members",
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "face",
        quality: "auto",
      });
      imageUrl = result.secure_url;
      unlinkSync(req.file.path);
    }

    const validityDate = new Date();
    validityDate.setFullYear(validityDate.getFullYear() + 2);

    const member = new AdvisoryMember({
      name,
      email,
      phone,
      image: imageUrl,
      gender,
      role,
      skills: JSON.parse(skills),
      bio,
      socials: JSON.parse(socials),
      validityDate,
    });

    await member.save();
    res.status(201).json(member);
  } catch (error) {
    if (req.file && req.file.path) {
      unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
};

// Update member
export const updateMember = async (req, res) => {
  try {
    const member = await AdvisoryMember.findOne({
      customId: req.params.id,
      isDeleted: false,
    });
    if (!member) {
      if (req.file && req.file.path) {
        unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Member not found" });
    }

    let imageUrl = member.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "advisory_members",
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "face",
        quality: "auto",
      });
      imageUrl = result.secure_url;

      if (member.image) {
        const publicId = member.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`advisory_members/${publicId}`);
      }
      unlinkSync(req.file.path);
    }

    const updateData = {
      ...req.body,
      image: imageUrl,
      skills: JSON.parse(req.body.skills || "[]"),
      socials: JSON.parse(req.body.socials || "{}"),
    };

    const updatedMember = await AdvisoryMember.findOneAndUpdate(
      { customId: req.params.id },
      updateData,
      { new: true }
    );

    res.json(updatedMember);
  } catch (error) {
    if (req.file && req.file.path) {
      unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
};

// Soft delete member
export const deleteMember = async (req, res) => {
  try {
    const member = await AdvisoryMember.findOne({
      customId: req.params.id,
      isDeleted: false,
    });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.isDeleted = true;
    await member.save();
    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get members by role
export const getMembersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const members = await AdvisoryMember.find({
      role,
      isDeleted: false,
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
