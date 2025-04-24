import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  durationDays: { type: Number, default: 1 },
  dateTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  mainImage: { type: String },
  galleryImages: { type: [String], default: [] },
});

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
