import mongoose from "mongoose";  // Use import for ES modules

const memberSchema = new mongoose.Schema({
  name: String,
  role: String,
  //email: String,
  image: String, // URL or base64
  // bio: String,
  socials: {
    github: String,
    linkedin: String
  }
});

// Export the model as a default export
const Member = mongoose.model("Member", memberSchema);
export default Member;
