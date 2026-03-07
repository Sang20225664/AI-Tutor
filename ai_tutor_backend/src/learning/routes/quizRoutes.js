const express = require('express');
const router = express.Router();
const axios = require('axios');
const QuizAttempt = require('../../assessment/models/QuizAttempt');
const { updateProgress } = require('../../assessment/controllers/progressController');
const auth = require('../../shared/middleware/auth');
const logger = require('../../shared/config/logger');
const { ok, created, validationError, notFound, serverError } = require('../../shared/utils/response');
const validateQuizSubmit = require('../../shared/middleware/validateQuizSubmit');

const LEARNING_URL = process.env.LEARNING_SERVICE_URL || 'http://learning:3002';



/**
 * POST /api/quizzes/:id/submit
 * Body: { answers: [{ questionIndex: 0, selectedAnswer: 2 }, ...], timeSpent: 180 }
 */
router.post('/:id/submit', auth, validateQuizSubmit, async (req, res, next) => {
    try {
        const quizId = req.params.id;
        const userId = req.user.userId;
        const { answers, timeSpent = 0 } = req.body;

        // Basic validation already handled by validateQuizSubmit middleware

        // Fetch quiz from Learning Service
        let quiz;
        try {
            const quizResponse = await axios.get(`${LEARNING_URL}/internal/quizzes/${quizId}`);
            if (!quizResponse.data.found) return notFound(res, 'Quiz');
            quiz = quizResponse.data.quiz;
        } catch (err) {
            console.error('Failed to fetch quiz from learning service:', err.message);
            return notFound(res, 'Quiz');
        }

        // Calculate score
        const totalQuestions = quiz.questions.length;
        let correctCount = 0;
        const detailedAnswers = [];

        answers.forEach(userAnswer => {
            const { questionIndex, selectedAnswer } = userAnswer;

            if (questionIndex < 0 || questionIndex >= totalQuestions) return; // skip invalid

            const question = quiz.questions[questionIndex];
            const isCorrect = question.answer === selectedAnswer;

            if (isCorrect) correctCount++;

            detailedAnswers.push({
                questionIndex,
                selectedAnswer,
                isCorrect,
                correctAnswer: question.answer
            });
        });

        const score = Math.round((correctCount / totalQuestions) * 100);

        // Create QuizAttempt record
        const quizAttempt = new QuizAttempt({
            userId,
            quizId,
            answers: detailedAnswers.map(a => ({
                questionIndex: a.questionIndex,
                selectedAnswer: a.selectedAnswer,
                isCorrect: a.isCorrect
            })),
            score,
            timeSpent
        });
        await quizAttempt.save();

        logger.info('QuizAttempt created', {
            requestId: req.requestId,
            userId,
            quizId,
            score,
            attemptId: quizAttempt._id
        });

        // Find associated lesson (quiz title has "Quiz: " prefix)
        const lessonTitle = quiz.title.replace(/^Quiz:\s*/, '');
        let lesson = null;
        try {
            const lessonsResponse = await axios.get(`${LEARNING_URL}/api/v1/lessons`, {
                params: { subjectName: quiz.subjectName }
            });
            const lessons = lessonsResponse.data.data || [];
            lesson = lessons.find(l => l.title === lessonTitle);
        } catch (err) {
            console.error('Failed to fetch lessons from learning service:', err.message);
        }

        if (lesson) {
            await updateProgress(userId, lesson._id, score);
            logger.info('Progress updated after quiz', {
                requestId: req.requestId,
                userId,
                lessonId: lesson._id,
                score
            });
        } else {
            logger.warn('No matching lesson found for quiz', {
                requestId: req.requestId,
                quizTitle: quiz.title,
                searchedTitle: lessonTitle
            });
        }

        ok(res, {
            attemptId: quizAttempt._id,
            score,
            correctCount,
            totalQuestions,
            detailedAnswers,
            message: score >= 70 ? 'Excellent! You passed!' :
                score >= 50 ? 'Good effort! Keep practicing.' :
                    'Keep studying and try again!'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
