import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  skills: String,
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

const User = mongoose.model("User", UserSchema);
export default User;
