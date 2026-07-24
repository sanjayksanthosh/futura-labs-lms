const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'assignment',
        'quiz',
        'attendance',
        'course',
        'grade',
        'certificate',
        'announcement',
        'system',
        'message',
        'reminder',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    metadata: { type: Map, of: String },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
