const { Queue } = require("bullmq");

const aiQueue = new Queue("ai-jobs", {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
  }
});

module.exports = aiQueue;
