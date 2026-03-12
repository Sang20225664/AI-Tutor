const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// === Quiz Attempts ===
router.post('/attempts/quiz/:id/submit', auth, attemptController.submitQuiz);
router.get('/attempts/history', auth, attemptController.getHistory);

// === Progress Tracking ===
router.get('/progress/summary', auth, progressController.getProgressSummary);
router.get('/progress/lesson/:lessonId', auth, progressController.getProgressByLesson);
router.post('/progress/lesson/:lessonId', auth, progressController.getOrCreateProgress);

module.exports = router;
