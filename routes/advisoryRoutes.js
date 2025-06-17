import express from "express";
const router = express.Router();
import  upload  from "../middleware/upload.js";
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMembersByRole,
} from "../controllers/advisoryController.js";

// Get all members
router.get("/", getAllMembers);

// Get members by role
router.get("/role/:role", getMembersByRole);

// Get specific member
router.get("/:id", getMemberById);

// Create new member
router.post("/", upload.single("image"), createMember);

// Update member
router.put("/:id", upload.single("image"), updateMember);

// Delete member
router.delete("/:id", deleteMember);

export default router;
