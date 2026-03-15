const adaptiveGenerator = require('../services/adaptive.generator');
const contentGenerator = require('../services/content.generator');
const logger = require('../config/logger');

/**
 * POST /api/v1/ai/adaptive-quiz
 * Body: { difficulty?, questionCount? }
 * Uses x-user-id from JWT auth to fetch weak topics
 */
const generateAdaptiveQuiz = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { difficulty, questionCount } = req.body;
        const count = Math.min(Math.max(parseInt(questionCount) || 5, 1), 20);
        const diff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
        const requestId = req.headers['x-request-id'];

        const result = await adaptiveGenerator.generateAdaptiveQuiz({
            userId,
            difficulty: diff,
            questionCount: count
        }, requestId);

        res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error(`Adaptive quiz generation failed: ${error.message}`);
        const statusCode = error.message.includes('No weak topics') ? 200 : 500;
        res.status(statusCode).json({
            success: statusCode === 200,
            message: error.message,
            data: statusCode === 200 ? [] : undefined
        });
    }
};

/**
 * POST /api/v1/ai/generate-flashcards
 * Body: { lessonId, count? }
 */
const generateFlashcards = async (req, res) => {
    try {
        const { lessonId, count } = req.body;

        if (!lessonId) {
            return res.status(400).json({ success: false, message: 'lessonId is required' });
        }

        const cardCount = Math.min(Math.max(parseInt(count) || 10, 3), 20);
        const requestId = req.headers['x-request-id'];

        const result = await contentGenerator.generateFlashcards(lessonId, cardCount, requestId);

        res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error(`Flashcard generation failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Flashcard generation failed',
            detail: error.message
        });
    }
};

/**
 * POST /api/v1/ai/summarize
 * Body: { lessonId }
 */
const summarizeLesson = async (req, res) => {
    try {
        const { lessonId } = req.body;

        if (!lessonId) {
            return res.status(400).json({ success: false, message: 'lessonId is required' });
        }

        const requestId = req.headers['x-request-id'];
        const result = await contentGenerator.generateSummary(lessonId, requestId);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error(`Summary generation failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Summary generation failed',
            detail: error.message
        });
    }
};

module.exports = { generateAdaptiveQuiz, generateFlashcards, summarizeLesson };
