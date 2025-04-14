import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    skills: String,
    otp: { type: String, required: true },
    customId: {
      type: String,
      unique: true,
    },
    image: {
      type: String,
    },
    validityDate: { type: Date, required: true },
  });

export default mongoose.model('TempUser', tempUserSchema);