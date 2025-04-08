import express from 'express';
import User from '../models/User.js';
import nodemailer from 'nodemailer';


const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'asiffoisalaisc@gmail.com', // Replace with your email
        pass: 'glox iytq dvrq unnh'     // Replace with your app-specific password
    },
});

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const otp = generateOTP();
        const newUser = new User({
            name,
            email,
            phone,
            password, // Add hashing in production
            otp
        });

        await newUser.save();

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
        res.json({ message: 'Registration successful! Please check your email for OTP.' });
    } catch (error) {
        res.status(500).json({ message: 'Error during registration: ' + error.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        user.isVerified = true;
        user.otp = null; // Clear OTP after verification
        await user.save();

        res.json({ message: 'Email verified successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP: ' + error.message });
    }
});

export default router;