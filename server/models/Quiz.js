const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer', 'fill_blank', 'multiple_select'],
    default: 'mcq',
  },
  options: [String],
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  points: { type: Number, default: 1 },
  explanation: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Quiz title is required'], trim: true },
    description: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [questionSchema],
    timeLimit: { type: Number, default: 30 },
    passingScore: { type: Number, default: 40 },
    maxAttempts: { type: Number, default: 3 },
    shuffleQuestions: { type: Boolean, default: false },
    showResults: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: true },
    dueDate: Date,
    totalPoints: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

quizSchema.pre('save', function (next) {
  this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
