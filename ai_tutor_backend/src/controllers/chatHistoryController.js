const { ChatHistory } = require('../models');

exports.getChatHistoryByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Create a default chat history if none exists
    const existingHistory = await ChatHistory.find({ userId });
    if (existingHistory.length === 0) {
      const defaultChat = new ChatHistory({
        userId,
        subject: 'Welcome Chat',
        messages: [{
          content: 'Welcome to AI Tutor! How can I help you today?',
          role: 'assistant'
        }]
      });
      await defaultChat.save();
      return res.json({
        success: true,
        data: [defaultChat]
      });
    }

    // Return existing chat history
    const chatHistory = await ChatHistory.find({ userId })
      .sort({ updatedAt: -1 })
      .select('subject messages createdAt updatedAt')
      .lean();

    return res.json({
      success: true,
      data: chatHistory.map(chat => ({
        id: chat._id,
        subject: chat.subject,
        lastMessage: chat.messages[chat.messages.length - 1]?.content,
        messageCount: chat.messages.length,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }))
    });

  } catch (error) {
    console.error('Lỗi lấy lịch sử chat:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createChatHistory = async (req, res) => {
  try {
    const { userId, message, subject } = req.body;
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId and message are required'
      });
    }

    const chatHistory = new ChatHistory({
      userId,
      subject: subject || `Conversation ${new Date().toLocaleString()}`,
      messages: [{
        content: message,
        role: 'user'
      }]
    });

    await chatHistory.save();
    res.json({
      success: true,
      data: {
        id: chatHistory._id,
        subject: chatHistory.subject,
        lastMessage: message,
        messageCount: 1,
        createdAt: chatHistory.createdAt,
        updatedAt: chatHistory.updatedAt
      }
    });
  } catch (error) {
    console.error('Lỗi tạo chat history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};