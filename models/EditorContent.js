const mongoose = require('mongoose');

const editorContentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      enum: ['json', 'html'],
      default: 'json',
    },
    title: {
      type: String,
      default: 'Untitled',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EditorContent', editorContentSchema);