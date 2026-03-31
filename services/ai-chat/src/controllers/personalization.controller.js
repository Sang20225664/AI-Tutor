const { QueueEvents } = require('bullmq');
const aiQueue = require('../config/queue');
const logger = require('../config/logger');
const AiSuggestion = require('../models/aiSuggestion.model');
const { buildRedisConnection } = require('../config/redisConnection');

const queueEvents = new QueueEvents('ai-jobs', {
    connection: buildRedisConnection()
});

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

        const job = await aiQueue.add('adaptiveQuiz', {
            userId,
            difficulty: diff,
            questionCount: count,
            requestId
        });

        const result = await job.waitUntilFinished(queueEvents);

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

        const job = await aiQueue.add('generateFlashcards', {
            lessonId,
            count: cardCount,
            requestId
        });

        const result = await job.waitUntilFinished(queueEvents);

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

        const job = await aiQueue.add('summarizeLesson', {
            lessonId,
            requestId
        });

        const result = await job.waitUntilFinished(queueEvents);

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

/**
 * POST /api/v1/ai/suggest-lessons
 * Body: { grade }
 * Generates AI suggestions, saves to DB, returns saved documents
 */
const suggestLessons = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { grade } = req.body;
        const targetGrade = parseInt(grade) || 5;
        const requestId = req.headers['x-request-id'];

        const job = await aiQueue.add('suggestLessons', {
            userId,
            grade: targetGrade,
            requestId
        });

        const result = await job.waitUntilFinished(queueEvents);

        // Save each suggestion to MongoDB
        const savedSuggestions = [];
        for (const item of result) {
            const doc = await AiSuggestion.create({
                userId,
                grade: targetGrade,
                title: item.title,
                description: item.description,
                subjectName: item.subjectName || '',
                difficulty: item.difficulty || 'beginner',
                difficultyText: item.difficultyText || 'Cơ bản',
                duration: item.duration || 30,
                icon: item.icon || 'lightbulb',
                backgroundColor: item.backgroundColor || '0xFFE3F2FD',
                topics: item.topics || [],
            });
            savedSuggestions.push(doc);
        }

        res.status(201).json({
            success: true,
            data: savedSuggestions
        });

    } catch (error) {
        logger.error(`Lesson suggestions generated failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to generate recommendations from AI',
            detail: error.message
        });
    }
};

/**
 * GET /api/v1/ai/suggest-lessons
 * Returns all saved AI suggestions for the authenticated user, newest first
 */
const getAiSuggestions = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const suggestions = await AiSuggestion.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({
            success: true,
            data: suggestions
        });

    } catch (error) {
        logger.error(`Failed to fetch AI suggestions: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch AI suggestions',
            detail: error.message
        });
    }
};

module.exports = { generateAdaptiveQuiz, generateFlashcards, summarizeLesson, suggestLessons, getAiSuggestions };
