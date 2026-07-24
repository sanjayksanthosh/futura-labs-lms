const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Institute name is required'], trim: true },
    email: { type: String, required: [true, 'Institute email is required'], lowercase: true },
    phone: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    logo: { type: String, default: '' },
    website: String,
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
      status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
      startsAt: Date,
      endsAt: Date,
    },
    settings: {
      allowStudentRegistration: { type: Boolean, default: true },
      maxStudents: { type: Number, default: 1000 },
      maxMentors: { type: Number, default: 50 },
      defaultLanguage: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

instituteSchema.virtual('studentCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'institute',
  match: { role: 'student' },
  count: true,
});

instituteSchema.virtual('mentorCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'institute',
  match: { role: 'mentor' },
  count: true,
});

instituteSchema.virtual('courseCount', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'institute',
  count: true,
});

module.exports = mongoose.model('Institute', instituteSchema);
