import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.model("EventGallery", EventSchema);
