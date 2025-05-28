const { ChatHistory } = require('../models');
const askGemini = require('../services/geminiService');

exports.getChatHistoryByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chatHistory = await ChatHistory.find({ userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ChatHistory.countDocuments({ userId });

    res.json({
      success: true,
      data: chatHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createChatHistory = async (req, res) => {
  try {
    const { message, userId, subject } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Message and userId are required'
      });
    }

    // Get AI response
    const aiReply = await askGemini(message);

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
    console.error('Error creating chat history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { messages } = req.body;

    const chatHistory = await ChatHistory.findByIdAndUpdate(
      id,
      {
        $set: { messages },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat history not found'
      });
    }

    res.json({
      success: true,
      data: chatHistory
    });

  } catch (error) {
    console.error('Error updating chat history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ChatHistory.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Chat history not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat history deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chat history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};