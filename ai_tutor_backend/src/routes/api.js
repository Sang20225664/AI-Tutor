// routes/api.js
const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');

// Import route modules
const subjectRoutes = require('./subjectRoutes');
const quizRoutes = require('./quizRoutes');
const lessonRoutes = require('./lessonRoutes');
const lessonSuggestionRoutes = require('./lessonSuggestionRoutes');
const progressRoutes = require('./progressRoutes'); // PHASE 2

// Import auth middleware
const auth = require('../middleware/userMiddleware');

// Chat routes - phù hợp với frontend /api/gemini/chat
router.post('/gemini/chat', auth, geminiController.chatWithGemini);
router.post('/chat', auth, geminiController.chatWithGemini); // Keep for backward compatibility

// Test endpoint without auth (for debugging)
router.post('/gemini/test', geminiController.chatWithGemini);

// Subject routes
router.use('/subjects', subjectRoutes);

// Quiz routes
router.use('/quizzes', quizRoutes);

// Lesson routes
router.use('/lessons', lessonRoutes);

// Lesson Suggestion routes
router.use('/lesson-suggestions', lessonSuggestionRoutes);

// Progress routes - PHASE 2
router.use('/progress', progressRoutes);

module.exports = router;
