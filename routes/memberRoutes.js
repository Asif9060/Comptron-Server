import express from "express";
import multer from "multer";
import Member from "../models/Member.js";
import DeletedMember from "../models/DeletedMember.js";
import cloudinary from '../config/cloudinary.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

const generateUniqueId = async () => {
  const year = new Date().getFullYear();
  let randomDigits = Math.floor(1000 + Math.random() * 9000);
  let existingMember = await Member.findOne({
    customId: `CCM${year}-${randomDigits}`,
  });
  while (existingMember) {
    randomDigits = Math.floor(1000 + Math.random() * 9000);
    existingMember = await Member.findOne({
      customId: `CCM${year}-${randomDigits}`,
    });
  }
  return `CCM${year}-${randomDigits}`;
};

router.get("/byYear", async (req, res) => {
  try {
    const members = await Member.find();

    if (!members || members.length === 0) {
      return res.status(404).json({ message: "No members found" });
    }

    // Group members by year of validation
    const committeeByYear = members.reduce((acc, member) => {
      if (member.validityDate) {
        const year = new Date(member.validityDate).getFullYear();
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push({
          id: member.customId,
          name: member.name,
          role: member.role,
        });
      }
      return acc;
    }, {});

    res.json(committeeByYear);
  } catch (error) {
    console.error("Error in /byYear route:", error);
    res
      .status(500)
      .json({ message: "Error fetching committee members by year", error });
  }
});

// Create Member
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, role, email, phone, skills, socials, validityDate, isValid } =
      req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required." });
    }

    const customId = await generateUniqueId();
    let imageUrl = null;
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        });
        stream.end(req.file.buffer);
      });
    }

    const newMember = new Member({
      customId,
      name,
      role,
      email,
      phone,
      skills,
      image: imageUrl,
      validityDate,
      isValid: isValid === "true" || isValid === true,
      socials: socials ? JSON.parse(socials) : [],
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({ message: "Error creating member", error });
  }
});

router.get("/", async (req, res) => {
  try {
    const members = await Member.find();
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: "Error fetching members", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findOne({ customId: req.params.id });
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: "Error fetching member", error });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, role, email, phone, skills, socials, validityDate, isValid } =
      req.body;
    const memberId = req.params.id;

    const existingMember = await Member.findOne({ customId: memberId }); // FIXED this line
    if (!existingMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    let imageUrl = existingMember.image;
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        });
        stream.end(req.file.buffer);
      });
    }

    existingMember.name = name || existingMember.name;
    existingMember.role = role || existingMember.role;
    existingMember.email = email || existingMember.email;
    existingMember.phone = phone || existingMember.phone;
    existingMember.skills = skills || existingMember.skills; // FIXED typo here
    existingMember.validityDate = validityDate || existingMember.validityDate;
    existingMember.isValid =
      isValid !== undefined
        ? isValid === "true" || isValid === true
        : existingMember.isValid;
    existingMember.socials = socials
      ? JSON.parse(socials)
      : existingMember.socials;
    existingMember.image = imageUrl;

    await existingMember.save();
    res.status(200).json(existingMember);
  } catch (error) {
    console.error("Error updating member:", error); // <-- helpful for debugging!
    res.status(500).json({ message: "Error updating member", error });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const memberToDelete = await Member.findOne({ customId: id }); // FIXED
    if (!memberToDelete) {
      return res.status(404).json({ message: "Member not found" });
    }

    const deletedMember = new DeletedMember({
      name: memberToDelete.name,
      role: memberToDelete.role,
      email: memberToDelete.email,
      phone: memberToDelete.phone,
      skills: memberToDelete.skills,
      image: memberToDelete.image,
      validityDate: memberToDelete.validityDate,
      isValid: memberToDelete.isValid,
      socials: memberToDelete.socials,
    });

    await deletedMember.save();
    await Member.deleteOne({ customId: id }); // FIXED

    res
      .status(200)
      .json({ message: "Member archived successfully", deletedMember });
  } catch (error) {
    console.error("Error archiving member:", error); // helpful log
    res.status(500).json({ message: "Error archiving member", error });
  }
});

router.get("/:id", async (req, res) => {
  const member = await Member.findOne({ customId: req.params.id });
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(member);
});

router.put("/validity/:id", async (req, res) => {
  const { isValid, validityDate } = req.body;
  const member = await Member.findOneAndUpdate(
    { customId: req.params.id },
    { isValid, validityDate },
    { new: true }
  );
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(member);
});

export default router;
