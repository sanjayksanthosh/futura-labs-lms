const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Batch name is required'], trim: true },
    code: { type: String, unique: true, trim: true },
    description: { type: String, default: '' },
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxStudents: { type: Number, default: 50 },
    startDate: { type: Date },
    endDate: { type: Date },
    schedule: {
      days: [String],
      startTime: String,
      endTime: String,
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

batchSchema.pre('save', function (next) {
  if (!this.code) {
    this.code = `BATCH-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Batch', batchSchema);
