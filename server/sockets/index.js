const Notification = require('../models/Notification');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room`);
    });

    socket.on('join-course', (courseId) => {
      socket.join(`course:${courseId}`);
    });

    socket.on('join-batch', (batchId) => {
      socket.join(`batch:${batchId}`);
    });

    socket.on('attendance-update', (data) => {
      io.to(`batch:${data.batchId}`).emit('attendance-marked', data);
    });

    socket.on('assignment-submitted', (data) => {
      io.to(`user:${data.mentorId}`).emit('new-submission', data);
    });

    socket.on('new-notification', async (data) => {
      try {
        const notification = await Notification.create({
          recipient: data.recipientId,
          type: data.type || 'system',
          title: data.title,
          message: data.message,
          link: data.link || '',
          sentBy: data.senderId,
        });
        io.to(`user:${data.recipientId}`).emit('notification', notification);
      } catch (err) {
        console.error('Socket notification error:', err.message);
      }
    });

    socket.on('announcement', (data) => {
      io.to(`batch:${data.batchId}`).emit('announcement', data);
    });

    socket.on('progress-update', (data) => {
      io.to(`user:${data.studentId}`).emit('progress', data);
    });

    socket.on('typing', (data) => {
      socket.to(`course:${data.courseId}`).emit('user-typing', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
