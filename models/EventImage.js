import mongoose from "mongoose";

const eventImageSchema = new mongoose.Schema({
    imageUrl: String, // Store the URL of the image
    title: String, // Optional title
    description: String, // Optional description
});

export default mongoose.model("RecentImage", eventImageSchema);
