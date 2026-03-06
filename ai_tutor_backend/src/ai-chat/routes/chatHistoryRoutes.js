const express = require('express');
const router = express.Router();
const chatHistoryController = require('../controllers/chatHistoryController');

// GET /api/chat-history/user/:userId - Get chat history by user
router.get('/user/:userId', chatHistoryController.getChatHistoryByUser);

// POST /api/chat-history - Create new chat history
router.post('/', chatHistoryController.createChatHistory);

// PUT /api/chat-history/:id - Update chat history
router.put('/:id', chatHistoryController.updateChatHistory);

// DELETE /api/chat-history/:id - Delete chat history
router.delete('/:id', chatHistoryController.deleteChatHistory);

module.exports = router;