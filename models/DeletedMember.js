import mongoose from "mongoose";

const DeletedMemberSchema = new mongoose.Schema({
    name: String,
    role: String,
    email: String,
    bio: String,
    socials: Object,
    image: String,
    deletedAt: { type: Date, default: (Date.now() + 6 * 60 * 60 * 1000) } // Store deletion time
});

const DeletedMember = mongoose.model("DeletedMember", DeletedMemberSchema);

export default DeletedMember;
