import express from 'express';
import User from '../models/User.js';
import nodemailer from 'nodemailer';


const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'asiffoisalaisc@gmail.com', // Replace with your email
        pass: 'glox iytq dvrq unnh'     // Replace with your app-specific password
    }
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
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Verify Your Email - OTP',
            text: `Your OTP for email verification is: ${otp}. It expires in 10 minutes.`
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