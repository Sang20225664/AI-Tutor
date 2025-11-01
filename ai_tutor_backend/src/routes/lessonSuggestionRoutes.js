const express = require('express');
const router = express.Router();
const LessonSuggestion = require('../models/lessonSuggestion');

// GET all lesson suggestions (filtered by grade - REQUIRED)
router.get('/', async (req, res) => {
    try {
        const { grade, subjectId, subjectName, difficulty } = req.query;

        // Grade is REQUIRED to prevent other grades from seeing grade 5 data
        if (!grade) {
            return res.status(400).json({
                success: false,
                message: 'Grade parameter is required'
            });
        }

        let query = { grade: parseInt(grade) };
        if (subjectId) query.subjectId = subjectId;
        if (subjectName) query.subjectName = subjectName;
        if (difficulty) query.difficulty = difficulty;

        const suggestions = await LessonSuggestion.find(query)
            .populate('subjectId', 'name icon color')
            .populate('lessonIds', 'title description')
            .sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            data: suggestions,
            count: suggestions.length,
            grade: parseInt(grade)
        });
    } catch (error) {
        console.error('Error fetching lesson suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lesson suggestions',
            error: error.message
        });
    }
});

// GET suggestion by ID
router.get('/:id', async (req, res) => {
    try {
        const suggestion = await LessonSuggestion.findById(req.params.id)
            .populate('subjectId', 'name icon color description')
            .populate('lessonIds');

        if (!suggestion) {
            return res.status(404).json({
                success: false,
                message: 'Lesson suggestion not found'
            });
        }

        res.json({
            success: true,
            data: suggestion
        });
    } catch (error) {
        console.error('Error fetching lesson suggestion:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lesson suggestion',
            error: error.message
        });
    }
});

module.exports = router;
