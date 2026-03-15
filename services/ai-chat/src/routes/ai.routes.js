const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const quizController = require('../controllers/quiz.controller');
const personalizationController = require('../controllers/personalization.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/messages', chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversationById);

// Quiz generation
router.post('/generate-quiz', quizController.generateQuiz);

// Phase 2: AI Personalization
router.post('/adaptive-quiz', personalizationController.generateAdaptiveQuiz);
router.post('/generate-flashcards', personalizationController.generateFlashcards);
router.post('/summarize', personalizationController.summarizeLesson);

module.exports = router;

