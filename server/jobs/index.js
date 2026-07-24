const cron = require('node-cron');
const logger = require('../utils/logger');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');

const setupJobs = () => {
  // Daily attendance cleanup - run at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running daily attendance cleanup job');
    try {
      // Auto-mark absent for students without attendance on weekdays
      logger.info('Attendance cleanup completed');
    } catch (error) {
      logger.error('Attendance cleanup failed:', error.message);
    }
  });

  // Weekly analytics aggregation - run every Sunday at 1 AM
  cron.schedule('0 1 * * 0', async () => {
    logger.info('Running weekly analytics aggregation');
    try {
      // Analytics aggregation logic here
      logger.info('Analytics aggregation completed');
    } catch (error) {
      logger.error('Analytics aggregation failed:', error.message);
    }
  });

  // Monthly certificate expiration check - run on 1st of month
  cron.schedule('0 2 1 * *', async () => {
    logger.info('Running monthly certificate check');
    try {
      logger.info('Certificate check completed');
    } catch (error) {
      logger.error('Certificate check failed:', error.message);
    }
  });

  logger.info('Cron jobs initialized');
};

module.exports = setupJobs;
