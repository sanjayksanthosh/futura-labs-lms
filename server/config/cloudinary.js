const cloudinary = require('cloudinary').v2;
const config = require('./index');
const logger = require('../utils/logger');

const connectCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
    logger.info('Cloudinary Connected');
  } catch (error) {
    logger.error('Cloudinary Connection Error:', error.message);
  }
};

module.exports = { connectCloudinary, cloudinary };
