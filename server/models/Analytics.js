const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['student', 'course', 'mentor', 'institute', 'system', 'attendance', 'assignment', 'quiz'],
      required: true,
    },
    reference: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'referenceModel' },
    referenceModel: {
      type: String,
      enum: ['User', 'Course', 'Mentor', 'Institute', 'Batch'],
      required: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'daily',
    },
    date: { type: Date, default: Date.now },
    metrics: {
      totalStudents: { type: Number, default: 0 },
      activeStudents: { type: Number, default: 0 },
      newEnrollments: { type: Number, default: 0 },
      totalCourses: { type: Number, default: 0 },
      completedCourses: { type: Number, default: 0 },
      totalLessons: { type: Number, default: 0 },
      completedLessons: { type: Number, default: 0 },
      totalAssignments: { type: Number, default: 0 },
      submittedAssignments: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      totalQuizzes: { type: Number, default: 0 },
      completedQuizzes: { type: Number, default: 0 },
      averageQuizScore: { type: Number, default: 0 },
      attendanceRate: { type: Number, default: 0 },
      totalAttendance: { type: Number, default: 0 },
      presentDays: { type: Number, default: 0 },
      certificatesIssued: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
      dropoutRate: { type: Number, default: 0 },
    },
    topPerformers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        score: Number,
      },
    ],
    dailyData: [
      {
        date: Date,
        value: Number,
        label: String,
      },
    ],
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

analyticsSchema.index({ type: 1, reference: 1, period: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
