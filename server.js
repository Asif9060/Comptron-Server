import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import memberRoutes from "./routes/memberRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import newsArticleRoutes from "./routes/newsArticleRoutes.js";
import RecentRoutes from "./routes/RecentRoutes.js";
import EventDetailsRoutes from "./routes/EventDetailsRoutes.js";
import bodyParser from "body-parser";
import commentRoutes from "./routes/comments.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/auth.js";
import AboutImageRoutes from "./routes/AboutImageRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import advisoryRoutes from "./routes/advisoryRoutes.js";
import textRoutes from "./routes/textRoutes.js";

dotenv.config();

// Initialize Firebase Admin SDK
// TODO: Replace './path/to/your/serviceAccountKey.json' with the actual path to your Firebase service account key file.
// You can download this file from your Firebase project settings -> Service accounts.
// try {
//   admin.initializeApp({
//     credential: admin.credential.cert('./path/to/your/serviceAccountKey.json')
//   });
//   console.log('Firebase Admin SDK initialized successfully.');
// } catch (error) {
//   console.error('Error initializing Firebase Admin SDK:', error);
// }

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://comptron.nwu.ac.bd",
  "https://comptron-club-62ud.vercel.app",
  "https://comptron.vercel.app",
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
app.use("/api/news", newsRoutes);
app.use("/api/news-articles", newsArticleRoutes);
app.use("/api/eventImages", RecentRoutes);
app.use("/api/AboutImages", AboutImageRoutes);
app.use("/api/eventDetails", EventDetailsRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/form", formRoutes);
app.use("/api/advisory", advisoryRoutes);
app.use("/api", textRoutes);

const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI)
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
