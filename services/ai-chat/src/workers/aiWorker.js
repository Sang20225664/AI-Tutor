require('dotenv').config();
const { Worker, Queue } = require('bullmq');
const mongoose = require('mongoose');
const { buildRedisConnection } = require('../config/redisConnection');

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Wait for mongoose connection before processing jobs
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_chat_db', {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log('Worker MongoDB Connected'))
  .catch(err => console.error('Worker MongoDB Connection Error:', err));

// Important Generators
const { generateAdaptiveQuiz } = require('../services/adaptive.generator');
const { generateFlashcards, generateSummary } = require('../services/content.generator');
const { generateLessonSuggestions } = require('../services/suggestion.generator');
const quizGenerator = require('../services/quiz.generator');

const connection = buildRedisConnection();
const workerConcurrency = toPositiveInt(process.env.AI_WORKER_CONCURRENCY, 2);
const deadLetterQueueName = process.env.AI_DLQ_NAME || 'ai-jobs-dlq';
const dlqRetention = toPositiveInt(process.env.AI_DLQ_RETENTION, 2000);

const deadLetterQueue = new Queue(deadLetterQueueName, {
  connection,
  defaultJobOptions: {
    removeOnComplete: toPositiveInt(process.env.AI_DLQ_REMOVE_ON_COMPLETE, 200),
    removeOnFail: dlqRetention,
  }
});

const worker = new Worker('ai-jobs', async (job) => {
  console.log(`[Worker] Started processing job ${job.id} of type: ${job.name}`);

  switch (job.name) {
    case 'adaptiveQuiz':
      return await generateAdaptiveQuiz(job.data.userId, job.data.requestId);

    case 'generateFlashcards':
      return await generateFlashcards(job.data.lessonId, job.data.count, job.data.requestId);

    case 'summarizeLesson':
      return await generateSummary(job.data.lessonId, job.data.requestId);

    case 'suggestLessons':
      return await generateLessonSuggestions(job.data.userId, job.data.grade, job.data.requestId);

    case 'generateQuiz':
      return await quizGenerator.generateQuiz({
        lessonId: job.data.lessonId,
        difficulty: job.data.difficulty,
        questionCount: job.data.questionCount
      }, job.data.requestId);

    default:
      throw new Error(`Unknown job type: ${job.name}`);
  }
}, {
  connection,
  concurrency: workerConcurrency,
});

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', async (job, err) => {
  if (!job) {
    console.log(`[Worker] Job failed before payload available: ${err.message}`);
    return;
  }

  const attempts = Number(job.opts?.attempts || 1);
  const attemptsMade = Number(job.attemptsMade || 0);
  const isFinalFailure = attemptsMade >= attempts;

  console.log(`[Worker] Job ${job.id} failed with error: ${err.message} (attempt ${attemptsMade}/${attempts})`);

  if (!isFinalFailure) {
    return;
  }

  try {
    await deadLetterQueue.add('failed-job', {
      originalQueue: 'ai-jobs',
      originalJobId: job.id,
      originalJobName: job.name,
      originalJobData: job.data,
      attempts,
      attemptsMade,
      failedReason: err.message,
      stacktrace: err.stack,
      failedAt: new Date().toISOString(),
    }, {
      removeOnComplete: true,
      removeOnFail: dlqRetention,
    });

    console.log(`[Worker] Job ${job.id} moved to DLQ '${deadLetterQueueName}' after final failure`);
  } catch (dlqError) {
    console.error(`[Worker] Failed to move job ${job.id} to DLQ: ${dlqError.message}`);
  }
});

console.log('[Worker] AI Job Worker started, waiting for jobs...');
