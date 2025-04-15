// routes/auth.js

import nodemailer from "nodemailer";
import express from 'express';
const router = express.Router();
import otpGenerator from 'otp-generator';
import OTP from '../models/otpModel.js';
// import sendMail from '../utils/mailSender.js';

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  // Generate a 6-digit numeric OTP
  const otpCode = otpGenerator.generate(6, {digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

  // Save OTP to the database
  await OTP.create({ email, code: otpCode });

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: "glox iytq dvrq unnh", // Use App Password if 2FA is enabled
    },
  });
  
  const sendMail = async (to, subject, text) => {
    const mailOptions = {
      from: `"Comptron" <asiffoisalaisc@gmail.com>`,
      to,
      subject,
      text: `Your OTP for email verification is: ${otpCode}. It expires in 10 minutes.`,
      html: `
              <div style="background-color:#f9fafb; padding: 30px; font-family: Arial, sans-serif; text-align: center;">
                <div style="background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: inline-block;">
                  <h2 style="color: #4F46E5; margin-bottom: 20px;">🔒 Verify Your Email</h2>
                  <p style="font-size: 16px; color: #333;">Use the OTP below to complete your verification:</p>
                  <div style="font-size: 32px; margin: 20px 0; font-weight: bold; letter-spacing: 5px; color: #4F46E5;">
                    ${otpCode}
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
  };

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