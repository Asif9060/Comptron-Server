import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
});

export default mongoose.model("EventGallery", EventSchema);
