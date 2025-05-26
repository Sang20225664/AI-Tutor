const { GoogleGenerativeAI } = require('@google/generative-ai');

// Kiểm tra API key có tồn tại
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not configured in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGemini = async (prompt) => {
  try {
    // Đảo ngược chuỗi prompt
    const reversedPrompt = prompt.split('').reverse().join('');
    return reversedPrompt;
  } catch (err) {
    console.error("Error reversing prompt:", err);
    return "Error processing the message.";
  }
};

module.exports = askGemini;
