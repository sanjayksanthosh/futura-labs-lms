const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (config.env === 'production') {
      logger.warn('Running without database — API calls will fail');
      return null;
    }
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB Disconnected');
};

module.exports = { connectDB, disconnectDB };
