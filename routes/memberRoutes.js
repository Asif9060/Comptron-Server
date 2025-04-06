import express from "express";
import multer from "multer";
import path from "path";
import Member from "../models/Member.js";
import DeletedMember from "../models/DeletedMember.js";

// Multer storage setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();


const getImageBase64 = (file) => {
  const mimeType = file.mimetype; 
  const base64Data = file.buffer.toString("base64"); 
  return `data:${mimeType};base64,${base64Data}`; 
};


router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, role, socials } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required." });
    }

    const imageBase64 = req.file
      ? getImageBase64(req.file) 
      : null;

    const newMember = new Member({
      name,
      role,
      socials: socials ? JSON.parse(socials) : [],
      image: imageBase64, 
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
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: "Error fetching member", error });
  }
});


router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, role, socials } = req.body;
    const memberId = req.params.id;

    const existingMember = await Member.findById(memberId);
    if (!existingMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    let imageBase64 = existingMember.image; 
    if (req.file) {
      imageBase64 = getImageBase64(req.file);
    }

    existingMember.name = name || existingMember.name;
    existingMember.role = role || existingMember.role;
    // existingMember.email = email || existingMember.email;
    // existingMember.bio = bio || existingMember.bio;
    existingMember.socials = socials ? JSON.parse(socials) : existingMember.socials;
    existingMember.image = imageBase64; // Store base64 image

    await existingMember.save();
    res.status(200).json(existingMember);
  } catch (error) {
    res.status(500).json({ message: "Error updating member", error });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const memberToDelete = await Member.findById(id);
    if (!memberToDelete) {
      return res.status(404).json({ message: "Member not found" });
    }

    
    const deletedMember = new DeletedMember({
      name: memberToDelete.name,
      role: memberToDelete.role,
      // email: memberToDelete.email,
      // bio: memberToDelete.bio,
      socials: memberToDelete.socials,
      image: memberToDelete.image,
    });

    await deletedMember.save(); 
    await Member.findByIdAndDelete(id);

    res.status(200).json({ message: "Member archived successfully", deletedMember });
  } catch (error) {
    res.status(500).json({ message: "Error archiving member", error });
  }
});

export default router;









// import express from "express";
// import createMember from "../controllers/memberController.js";  
// import upload from "../middleware/upload.js";  
// import Member from "../models/Member.js";
// import DeletedMember from "../models/DeletedMember.js";

// const router = express.Router();


// router.post("/", upload.single("image"), createMember); 

// router.get("/", async (req, res) => {
//     try {
//         const members = await Member.find(); 
//         res.status(200).json(members);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });


// router.put("/:id", upload.single("image"), async (req, res) => {
//     try {
//         const { name, role, email, bio, socials } = req.body;
//         const memberId = req.params.id;

       
//         const existingMember = await Member.findById(memberId);
//         if (!existingMember) {
//             return res.status(404).json({ message: "Member not found" });
//         }

        
//         const imageUrl = req.file ? `/uploads/${req.file.filename}` : existingMember.image;

        
//         existingMember.name = name || existingMember.name;
//         existingMember.role = role || existingMember.role;
//         existingMember.email = email || existingMember.email;
//         existingMember.bio = bio || existingMember.bio;
//         existingMember.socials = socials ? JSON.parse(socials) : existingMember.socials;
//         existingMember.image = imageUrl;

//         await existingMember.save(); 

//         res.status(200).json(existingMember);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error updating member", error });
//     }
// });


// // router.delete("/:id", async (req, res) => {
// //     const { id } = req.params;

// //     try {
// //         const deletedMember = await Member.findByIdAndDelete(id); // Assuming you're using Mongoose
// //         if (!deletedMember) {
// //             return res.status(404).json({ message: "Member not found" });
// //         }
// //         res.status(200).json({ message: "Member deleted successfully", deletedMember });
// //     } catch (error) {
// //         console.error("Error deleting member:", error);
// //         res.status(500).json({ message: "Server error" });
// //     }
// // });

// router.delete("/:id", async (req, res) => {
//     const { id } = req.params;

//     try {
//         const memberToDelete = await Member.findById(id);
//         if (!memberToDelete) {
//             return res.status(404).json({ message: "Member not found" });
//         }

//         // Move to deleted members collection
//         const deletedMember = new DeletedMember({
//             name: memberToDelete.name,
//             role: memberToDelete.role,
//             email: memberToDelete.email,
//             bio: memberToDelete.bio,
//             socials: memberToDelete.socials,
//             image: memberToDelete.image
//         });

//         await deletedMember.save(); 
//         await Member.findByIdAndDelete(id); 

//         res.status(200).json({ message: "Member archived successfully", deletedMember });
//     } catch (error) {
//         console.error("Error archiving member:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

// export default router; 