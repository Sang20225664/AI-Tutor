const express = require('express');
const router = express.Router();
const Quiz = require('../models/quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Lesson = require('../models/lesson');
const { updateProgress } = require('../controllers/progressController');
const auth = require('../middleware/userMiddleware');
const logger = require('../config/logger');
const { ok, created, validationError, notFound, serverError } = require('../utils/response');
const validateQuizSubmit = require('../middleware/validateQuizSubmit');

// GET all quizzes
router.get('/', async (req, res, next) => {
    try {
        const { subjectId, subjectName, grade, difficulty } = req.query;

        let query = {};
        if (subjectId) query.subjectId = subjectId;
        if (subjectName) query.subjectName = subjectName;
        if (grade) query.grade = { $in: [parseInt(grade)] };
        if (difficulty) query.difficulty = difficulty;

        const quizzes = await Quiz.find(query)
            .populate('subjectId', 'name icon color')
            .sort({ createdAt: -1 });

        ok(res, { quizzes, count: quizzes.length });
    } catch (error) {
        next(error);
    }
});

// GET quiz by ID
router.get('/:id', async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('subjectId', 'name icon color description');

        if (!quiz) return notFound(res, 'Quiz');

        ok(res, quiz);
    } catch (error) {
        next(error);
    }
});

// POST create new quiz (admin)
router.post('/', auth, async (req, res, next) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        created(res, quiz, 'Quiz created successfully');
    } catch (error) {
        next(error);
    }
});

// PUT update quiz (admin)
router.put('/:id', auth, async (req, res, next) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!quiz) return notFound(res, 'Quiz');

        ok(res, quiz, 'Quiz updated successfully');
    } catch (error) {
        next(error);
    }
});

// DELETE quiz (admin)
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);

        if (!quiz) return notFound(res, 'Quiz');

        ok(res, null, 'Quiz deleted successfully');
    } catch (error) {
        next(error);
    }
});

// ========================================
// PHASE 2: QUIZ SUBMISSION & PROGRESS TRACKING
// ========================================

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

        // Fetch quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return notFound(res, 'Quiz');

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
        const lesson = await Lesson.findOne({ title: lessonTitle, subjectName: quiz.subjectName });

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
