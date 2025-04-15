// import express from "express";
// import User from "../models/User.js"; // Your permanent User model
// import TempUser from "../models/TempUser.js"; // Your temporary TempUser model
// import nodemailer from "nodemailer";

// const router = express.Router();

// // Email transporter setup
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "asiffoisalaisc@gmail.com",
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Generate 6-digit OTP
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Route: Request OTP and Save temp data
// router.post("/users/register", async (req, res) => {
//   try {
//     const { name, email, phone, skills, image } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     // Remove existing temp user if any
//     await TempUser.deleteOne({ email });

//     const otp = generateOTP();
//     const validityDate = new Date();
//     validityDate.setFullYear(validityDate.getFullYear() + 1);
//     const tempUser = new TempUser({
//       name,
//       email,
//       phone,
//       skills,
//       image,
//       otp,
//       createdAt: Date.now(),
//       validityDate,
//     });

//     await tempUser.save();

//     // Send OTP email
//     const mailOptions = {
//       from: `"Comptron" <asiffoisalaisc@gmail.com>`,
//       to: email,
//       subject: "Verify Your Email - OTP",
//       html: `
//                 <div style="background-color:#f9fafb; padding: 30px; font-family: Arial, sans-serif; text-align: center;">
//                     <div style="background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: inline-block;">
//                         <h2 style="color: #4F46E5; margin-bottom: 20px;">🔒 Verify Your Email</h2>
//                         <p style="font-size: 16px; color: #333;">Use the OTP below to complete your verification:</p>
//                         <div style="font-size: 32px; margin: 20px 0; font-weight: bold; letter-spacing: 5px; color: #4F46E5;">
//                             ${otp}
//                         </div>
//                         <p style="font-size: 14px; color: #666;">This OTP is valid for <strong>5 minutes</strong>.</p>
//                         <p style="margin-top: 30px; font-size: 12px; color: #aaa;">
//                             If you didn't request this, you can safely ignore this email.
//                         </p>
//                         <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
//                         <p style="font-size: 14px; color: #999;">Comptron Team 🌟</p>
//                     </div>
//                 </div>
//             `,
//     };

//     await transporter.sendMail(mailOptions);
//     res.json({ message: "Please check your email for OTP verification." });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error during registration: " + error.message });
//   }
// });

// // Route: Verify OTP and Move to permanent storage
// router.post("/users/verify-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const tempUser = await TempUser.findOne({ email });

//     if (!tempUser) {
//       return res.status(404).json({ message: "User not found or OTP expired" });
//     }

//     if (tempUser.otp !== otp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // Move user to permanent collection
//     const newUser = new User({
//       name: tempUser.name,
//       email: tempUser.email,
//       phone: tempUser.phone,
//       skills: tempUser.skills,
//       image: tempUser.image,
//     });

//     await newUser.save();
//     await TempUser.deleteOne({ email }); // Clean temp user

//     res.json({ message: "Email verified and account created successfully!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error verifying OTP: " + error.message });
//   }
// });

// export default router;

import express from 'express';
import User from '../models/User.js';
import TempUser from '../models/TempUser.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'asiffoisalaisc@gmail.com', // Replace with your email
        pass: process.env.EMAIL_PASS    // Replace with your app-specific password
    }
});

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user already exists in permanent collection
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Check if already in temporary collection
        const existingTempUser = await TempUser.findOne({ email });
        if (existingTempUser) {
            await TempUser.deleteOne({ email }); // Remove old temp entry
        }

        const otp = generateOTP();
        const tempUser = new TempUser({
            name,
            email,
            phone,
            password, // Add hashing in production
            otp
        });

        await tempUser.save();

        // Send OTP email
        const mailOptions = {
            from: `"Comptron" <asiffoisalaisc@gmail.com>`,
            to: email,
            subject: 'Verify Your Email - OTP',
            text: `Your OTP for email verification is: ${otp}. It expires in 10 minutes.`,
            html: `
            <div style="background-color:#f9fafb; padding: 30px; font-family: Arial, sans-serif; text-align: center;">
              <div style="background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: inline-block;">
                <h2 style="color: #4F46E5; margin-bottom: 20px;">🔒 Verify Your Email</h2>
                <p style="font-size: 16px; color: #333;">Use the OTP below to complete your verification:</p>
                <div style="font-size: 32px; margin: 20px 0; font-weight: bold; letter-spacing: 5px; color: #4F46E5;">
                  ${otp}
                </div>
                <p style="font-size: 14px; color: #666;">This OTP is valid for <strong>5 minutes</strong>.</p>
                <p style="margin-top: 30px; font-size: 12px; color: #aaa;">
                  If you didn't request this, you can safely ignore this email.
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 14px; color: #999;">Comptron Team 🌟</p>
              </div>
            </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Please check your email for OTP verification.' });
    } catch (error) {
        res.status(500).json({ message: 'Error during registration: ' + error.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const tempUser = await TempUser.findOne({ email });

        if (!tempUser) {
            return res.status(404).json({ message: 'User not found or OTP expired' });
        }

        if (tempUser.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Move data to permanent User collection
        const newUser = new User({
            name: tempUser.name,
            email: tempUser.email,
            phone: tempUser.phone,
            password: tempUser.password
        });

        await newUser.save();
        await TempUser.deleteOne({ email }); // Clean up temporary data

        res.json({ message: 'Email verified and account created successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP: ' + error.message });
    }
});

export default router;
