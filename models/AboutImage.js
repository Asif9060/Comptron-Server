import mongoose from "mongoose";

const AboutImageSchema = new mongoose.Schema({
    imageUrl: String,
    title: String,
    description: String,
});

export default mongoose.model("AboutImage", AboutImageSchema);