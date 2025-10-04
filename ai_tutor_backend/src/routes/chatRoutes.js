const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const ChatModel = require('../models/chatModel'); // Đảm bảo tên file đúng
const User = require('../models/user'); // Nếu có import User

// Chat routes
router.post("/", chatController.handleNewMessage);
router.get("/:id", chatController.getChatDetails);
router.get("/user/:userId", chatController.getUserChatHistoryList);

module.exports = router;