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
    validityDate: { 
      type: Date, 
      required: true, 
      default: () => {
        const today = new Date();
        today.setFullYear(today.getFullYear() + 1); // Add 1 year
        return today;
      }
    },
  });

export default mongoose.model('TempUser', tempUserSchema);