const quizService = require('../services/quizService');

const quizController = {
    async getAll(req, res) {
        try {
            const quizzes = await quizService.getAll(req.query);
            res.json({ success: true, data: quizzes, count: quizzes.length });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getById(req, res) {
        try {
            const quiz = await quizService.getById(req.params.id);
            if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
            res.json({ success: true, data: quiz });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Internal endpoint — Assessment service calls this to get quiz for scoring
    async getByIdInternal(req, res) {
        try {
            const quiz = await quizService.getById(req.params.id);
            if (!quiz) return res.status(404).json({ found: false });

            // Return minimal data for Assessment scoring
            const minimalQuiz = {
                _id: quiz._id,
                title: quiz.title,
                subjectName: quiz.subjectName,
                questions: quiz.questions.map(q => ({
                    answer: q.answer
                }))
            };

            res.json({ found: true, quiz: minimalQuiz });
        } catch (err) {
            res.status(500).json({ found: false, message: err.message });
        }
    },

    // Internal endpoint — AI service calls this to save generated quizzes
    async createQuiz(req, res) {
        try {
            const Quiz = require('../models/Quiz');
            const quiz = new Quiz(req.body);
            await quiz.save();
            res.status(201).json({ success: true, data: quiz });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = quizController;
