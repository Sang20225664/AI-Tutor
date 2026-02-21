const express = require('express');
const router = express.Router();
const Lesson = require('../models/lesson');
const Progress = require('../models/Progress');
const auth = require('../middleware/userMiddleware');
const logger = require('../config/logger');
const { ok, created, validationError, notFound, serverError } = require('../utils/response');

// GET all lessons
// Query params: grade, subjectName, difficulty, topics
router.get('/', async (req, res, next) => {
    try {
        const { grade, subjectName, difficulty, topics } = req.query;

        const query = {};
        if (grade) query.grade = { $in: [parseInt(grade)] };
        if (subjectName) query.subjectName = subjectName;
        if (difficulty) query.difficulty = difficulty;
        if (topics) {
            const topicsArray = topics.split(',').map(t => t.trim());
            query.topics = { $in: topicsArray };
        }

        const lessons = await Lesson.find(query)
            .populate('subjectId', 'name icon color')
            .sort({ createdAt: -1 });

        ok(res, { lessons, count: lessons.length });
    } catch (error) {
        next(error);
    }
});

// GET lesson by ID
// PHASE 2: Auto-create Progress record on first view
router.get('/:id', async (req, res, next) => {
    try {
        const lesson = await Lesson.findById(req.params.id)
            .populate('subjectId', 'name icon color description');

        if (!lesson) return notFound(res, 'Lesson');

        // PHASE 2: Track progress if user is authenticated
        let progress = null;
        const authHeader = req.header('Authorization');

        if (authHeader) {
            try {
                const jwt = require('jsonwebtoken');
                const token = authHeader.replace('Bearer ', '');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.userId;

                progress = await Progress.findOne({ userId, lessonId: lesson._id });

                if (!progress) {
                    progress = new Progress({
                        userId,
                        lessonId: lesson._id,
                        completionPercent: 0,
                        attempts: 0,
                        lastAccessedAt: new Date()
                    });
                    await progress.save();
                    logger.info('Progress started for lesson', {
                        requestId: req.requestId,
                        userId,
                        lessonId: lesson._id
                    });
                } else {
                    progress.lastAccessedAt = new Date();
                    await progress.save();
                }
            } catch (authError) {
                // Token invalid or expired — continue without tracking
                logger.warn('Progress tracking skipped — auth failed', {
                    requestId: req.requestId,
                    error: authError.message
                });
            }
        }

        ok(res, {
            ...lesson.toObject(),
            progress: progress ? {
                completionPercent: progress.completionPercent,
                quizScore: progress.quizScore,
                attempts: progress.attempts,
                lastAccessedAt: progress.lastAccessedAt
            } : null
        });
    } catch (error) {
        next(error);
    }
});

// POST create new lesson
router.post('/', auth, async (req, res, next) => {
    try {
        const { title, content, subjectId, subjectName, grade, topics, difficulty, duration } = req.body;

        if (!title || !content || !subjectId || !subjectName) {
            return validationError(res, 'Missing required fields: title, content, subjectId, subjectName');
        }

        const lesson = new Lesson({
            title, content, subjectId, subjectName,
            grade: grade || [],
            topics: topics || [],
            difficulty: difficulty || 'beginner',
            duration: duration || 30
        });

        await lesson.save();
        created(res, lesson, 'Lesson created successfully');
    } catch (error) {
        next(error);
    }
});

// PUT update lesson
router.put('/:id', auth, async (req, res, next) => {
    try {
        const { title, content, subjectId, subjectName, grade, topics, difficulty, duration } = req.body;

        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return notFound(res, 'Lesson');

        if (title) lesson.title = title;
        if (content) lesson.content = content;
        if (subjectId) lesson.subjectId = subjectId;
        if (subjectName) lesson.subjectName = subjectName;
        if (grade !== undefined) lesson.grade = grade;
        if (topics !== undefined) lesson.topics = topics;
        if (difficulty) lesson.difficulty = difficulty;
        if (duration !== undefined) lesson.duration = duration;

        await lesson.save();
        ok(res, lesson, 'Lesson updated successfully');
    } catch (error) {
        next(error);
    }
});

// DELETE lesson
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const lesson = await Lesson.findByIdAndDelete(req.params.id);
        if (!lesson) return notFound(res, 'Lesson');
        ok(res, null, 'Lesson deleted successfully');
    } catch (error) {
        next(error);
    }
});

// GET lessons by subject ID
router.get('/subject/:subjectId', async (req, res, next) => {
    try {
        const { grade, difficulty } = req.query;
        const query = { subjectId: req.params.subjectId };
        if (grade) query.grade = parseInt(grade);
        if (difficulty) query.difficulty = difficulty;

        const lessons = await Lesson.find(query)
            .populate('subjectId', 'name icon color')
            .sort({ createdAt: -1 });

        ok(res, { lessons, count: lessons.length });
    } catch (error) {
        next(error);
    }
});

module.exports = router;