// routes/auth.js

import express from 'express';
const router = express.Router();
import otpGenerator from 'otp-generator';
import OTP from '../models/otpModel.js';
import sendMail from '../utils/mailSender.js';

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  // Generate a 6-digit numeric OTP
  const otpCode = otpGenerator.generate(6, {digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

  // Save OTP to the database
  await OTP.create({ email, code: otpCode });

  // Send OTP via email
  await sendMail(email,  email,
    '🔐 Email Verification - Your OTP Code',
    `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0A84FF;">Comptron Registration Verification</h2>
        <p>Hello,</p>
        <p>Thank you for registering with <strong>Comptron</strong>! Please use the following One-Time Password (OTP) to complete your email verification:</p>
  
        <div style="font-size: 28px; font-weight: bold; color: #0A84FF; margin: 20px 0;">
          ${otpCode}
        </div>
  
        <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
  
        <hr style="margin: 30px 0;" />
        <p style="font-size: 12px; color: #777;">If you did not initiate this request, please ignore this email.</p>
        <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} Comptron Club</p>
      </div>
    `);

  res.status(200).json({ message: 'OTP sent to your email.' });
});


// routes/auth.js (continued)
router.post('/verify-otp', async (req, res) => {
    const { email, code } = req.body;
    
    const otpRecord = await OTP.findOne({ email, code });
    
    if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    
    // OTP is valid; proceed with registration or other logic
    await OTP.deleteOne({ _id: otpRecord._id }); // Optional: remove used OTP
  
    res.status(200).json({ message: 'OTP verified successfully.' });
});

export default router;