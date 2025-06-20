import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const AdvisorySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  skills: String,
  bio: {
    type: String,
    default: "",
  },
  studentId: {
    type: String,
    required: false,
    default: "",
  },
  bloodGroup: {
    type: String,
    required: false,
    default: "",
  },
  department: {
    type: String,
    required: false,
    default: "",
  },
  dateOfBirth: {
    type: String,
    required: false,
    default: "",
  },
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
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  linkedIn: String,
  github: String,
  portfolio: String,
  cv: String,
});

AdvisorySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to check if password is correct
AdvisorySchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("AdvisoryPanel", AdvisorySchema);
export default User;
