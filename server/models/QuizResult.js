const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  question: String,
  selectedAnswer: mongoose.Schema.Types.Mixed,
  correctAnswer: mongoose.Schema.Types.Mixed,
  isCorrect: Boolean,
  points: Number,
  pointsEarned: Number,
});

const quizResultSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    answers: [answerSchema],
    totalPoints: { type: Number, default: 0 },
    earnedPoints: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    isPassed: { type: Boolean, default: false },
    attemptNumber: { type: Number, default: 1 },
    timeTaken: { type: Number, default: 0 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'completed' },
  },
  { timestamps: true }
);

quizResultSchema.index({ quiz: 1, student: 1 });
quizResultSchema.index({ student: 1, course: 1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
