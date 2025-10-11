const express = require('express');
const { getChats, createChat } = require('../controllers/chatController');
const router = express.Router();

// GET /api/chats
router.get('/', getChats);

// POST /api/chats
router.post('/', createChat);

module.exports = router;