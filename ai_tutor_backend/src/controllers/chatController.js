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

    // Gửi câu hỏi tới Gemini
    const aiReply = await askGemini(message);

    const newChat = new Chat({
      messages: [
        { role: "user", text: message },
        { role: "ai", text: aiReply }
      ]
    });

    await newChat.save();
    res.status(201).json({ reply: aiReply, chatId: newChat._id });
  } catch (error) {
    console.error("Lỗi tạo chat:", error);
    res.status(500).json({ error: "Lỗi server khi tạo chat" });
  }
};

module.exports = { getChat, createChat };
