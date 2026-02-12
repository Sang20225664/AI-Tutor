const express = require('express');
const router = express.Router();
const {
    getChats,
    createChat,
    handleNewMessage,
    getUserChatHistoryList,
    getChatDetails
} = require('../controllers/chatController');
const chatHistoryController = require('../controllers/chatHistoryController');

const auth = require('../middleware/userMiddleware');

// Apply auth middleware to all routes
router.use(auth);

// GET /api/chats - Get all chats for a user (via query param ?userId=... or from token)
router.get('/', getUserChatHistoryList);

// POST /api/chats - Send a new message (creates new chat or appends to existing)
router.post('/', handleNewMessage);

// GET /api/chats/:id - Get specific chat details
router.get('/:id', getChatDetails);

// PUT /api/chats/:id - Update chat messages (using chatHistoryController logic for consistency)
router.put('/:id', chatHistoryController.updateChatHistory); // Use PUT for compatibility with frontend if needed, or PATCH

// PATCH /api/chats/:id - Update chat messages
router.patch('/:id', chatHistoryController.updateChatHistory);

// DELETE /api/chats/:id - Delete a chat session
router.delete('/:id', chatHistoryController.deleteChatHistory);

module.exports = router;