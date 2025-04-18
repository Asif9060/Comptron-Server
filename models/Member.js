import mongoose from "mongoose";  // Use import for ES modules

const memberSchema = new mongoose.Schema({
  customId: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  email: String,
  phone: String,
  skills: String,
  role: String,
  //email: String,
  image: String, // URL or base64
  // bio: String,
  socials: {
    github: String,
    linkedin: String,
    portfolio: String,
    cv: String,
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
  isValid: Boolean,
});

// Export the model as a default export
const Member = mongoose.model("Member", memberSchema);
export default Member;
