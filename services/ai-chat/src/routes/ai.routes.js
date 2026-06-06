const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const quizController = require('../controllers/quiz.controller');
const personalizationController = require('../controllers/personalization.controller');
const authMiddleware = require('../middleware/auth.middleware');
const quotaMiddleware = require('../middleware/quota.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const adminController = require('../controllers/admin.controller');

router.use(authMiddleware);

router.post('/messages', quotaMiddleware, chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversationById);
router.delete('/conversations/:id', chatController.deleteConversation);
router.patch('/conversations/:id/pin', chatController.togglePin);

// Quiz generation
router.post('/generate-quiz', quotaMiddleware, quizController.generateQuiz);

// Phase 2: AI Personalization
router.post('/adaptive-quiz', quotaMiddleware, personalizationController.generateAdaptiveQuiz);
router.post('/generate-flashcards', quotaMiddleware, personalizationController.generateFlashcards);
router.post('/summarize', quotaMiddleware, personalizationController.summarizeLesson);
router.post('/suggest-lessons', quotaMiddleware, personalizationController.suggestLessons);
router.get('/suggest-lessons', personalizationController.getAiSuggestions);

// Admin APIs
router.get('/admin/usage-summary', adminMiddleware, adminController.getUsageSummary);

module.exports = router;

