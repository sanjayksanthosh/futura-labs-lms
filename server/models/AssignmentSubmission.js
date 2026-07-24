const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    files: [
      {
        title: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    textSubmission: { type: String, default: '' },
    score: { type: Number, default: null },
    maxScore: { type: Number, default: null },
    percentage: { type: Number, default: null },
    grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F', 'pending'], default: 'pending' },
    feedback: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'graded', 'returned', 'late'],
      default: 'submitted',
    },
    attemptNumber: { type: Number, default: 1 },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gradedAt: Date,
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
    aiFeedback: { type: String, default: '' },
    aiScore: { type: Number, default: null },
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1, course: 1 });

module.exports = mongoose.model('AssignmentSubmission', submissionSchema);
