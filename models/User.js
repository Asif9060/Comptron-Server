import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  skills: String,
  firebaseUserId: { type: String, required: true },
  customId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  gender:   { 
    type: String, 
    enum: ["Male", "Female"],
    required: true 
  },
  linkedIn: String,
  github: String,
  portfolio: String,
  cv: String,
  validityDate: { 
    type: Date, 
    required: true, 
    default: () => {
      const today = new Date();
      today.setFullYear(today.getFullYear() + 1); // Add 1 year
      return today;
    }
  },
  isValid: Boolean,
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to check if password is correct
UserSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
