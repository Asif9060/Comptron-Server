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
    text
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;
