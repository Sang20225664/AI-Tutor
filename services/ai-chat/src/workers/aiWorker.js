require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');

// Wait for mongoose connection before processing jobs
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Worker MongoDB Connected'))
  .catch(err => console.error('Worker MongoDB Connection Error:', err));

// Important Generators
const { generateAdaptiveQuiz } = require('../services/adaptive.generator');
const { generateFlashcards, generateSummary } = require('../services/content.generator');
const quizGenerator = require('../services/quiz.generator');

const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker('ai-jobs', async (job) => {
  console.log(`[Worker] Started processing job ${job.id} of type: ${job.name}`);
  
  switch (job.name) {
    case 'adaptiveQuiz':
      return await generateAdaptiveQuiz(job.data.userId, job.data.requestId);

    case 'generateFlashcards':
      return await generateFlashcards(job.data.lessonId, job.data.count, job.data.requestId);

    case 'summarizeLesson':
      return await generateSummary(job.data.lessonId, job.data.requestId);

    case 'generateQuiz':
      return await quizGenerator.generateQuiz({
          lessonId: job.data.lessonId,
          difficulty: job.data.difficulty,
          questionCount: job.data.questionCount
      }, job.data.requestId);

    default:
      throw new Error(`Unknown job type: ${job.name}`);
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.log(`[Worker] Job ${job.id} failed with error: ${err.message}`);
});

console.log('[Worker] AI Job Worker started, waiting for jobs...');
