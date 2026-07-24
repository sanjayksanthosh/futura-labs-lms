require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config');
const { connectDB } = require('./database/connection');
const { connectRedis } = require('./config/redis');
const { connectCloudinary } = require('./config/cloudinary');
const setupSocket = require('./sockets');
const logger = require('./utils/logger');

let server;

const autoSeed = async () => {
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      logger.info('Empty database detected — running seed...');
      await require('./database/seed.inline');
      logger.info('Auto-seed complete');
    } else {
      logger.info(`Database has ${count} users — skipping seed`);
    }
  } catch (err) {
    logger.warn('Auto-seed skipped:', err.message);
  }
};

const startServer = async () => {
  try {
    await connectDB();

    await autoSeed();

    if (config.env !== 'test') {
      await connectRedis();
      connectCloudinary();
    }

    server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
      },
    });

    setupSocket(io);

    server.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
      logger.info(`API: http://localhost:${config.port}/api/v1`);
      if (config.env !== 'production') {
        logger.info(`Docs: http://localhost:${config.port}/api-docs`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  }
  setTimeout(() => process.exit(1), 10000);
};

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err.message, err.stack);
  gracefulShutdown();
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message, err.stack);
  gracefulShutdown();
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = { app, server };
