const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    totalLessons: { type: Number, default: 0 },
    completedAssignments: { type: Number, default: 0 },
    totalAssignments: { type: Number, default: 0 },
    completedQuizzes: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 },
    overallPercentage: { type: Number, default: 0 },
    lastAccessed: Date,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    timeSpent: { type: Number, default: 0 },
    watchHistory: [
      {
        lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        watchedAt: Date,
        duration: Number,
        completed: Boolean,
      },
    ],
  },
  { timestamps: true }
);

progressSchema.index({ student: 1, course: 1 }, { unique: true });
progressSchema.index({ student: 1 });
progressSchema.index({ course: 1 });

module.exports = mongoose.model('Progress', progressSchema);
