// utils/mailSender.js
import nodemailer from "nodemailer";

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
};

export default sendMail;
