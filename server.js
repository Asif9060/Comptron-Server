import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import memberRoutes from "./routes/memberRoutes.js";

dotenv.config();  // Load environment variables from .env file

const app = express();

const allowedOrigins = [
  "http://localhost:5173",  // For local development
  "https://comptron.vercel.app" // Allow requests from your deployed frontend
];

// Enable CORS with specific origin (your frontend)
const corsOptions = {
  origin: "http://localhost:5173",  // Allow requests from this origin
  methods: "GET,POST,PUT,DELETE",  // Allow these methods
  allowedHeaders: "Content-Type,Authorization",  // Allow these headers
};

app.use(cors(corsOptions));  // Apply CORS middleware with the specified options

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the "uploads" folder (where images are stored)
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/members", memberRoutes);

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Member routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
