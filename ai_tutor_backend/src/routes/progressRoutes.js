const express = require('express');
const router = express.Router();
const auth = require('../middleware/userMiddleware');
const {
    getOrCreateProgress,
    getProgressSummary,
    getProgressByLesson
} = require('../controllers/progressController');

/**
 * Progress Routes - Phase 2
 * Handles learning progress tracking and analytics
 */

// GET /api/progress/summary - Dashboard API
// Returns overall learning statistics
router.get('/summary', auth, getProgressSummary);

// GET /api/progress/lesson/:lessonId - Check progress for specific lesson
router.get('/lesson/:lessonId', auth, getProgressByLesson);

// POST /api/progress/lesson/:lessonId - Manually track lesson view
// (Usually auto-created by GET /api/lessons/:id, but can be called explicitly)
router.post('/lesson/:lessonId', auth, getOrCreateProgress);

module.exports = router;
