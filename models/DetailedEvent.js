const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mainImage: { type: String, required: false },
  galleryImages: { type: [String], required: true },
  date: { type: String, required: true },        // e.g., "2025-04-20"
  time: { type: String, required: true },        // e.g., "14:30"
  dateTime: { type: Date, required: true },      // combined for sorting
  createdAt: { type: Date, default: Date.now },
});
