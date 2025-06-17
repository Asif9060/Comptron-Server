import mongoose from "mongoose";
const { Schema } = mongoose;

const advisoryMemberSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    role: {
      type: String,
      enum: ["advisor", "moderator", "head"],
      required: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    bio: {
      type: String,
      required: true,
    },
    socials: {
      linkedin: String,
      github: String,
      portfolio: String,
      cv: String,
    },
    customId: {
      type: String,
      unique: true,
    },
    validityDate: {
      type: Date,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate customId
advisoryMemberSchema.pre("save", async function (next) {
  if (!this.customId) {
    const prefix = this.role === "head" ? "HEAD-" : "CMAP-";
    const count = await mongoose.model("AdvisoryMember").countDocuments();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.customId = `${prefix}${randomNum}`;
  }
  next();
});

const AdvisoryMember = mongoose.model("AdvisoryMember", advisoryMemberSchema);
export default AdvisoryMember;
