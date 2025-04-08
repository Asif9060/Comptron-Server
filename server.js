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



const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });


  // OTP verification

  const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // 5 minutes TTL
  });
  
  const OTP = mongoose.model('OTP', otpSchema);
  
  // Nodemailer Setup
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  // Generate OTP
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
  
  // API: Send OTP
  app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
  
    const otp = generateOTP();
  
    // Save OTP in database
    await OTP.create({ email, otp });
  
    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to send OTP' });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'OTP sent successfully' });
      }
    });
  });
  
  // API: Verify OTP
  app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
  
    const otpRecord = await OTP.findOne({ email, otp });
  
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  
    // Success: Delete OTP
    await OTP.deleteOne({ _id: otpRecord._id });
  
    res.status(200).json({ message: 'OTP verified successfully' });
  });




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});