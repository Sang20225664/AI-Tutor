const { GoogleGenerativeAI } = require('@google/generative-ai');

// Kiểm tra API key có tồn tại
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not configured in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGemini = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Error calling Gemini:", err);
    throw err;
  }
};

module.exports = askGemini;
