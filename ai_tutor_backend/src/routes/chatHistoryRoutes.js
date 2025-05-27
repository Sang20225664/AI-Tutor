const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Chat history routes
router.get('/:userId', chatController.getUserChatHistoryList);
router.post('/', chatController.handleNewMessage);

module.exports = router;