const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userMessage: String,
  aiResponse: String,
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: String, // Changed from ObjectId to String
    required: true
  },
  conversations: [conversationSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Chat || mongoose.model('Chat', chatSchema);