const redis = require('redis');
const config = require('./index');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: config.redis.url,
      socket: {
        connectTimeout: 3000,
        reconnectStrategy: false,
      },
    });
    redisClient.on('error', () => {}); // suppress retry errors
    redisClient.on('connect', () => logger.info('Redis Connected'));
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.warn('Redis not available. Running without cache.');
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
