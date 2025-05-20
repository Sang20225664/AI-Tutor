const mongoose = require("mongoose");

// Định nghĩa schema cho mỗi tin nhắn
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "ai"],
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

// Định nghĩa schema cho cuộc hội thoại
const chatSchema = new mongoose.Schema({
  messages: {
    type: [messageSchema],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Tạo model Chat từ schema
const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
