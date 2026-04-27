const { Queue } = require("bullmq");
const { buildRedisConnection } = require('./redisConnection');

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const jobAttempts = toPositiveInt(process.env.AI_JOB_ATTEMPTS, 3);
const backoffDelay = toPositiveInt(process.env.AI_JOB_BACKOFF_DELAY_MS, 2000);
const removeOnComplete = toPositiveInt(process.env.AI_JOB_REMOVE_ON_COMPLETE, 200);
const removeOnFail = toPositiveInt(process.env.AI_JOB_REMOVE_ON_FAIL, 500);
const backoffType = process.env.AI_JOB_BACKOFF_TYPE === 'fixed' ? 'fixed' : 'exponential';

const aiQueue = new Queue("ai-jobs", {
  connection: buildRedisConnection(),
  defaultJobOptions: {
    attempts: jobAttempts,
    backoff: {
      type: backoffType,
      delay: backoffDelay,
    },
    removeOnComplete,
    removeOnFail,
  }
});

module.exports = aiQueue;
