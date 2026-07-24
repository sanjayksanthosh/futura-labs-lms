const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Assignment title is required'], trim: true },
    description: { type: String, default: '' },
    instructions: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    type: {
      type: String,
      enum: ['text', 'file_upload', 'quiz', 'coding', 'presentation'],
      default: 'file_upload',
    },
    totalPoints: { type: Number, default: 100 },
    passingPoints: { type: Number, default: 40 },
    dueDate: { type: Date, required: true },
    attachments: [
      {
        title: String,
        url: String,
        type: String,
      },
    ],
    isPublished: { type: Boolean, default: true },
    allowLateSubmission: { type: Boolean, default: false },
    lateSubmissionPenalty: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 1 },
    rubric: [
      {
        criterion: String,
        points: Number,
        description: String,
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

assignmentSchema.virtual('submissionCount', {
  ref: 'AssignmentSubmission',
  localField: '_id',
  foreignField: 'assignment',
  count: true,
});

assignmentSchema.virtual('averageScore', {
  ref: 'AssignmentSubmission',
  localField: '_id',
  foreignField: 'assignment',
  options: { select: 'score' },
});

module.exports = mongoose.model('Assignment', assignmentSchema);
