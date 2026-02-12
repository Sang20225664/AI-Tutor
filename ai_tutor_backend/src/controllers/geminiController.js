const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithGemini = async (req, res) => {
  try {
    const { message, prompt, subject, greet } = req.body || {};
    const userMessage = message || prompt;
    const greetQuery = req.query && (req.query.greet === '1' || req.query.greet === 'true');

    // If explicit greet flag provided, immediately respond with greeting
    if (greet === true || greet === 'true' || greetQuery) {
      console.log('Sending greeting (explicit greet flag)');
      return res.json({
        success: true,
        response: 'Xin chào, tôi là gia sư AI của bạn, hôm nay bạn muốn học gì?',
        message: 'Greeting sent'
      });
    }

    // Initialize model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: subject
        ? `Bạn là gia sư AI chuyên về ${subject}. Hãy trả lời chi tiết và dễ hiểu bằng tiếng Việt.`
        : 'Bạn là gia sư AI thông minh. Hãy trả lời chi tiết và dễ hiểu bằng tiếng Việt.'
    });

    // Generate content (non-streaming)
    let text = '';
    let aiError = null;

    try {
      const result = await model.generateContent(userMessage);
      const response = result.response;
      text = response.text();
    } catch (err) {
      console.error("⚠️ Gemini API Error:", err.message);
      aiError = err.message;
      text = "Xin lỗi, hiện tại tôi đang bị quá tải (hết lượt dùng miễn phí). Vui lòng thử lại sau hoặc cập nhật khóa API mới.";
    }

    // ==========================================
    // PERSISTENCE LAYER: Save to ChatHistory
    // ==========================================
    // Get userId from token (req.user) or body
    const userId = req.user?.userId || req.user?.id || req.body.userId;

    // Only save if userId is available
    if (userId) {
      try {
        const ChatHistory = require('../models/chatHistory');

        const { sessionId } = req.body;

        const messagesToSave = [
          { role: 'user', content: userMessage, timestamp: new Date() }
        ];

        // Only save AI response if we have one (or save the error message)
        if (text) {
          messagesToSave.push({ role: 'assistant', content: text, timestamp: new Date() });
        }

        // If sessionId provided, append to existing chat
        if (sessionId) {
          await ChatHistory.findByIdAndUpdate(
            sessionId,
            {
              $push: {
                messages: { $each: messagesToSave }
              },
              updatedAt: new Date()
            }
          );
        } else {
          // Create new chat session
          const newChat = new ChatHistory({
            userId,
            subject: subject || `Chat ${new Date().toLocaleString()}`,
            messages: messagesToSave
          });
          await newChat.save();
          // Optionally return the new sessionId in the response if needed by frontend
        }
        console.log(`✅ Chat saved to DB for user ${userId}`);
      } catch (dbError) {
        console.error("⚠️ Failed to save chat to DB:", dbError.message);
        // Don't fail the request if DB save fails, just log it
      }
    }

    if (aiError) {
      // Return success: true so the frontend displays the fallback message in the chat bubble
      return res.json({
        success: true,
        response: text, // Fallback message
        message: 'AI overloaded (fallback response)',
        error: aiError
      });
    }

    res.json({
      success: true,
      response: text,
      message: 'Response generated successfully'
    });
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống',
      error: error.message
    });
  }
};