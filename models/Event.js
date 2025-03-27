import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventDate: { type: String, required: true },
});

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
