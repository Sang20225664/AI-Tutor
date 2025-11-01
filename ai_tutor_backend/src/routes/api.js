// routes/api.js
const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');

// Import route modules
const subjectRoutes = require('./subjectRoutes');
const quizRoutes = require('./quizRoutes');
const lessonRoutes = require('./lessonRoutes');
const lessonSuggestionRoutes = require('./lessonSuggestionRoutes');

// Chat routes - phù hợp với frontend /api/gemini/chat
router.post('/gemini/chat', geminiController.chatWithGemini);
router.post('/chat', geminiController.chatWithGemini); // Keep for backward compatibility

// Subject routes
router.use('/subjects', subjectRoutes);

// Quiz routes
router.use('/quizzes', quizRoutes);

// Lesson routes
router.use('/lessons', lessonRoutes);

// Lesson Suggestion routes
router.use('/lesson-suggestions', lessonSuggestionRoutes);

module.exports = router;
