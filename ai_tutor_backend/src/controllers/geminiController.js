const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithGemini = async (req, res) => {
  try {
    const { prompt, subject } = req.body;

    // Khởi tạo model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      systemInstruction: `Bạn là gia sư AI chuyên về ${subject}. Hãy trả lời chi tiết và dễ hiểu.`
    });

    // Streaming response
    const result = await model.generateContentStream(prompt);
    let text = '';

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      text += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI đang gặp sự cố" });
  }
};