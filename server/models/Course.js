const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Course title is required'], trim: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, maxlength: 200 },
    thumbnail: { type: String, default: '' },
    category: { type: String, trim: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'all'], default: 'beginner' },
    duration: { type: String, default: '' },
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [String],
    prerequisites: [String],
    learningObjectives: [String],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalLessons: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

courseSchema.pre('save', function (next) {
  this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

courseSchema.index({ status: 1, category: 1 });
courseSchema.index({ mentor: 1 });
courseSchema.index({ institute: 1 });

module.exports = mongoose.model('Course', courseSchema);
