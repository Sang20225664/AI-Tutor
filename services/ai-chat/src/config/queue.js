const { Queue } = require("bullmq");
const { buildRedisConnection } = require('./redisConnection');

const aiQueue = new Queue("ai-jobs", {
  connection: buildRedisConnection()
});

module.exports = aiQueue;
