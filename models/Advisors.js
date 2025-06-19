import mongoose from "mongoose";

const AdvisorySchema = new mongoose.Schema({
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
//   validityDate: { 
//     type: Date, 
//     required: true, 
//     default: () => {
//       const today = new Date();
//       today.setFullYear(today.getFullYear() + 1);
//       return today;
//     }
//   },
//   isValid: Boolean,
});

// Export the model as a default export
const Member = mongoose.model("AdvisoryPanel", AdvisorySchema);
export default Member;
