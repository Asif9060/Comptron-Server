import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    skills: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    firebaseUserId: {
      type: String,
      required: false, // Now optional, will be created upon approval
    },
    password: {
      type: String,
      required: true, // Password is required to create the Firebase account later
    },
    studentId: {
      type: String,
      default: "",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date,
    },
  },
  { timestamps: true }
);

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

export default PendingUser; 