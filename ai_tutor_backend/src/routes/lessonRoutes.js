const express = require('express');
const router = express.Router();
const Lesson = require('../models/lesson');
const auth = require('../middleware/userMiddleware');

// GET all lessons
// Query params: grade, subjectName, difficulty, topics
router.get('/', async (req, res) => {
    try {
        const { grade, subjectName, difficulty, topics } = req.query;

        // Build query
        const query = {};

        if (grade) {
            // Filter by grade - lesson.grade is an array, so use $in
            query.grade = { $in: [parseInt(grade)] };
        }

        if (subjectName) {
            query.subjectName = subjectName;
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (topics) {
            // Support comma-separated topics
            const topicsArray = topics.split(',').map(t => t.trim());
            query.topics = { $in: topicsArray };
        }

        const lessons = await Lesson.find(query)
            .populate('subjectId', 'name icon color')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: lessons.length,
            data: lessons
        });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lessons',
            error: error.message
        });
    }
});

// GET lesson by ID
router.get('/:id', async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id)
            .populate('subjectId', 'name icon color description');

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        res.json({
            success: true,
            data: lesson
        });
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lesson',
            error: error.message
        });
    }
});

// POST create new lesson
router.post('/', auth, async (req, res) => {
    try {
        const {
            title,
            content,
            subjectId,
            subjectName,
            grade,
            topics,
            difficulty,
            duration
        } = req.body;

        // Validation
        if (!title || !content || !subjectId || !subjectName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, content, subjectId, subjectName'
            });
        }

        const lesson = new Lesson({
            title,
            content,
            subjectId,
            subjectName,
            grade: grade || [],
            topics: topics || [],
            difficulty: difficulty || 'beginner',
            duration: duration || 30
        });

        await lesson.save();

        res.status(201).json({
            success: true,
            message: 'Lesson created successfully',
            data: lesson
        });
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create lesson',
            error: error.message
        });
    }
});

// PUT update lesson
router.put('/:id', auth, async (req, res) => {
    try {
        const {
            title,
            content,
            subjectId,
            subjectName,
            grade,
            topics,
            difficulty,
            duration
        } = req.body;

        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Update fields
        if (title) lesson.title = title;
        if (content) lesson.content = content;
        if (subjectId) lesson.subjectId = subjectId;
        if (subjectName) lesson.subjectName = subjectName;
        if (grade !== undefined) lesson.grade = grade;
        if (topics !== undefined) lesson.topics = topics;
        if (difficulty) lesson.difficulty = difficulty;
        if (duration !== undefined) lesson.duration = duration;

        await lesson.save();

        res.json({
            success: true,
            message: 'Lesson updated successfully',
            data: lesson
        });
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update lesson',
            error: error.message
        });
    }
});

// DELETE lesson
router.delete('/:id', auth, async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndDelete(req.params.id);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        res.json({
            success: true,
            message: 'Lesson deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete lesson',
            error: error.message
        });
    }
});

// GET lessons by subject ID
router.get('/subject/:subjectId', async (req, res) => {
    try {
        const { grade, difficulty } = req.query;

        const query = { subjectId: req.params.subjectId };

        if (grade) {
            query.grade = parseInt(grade);
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        const lessons = await Lesson.find(query)
            .populate('subjectId', 'name icon color')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: lessons.length,
            data: lessons
        });
    } catch (error) {
        console.error('Error fetching lessons by subject:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lessons',
            error: error.message
        });
    }
});

module.exports = router;