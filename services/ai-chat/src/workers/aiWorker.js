require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { buildRedisConnection } = require('../config/redisConnection');

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
}, { connection });

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.log(`[Worker] Job ${job.id} failed with error: ${err.message}`);
});

console.log('[Worker] AI Job Worker started, waiting for jobs...');
