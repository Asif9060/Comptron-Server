import multer from "multer";
import path from "path";

// Set up Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage,limits: { fileSize: 50 * 1024 * 1024 }, });

export default upload;
