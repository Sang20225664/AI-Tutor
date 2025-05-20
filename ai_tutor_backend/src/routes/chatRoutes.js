const express = require("express");
const router = express.Router();
const { createChat, getChat } = require("../controllers/chatController");

// Gửi câu hỏi đến AI và nhận phản hồi (chat mới)
router.post("/", createChat);

// Lấy lại 1 cuộc hội thoại theo ID
router.get("/:id", getChat);

module.exports = router;
