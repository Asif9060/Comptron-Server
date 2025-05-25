import mongoose from "mongoose";

const formFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["text", "email", "tel", "number", "select", "checkbox", "textarea"],
  },
  required: { type: Boolean, default: false },
  options: [String], // For dropdown/select fields
  validations: {
    minLength: Number,
    maxLength: Number,
    pattern: String,
    customMessage: String,
  },
  order: { type: Number, required: true },
});

const defaultFields = [
  {
    label: "Name",
    type: "text",
    required: true,
    order: 1,
  },
  {
    label: "Email",
    type: "email",
    required: true,
    order: 2,
  },
  {
    label: "Phone",
    type: "tel",
    required: true,
    order: 3,
  },
  {
    label: "University",
    type: "text",
    required: true,
    order: 4,
  },
  {
    label: "Department",
    type: "text",
    required: true,
    order: 5,
  },
  {
    label: "Current Year/Semester",
    type: "text",
    required: true,
    order: 6,
  },
  {
    label: "Student ID",
    type: "text",
    required: true,
    order: 7,
  },
];

export { formFieldSchema, defaultFields };
