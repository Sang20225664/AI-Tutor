const Chat = require("../models/chatModel");
const askGemini = require("../services/geminiService");

// Lấy lịch sử chat
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: "Không tìm thấy chat" });
    res.json(chat);

  } catch (error) {
    console.error("Lỗi lấy chat:", error);
    res.status(500).json({ error: "Lỗi server khi lấy chat" });
  }
};

// Tạo cuộc hội thoại mới
const createChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: "Message is required" 
      });
    }

    console.log("Received message:", message); // Debug log

    // Gửi câu hỏi tới Gemini
    const aiReply = await askGemini(message);
    console.log("AI Reply:", aiReply); // Debug log

    const newChat = new Chat({
      messages: [
        { role: "user", text: message },
        { role: "ai", text: aiReply }
      ]
    });

    await newChat.save();
    res.status(201).json({ 
      success: true,
      reply: aiReply, 
      chatId: newChat._id 
    });
  } catch (error) {
    console.error("Chat creation error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to process chat" 
    });
  }
};

module.exports = { getChat, createChat };
