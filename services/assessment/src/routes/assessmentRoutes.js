const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// === Quiz Attempts ===
router.post('/attempts/quiz/:id/submit', auth, attemptController.submitQuiz);

// === Progress Tracking ===
router.get('/progress/summary', auth, progressController.getProgressSummary);
router.get('/progress/lesson/:lessonId', auth, progressController.getProgressByLesson);
router.post('/progress/lesson/:lessonId', auth, progressController.getOrCreateProgress);

module.exports = router;
