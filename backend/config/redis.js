const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis client connecting...'));
redisClient.on('ready', () => console.log('Redis client ready!'));

(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
})();

// Graceful shutdown (optional)
process.on('SIGINT', async () => {
  await redisClient.quit();
  process.exit(0);
});

module.exports = redisClient; 