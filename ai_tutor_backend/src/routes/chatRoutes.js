const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// Chat routes
router.post("/", chatController.handleNewMessage);
router.get("/:id", chatController.getChatDetails);
router.get("/user/:userId", chatController.getUserChatHistoryList);

module.exports = router;