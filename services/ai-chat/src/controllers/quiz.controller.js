const { QueueEvents } = require('bullmq');
const aiQueue = require('../config/queue');
const logger = require('../config/logger');

const queueEvents = new QueueEvents('ai-jobs', {
    connection: {
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
    }
});

/**
 * POST /api/v1/ai/generate-quiz
 * Body: { lessonId, difficulty?, questionCount? }
 */
const generateQuiz = async (req, res) => {
    try {
        const { lessonId, difficulty, questionCount } = req.body;

        if (!lessonId) {
            return res.status(400).json({
                success: false,
                message: 'lessonId is required'
            });
        }

        // Validate questionCount range
        const count = Math.min(Math.max(parseInt(questionCount) || 5, 1), 20);
        const diff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';

        const requestId = req.headers['x-request-id'];

        const job = await aiQueue.add('generateQuiz', {
            lessonId,
            difficulty: diff,
            questionCount: count,
            requestId
        });

        const quiz = await job.waitUntilFinished(queueEvents);

        res.status(201).json({
            success: true,
            data: quiz
        });

    } catch (error) {
        logger.error(`Quiz generation failed: ${error.message}`, req);
        res.status(500).json({
            success: false,
            message: 'Quiz generation failed',
            detail: error.message
        });
    }
};

module.exports = { generateQuiz };
