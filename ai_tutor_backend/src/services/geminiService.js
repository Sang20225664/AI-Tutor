const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGemini = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' }); // chú ý không thêm models/
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Lỗi khi gọi Gemini AI.";
  }
};

module.exports = askGemini;
