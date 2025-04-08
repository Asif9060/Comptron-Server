import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../services/mailService.js';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();

  try {
    await OTP.create({ email, otp });
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: 'OTP verified successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};
