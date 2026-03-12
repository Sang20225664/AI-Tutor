const axios = require('axios');
const QuizAttempt = require('../models/QuizAttempt');
const progressController = require('./progressController'); // For updating progress

const LEARNING_SERVICE_URL = process.env.LEARNING_SERVICE_URL || 'http://localhost:3002';

// Simple in-memory cache for quizzes
// Map<quizId, { data: Object, expiresAt: Number }>
const quizCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const attemptController = {
    // Helper to get quiz from cache or Learning Service
    async getQuizForScoring(quizId) {
        const now = Date.now();
        // Check cache
        if (quizCache.has(quizId)) {
            const cached = quizCache.get(quizId);
            if (now < cached.expiresAt) {
                return cached.data;
            } else {
                quizCache.delete(quizId);
            }
        }

        // Fetch from Learning Service with timeout and retry
        const maxRetries = 1;
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await axios.get(`${LEARNING_SERVICE_URL}/internal/quizzes/${quizId}`, {
                    timeout: 3000 // 3 seconds timeout
                });

                if (response.data.found) {
                    const quizData = response.data.quiz;
                    // Save to cache
                    quizCache.set(quizId, {
                        data: quizData,
                        expiresAt: now + CACHE_TTL
                    });
                    return quizData;
                }
                return null; // found: false
            } catch (err) {
                lastError = err;
                console.error(`Attempt ${attempt + 1}: Failed to fetch quiz ${quizId} from Learning Service: ${err.message}`);
                // Small delay before retry
                if (attempt < maxRetries) {
                    await new Promise(res => setTimeout(res, 500));
                }
            }
        }

        throw new Error(`Learning Service unavailable to validate quiz after ${maxRetries + 1} attempts`);
    },

    /**
     * POST /api/v1/attempts/quiz/:id/submit
     * Body: { answers: [{ questionIndex: 0, selectedAnswer: 2 }, ...], timeSpent: 180 }
     */
    async submitQuiz(req, res) {
        try {
            const quizId = req.params.id;
            const userId = req.user.userId; // from JWT
            const { answers, timeSpent = 0 } = req.body;

            if (!answers || !Array.isArray(answers)) {
                return res.status(400).json({ success: false, message: "Invalid answers array" });
            }

            // 1. Fetch Quiz (Cache or API)
            let quiz;
            try {
                quiz = await attemptController.getQuizForScoring(quizId);
            } catch (apiError) {
                return res.status(503).json({ success: false, message: apiError.message });
            }

            if (!quiz) {
                return res.status(404).json({ success: false, message: 'Quiz not found' });
            }

            // 2. Calculate score
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

            // 3. Create QuizAttempt record
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

            console.log(`Quiz scored for user ${userId}: ${score}%`);

            // 4. Update Progress associated with the lesson
            try {
                let lessonId = null;

                // AI-generated quizzes have lessonId directly on the quiz
                if (quiz.lessonId) {
                    lessonId = quiz.lessonId;
                } else {
                    // Seed quizzes: try to find lesson by title matching (legacy)
                    const lessonTitle = quiz.title.replace(/^Quiz:\s*/, '');
                    const lessonsResponse = await axios.get(`${LEARNING_SERVICE_URL}/api/v1/lessons`, {
                        params: { subjectName: quiz.subjectName },
                        timeout: 3000
                    });
                    const lessons = lessonsResponse.data.data || [];
                    const lesson = lessons.find(l => l.title === lessonTitle);
                    if (lesson) lessonId = lesson._id;
                }

                if (lessonId) {
                    await progressController.internalUpdateProgress(userId, lessonId, score);
                } else {
                    console.warn(`No matching lesson found for quiz "${quiz.title}" to update progress`);
                }
            } catch (err) {
                console.error(`Failed to update progress after quiz submission: ${err.message}`);
            }

            res.status(200).json({
                success: true,
                data: {
                    attemptId: quizAttempt._id,
                    score,
                    correctCount,
                    totalQuestions,
                    detailedAnswers,
                    message: score >= 70 ? 'Excellent! You passed!' :
                        score >= 50 ? 'Good effort! Keep practicing.' :
                            'Keep studying and try again!'
                }
            });

        } catch (error) {
            console.error("Quiz submission error:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    /**
     * GET /api/v1/attempts/history
     * Returns user's quiz attempt history (most recent first)
     */
    async getHistory(req, res) {
        try {
            const userId = req.user.userId;
            const limit = Math.min(parseInt(req.query.limit) || 20, 50);

            const attempts = await QuizAttempt.find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();

            res.json({
                success: true,
                data: attempts,
                count: attempts.length
            });
        } catch (error) {
            console.error('getHistory failed:', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch attempt history' });
        }
    }
};

module.exports = attemptController;
