const quizGenerator = require('../services/quiz.generator');
const logger = require('../config/logger');

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

        const quiz = await quizGenerator.generateQuiz({
            lessonId,
            difficulty: diff,
            questionCount: count
        }, requestId);

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
