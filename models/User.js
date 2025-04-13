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
});

const User = mongoose.model("User", UserSchema);
export default User;
