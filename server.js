import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import memberRoutes from "./routes/memberRoutes.js";
import eventRoutes from "./routes/eventRoutes.js"
import newsRoutes from './routes/newsRoutes.js';
import RecentRoutes from "./routes/RecentRoutes.js";
import EventDetailsRoutes from "./routes/EventDetailsRoutes.js"
import bodyParser from "body-parser";
import commentRoutes from "./routes/comments.js";
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/auth.js';
import admin from "firebase-admin";

dotenv.config(); 

const app = express();

const allowedOrigins = [
  "http://localhost:5173",  
  "https://comptron.vercel.app" 
];


const corsOptions = {
  origin: allowedOrigins,  
  methods: "GET,POST,PUT,DELETE", 
  allowedHeaders: "Content-Type,Authorization",  
};

app.use(cors(corsOptions));  


// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));


app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/members", memberRoutes);
app.use("/api", eventRoutes);
app.use('/api/news', newsRoutes); 
app.use('/api/eventImages', RecentRoutes);
app.use('/api/eventDetails', EventDetailsRoutes);
app.use("/api/comments", commentRoutes);
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);


admin.initializeApp({
  credential: admin.credential.cert(require("./firebaseServiceAccountKey.json")),
});

app.delete("/api/firebase/deleteUserByEmail", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(user.uid);
    res.status(200).json({ message: "Firebase user deleted successfully" });
  } catch (error) {
    console.error("Firebase deletion error:", error);
    res.status(500).json({ message: "Failed to delete Firebase user", error: error.message });
  }
});

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});