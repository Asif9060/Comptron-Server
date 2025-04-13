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
});

const User = mongoose.model("User", UserSchema);
export default User;
