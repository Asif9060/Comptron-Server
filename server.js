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

dotenv.config(); 

const app = express();

const allowedOrigins = [
  "http://localhost:5173",  
  "https://comptron.vercel.app",
  "https://comptron-server-2.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,POST,PUT,DELETE", 
  allowedHeaders: "Content-Type,Authorization",  
};

app.use(cors(corsOptions));  

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Static files
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/members", memberRoutes);
app.use("/api", eventRoutes);
app.use('/api/news', newsRoutes); 
app.use('/api/eventImages', RecentRoutes);
app.use('/api/eventDetails', EventDetailsRoutes);
app.use("/api/comments", commentRoutes);
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });