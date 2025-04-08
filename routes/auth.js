import express from 'express';
import User from '../models/User.js';
import OTP from '../models/OTP.js'; // If you have separate OTP model
import bcrypt from 'bcryptjs';

const router = express.Router();

// Signup with OTP Verification
router.post('/signup', async (req, res) => {
  try {
    const { name, email, roll, phone, password, otp } = req.body;

    // Verify OTP first
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered!' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      roll,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(201).json({ message: 'Signup successful!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

export default router;
