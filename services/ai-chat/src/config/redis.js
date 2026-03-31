const Redis = require("ioredis");
const { buildRedisConnection } = require('./redisConnection');

const redis = new Redis({
  ...buildRedisConnection(),
  maxRetriesPerRequest: null
});

module.exports = redis;
