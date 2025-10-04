const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const ChatHistory = require('../models/chatHistory'); // Đảm bảo tên file đúng
const User = require('../models/user'); // Nếu có import User

// Chat history routes
router.get('/:userId', chatController.getUserChatHistoryList);
router.post('/', chatController.handleNewMessage);

module.exports = router;