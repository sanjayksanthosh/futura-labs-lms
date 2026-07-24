const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
    company: { type: String, required: true },
    position: { type: String, required: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    duration: { type: String, default: '' },
    type: {
      type: String,
      enum: ['full_time', 'part_time', 'remote', 'hybrid'],
      default: 'full_time',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'active',
    },
    stipend: { type: String, default: '' },
    skills: [String],
    documents: [
      {
        title: String,
        url: String,
        type: String,
      },
    ],
    feedback: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5 },
    completionCertificate: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

internshipSchema.index({ student: 1 });
internshipSchema.index({ status: 1 });

module.exports = mongoose.model('Internship', internshipSchema);
