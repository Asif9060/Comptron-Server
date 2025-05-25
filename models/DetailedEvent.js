import mongoose from "mongoose";
import { formFieldSchema, defaultFields } from "./FormField.js";

const bulletPointSchema = new mongoose.Schema({
  label: { type: String, required: true },
  text: { type: String, required: true },
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  bulletPoints: [bulletPointSchema],
  mainImage: { type: String, required: false }, // URL of main image
  galleryImages: { type: [String], required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  registrationForm: {
    enabled: { type: Boolean, default: false },
    fields: {
      type: [formFieldSchema],
      default: function () {
        return this.registrationForm?.enabled ? defaultFields : [];
      },
    },
  },
});

const Event = mongoose.model("EventDetails", eventSchema);
export default Event;
