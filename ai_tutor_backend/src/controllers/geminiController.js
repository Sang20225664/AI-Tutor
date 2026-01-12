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
      model: "gemini-3.0-flash",
      systemInstruction: subject
        ? `Bạn là gia sư AI chuyên về ${subject}. Hãy trả lời chi tiết và dễ hiểu bằng tiếng Việt.`
        : 'Bạn là gia sư AI thông minh. Hãy trả lời chi tiết và dễ hiểu bằng tiếng Việt.'
    });

    // Generate content (non-streaming)
    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text = response.text();

    res.json({
      success: true,
      response: text,
      message: 'Response generated successfully'
    });
  } catch (error) {
    console.error("Gemini Error:", error.message);
    res.status(500).json({
      success: false,
      message: 'AI đang gặp sự cố',
      error: error.message
    });
  }
};