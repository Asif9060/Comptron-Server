// routes/auth.js

import express from 'express';
const router = express.Router();
import otpGenerator from 'otp-generator';
import OTP from '../models/otpModel.js';
import sendMail from '../utils/mailSender.js';

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  // Generate a 6-digit numeric OTP
  const otpCode = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

  // Save OTP to the database
  await OTP.create({ email, code: otpCode });

  // Send OTP via email
  await sendMail(email, 'Your OTP Code', `Your OTP is ${otpCode}. It will expire in 5 minutes.`);

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