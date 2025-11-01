const express = require('express');
const router = express.Router();
const Quiz = require('../models/quiz');

// GET all quizzes
router.get('/', async (req, res) => {
    try {
        const { subjectId, subjectName, grade, difficulty } = req.query;

        let query = {};
        if (subjectId) query.subjectId = subjectId;
        if (subjectName) query.subjectName = subjectName;
        // Filter by grade - quiz.grade is an array, so use $in
        if (grade) query.grade = { $in: [parseInt(grade)] };
        if (difficulty) query.difficulty = difficulty;

        const quizzes = await Quiz.find(query)
            .populate('subjectId', 'name icon color')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: quizzes,
            count: quizzes.length
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quizzes',
            error: error.message
        });
    }
});

// GET quiz by ID
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('subjectId', 'name icon color description');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.json({
            success: true,
            data: quiz
        });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quiz',
            error: error.message
        });
    }
});

// POST create new quiz (admin)
router.post('/', async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();

        res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz created successfully'
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating quiz',
            error: error.message
        });
    }
});

// PUT update quiz (admin)
router.put('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.json({
            success: true,
            data: quiz,
            message: 'Quiz updated successfully'
        });
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating quiz',
            error: error.message
        });
    }
});

// DELETE quiz (admin)
router.delete('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting quiz',
            error: error.message
        });
    }
});

module.exports = router;
