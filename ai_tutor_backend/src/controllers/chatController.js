const { ChatHistory, Chat } = require('../models');
const askGemini = require('../services/geminiService');
const User = require('../models/user'); // Nếu có import User
const ChatModel = require('../models/chatModel');

const getChatDetails = async (req, res) => {
  try {
    const chat = await ChatHistory.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error("Error getting chat details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting chat details"
    });
  }
};

const handleNewMessage = async (req, res) => {
  try {
    const { message, userId, sessionId, subject } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        message: "Message and userId are required"
      });
    }

    // Get AI response
    const aiReply = await askGemini(message);

    if (sessionId) {
      // Add messages to existing chat
      const chatHistory = await ChatHistory.findByIdAndUpdate(
        sessionId,
        {
          $push: {
            messages: [
              {
                role: 'user',
                content: message,
                timestamp: new Date()
              },
              {
                role: 'assistant',
                content: aiReply,
                timestamp: new Date()
              }
            ]
          },
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!chatHistory) {
        return res.status(404).json({
          success: false,
          message: "Chat session not found"
        });
      }

      return res.json({
        success: true,
        data: {
          reply: aiReply,
          chatId: chatHistory._id,
          updatedSession: chatHistory
        }
      });
    }

    // Create new chat
    const chatHistory = new ChatHistory({
      userId,
      subject: subject || `Chat ${new Date().toLocaleString()}`,
      messages: [
        {
          role: 'user',
          content: message,
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: aiReply,
          timestamp: new Date()
        }
      ]
    });

    await chatHistory.save();

    res.status(201).json({
      success: true,
      data: {
        reply: aiReply,
        chatId: chatHistory._id,
        updatedSession: chatHistory
      }
    });

  } catch (error) {
    console.error("Error handling message:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while handling message"
    });
  }
};

const getUserChatHistoryList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chats = await ChatHistory.find({ userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ChatHistory.countDocuments({ userId });

    res.json({
      success: true,
      data: chats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error getting chat history:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting chat history"
    });
  }
};

module.exports = {
  getChatDetails,
  handleNewMessage,
  getUserChatHistoryList
};