const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Lesson title is required'], trim: true },
    description: { type: String, default: '' },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Number, default: 0 },
    contentType: {
      type: String,
      enum: ['video', 'pdf', 'document', 'quiz', 'assignment', 'audio', 'image', 'text'],
      default: 'video',
    },
    content: {
      videoUrl: { type: String, default: '' },
      videoDuration: { type: Number, default: 0 },
      pdfUrl: { type: String, default: '' },
      documentUrl: { type: String, default: '' },
      textContent: { type: String, default: '' },
      audioUrl: { type: String, default: '' },
      externalLinks: [{ title: String, url: String }],
    },
    resources: [
      {
        title: String,
        type: { type: String, enum: ['pdf', 'doc', 'image', 'video', 'link', 'other'] },
        url: String,
        size: Number,
      },
    ],
    isFree: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    duration: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
