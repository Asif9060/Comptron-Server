import mongoose from "mongoose";

const rejectedUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
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
      required: true,
    },
    rejectionReason: {
      type: String,
      default: "Not specified",
    },
    rejectedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const RejectedUser = mongoose.model("RejectedUser", rejectedUserSchema);

export default RejectedUser; 