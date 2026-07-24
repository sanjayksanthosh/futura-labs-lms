const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateId: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    issuedDate: { type: Date, default: Date.now },
    completionDate: { type: Date },
    grade: { type: String },
    percentage: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revoked'],
      default: 'pending',
    },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    certificateUrl: { type: String, default: '' },
    template: { type: String, default: 'default' },
    metadata: { type: Map, of: String },
    isRevoked: { type: Boolean, default: false },
    revokedAt: Date,
    revokeReason: String,
  },
  { timestamps: true }
);

certificateSchema.pre('save', function (next) {
  if (!this.certificateId) {
    this.certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
  next();
});

certificateSchema.index({ student: 1, course: 1 });


module.exports = mongoose.model('Certificate', certificateSchema);
