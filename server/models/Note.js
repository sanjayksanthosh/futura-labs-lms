const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Note title is required'], trim: true },
    content: { type: String, required: [true, 'Note content is required'] },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    topic: { type: String, default: '' },
    tags: [String],
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

noteSchema.index({ course: 1, module: 1 });
noteSchema.index({ course: 1, topic: 1 });

module.exports = mongoose.model('Note', noteSchema);
