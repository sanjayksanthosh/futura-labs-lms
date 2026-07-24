const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/AppError');

exports.getNotifications = async (req, res, next) => {
  try {
    const { isRead, limit = 50 } = req.query;
    const filter = { recipient: req.userId };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) return next(new AppError('Notification not found', 404));
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.sendNotification = async (req, res, next) => {
  try {
    const { recipients, sendToAll, type, title, message, link } = req.body;

    let recipientIds = recipients || [];
    if (sendToAll) {
      const users = await User.find({}, '_id');
      recipientIds = users.map((u) => u._id);
    }

    if (recipientIds.length === 0) {
      return next(new AppError('No recipients specified', 400));
    }

    const notifications = recipientIds.map((recipientId) => ({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      sentBy: req.userId,
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${recipientIds.length} users`,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId,
    });
    if (!notification) return next(new AppError('Notification not found', 404));
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
