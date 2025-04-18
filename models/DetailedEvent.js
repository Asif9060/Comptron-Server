import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mainImage: { type: String, required: false }, // URL of main image
  galleryImages: { type: [String], required: true },
  date: { type: Date,required: true },
   // Array of image URLs
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("EventDetails", eventSchema);
export default Event;
