const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// POST /api/gemini/chat
router.post('/chat', async (req, res) => {
  try {
    console.log('DEBUG: Received request to /api/gemini/chat');
    console.log('DEBUG: Request body:', req.body);
    console.log('DEBUG: Request headers:', req.headers);

    const { message } = req.body;

    if (!message) {
      console.log('DEBUG: No message provided');
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    console.log('DEBUG: Processing message:', message);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    console.log('DEBUG: Gemini response received:', text.substring(0, 100) + '...');

    res.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get response from Gemini",
      error: error.message
    });
  }
});

// GET /api/gemini/test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: "Gemini routes are working",
    endpoints: ['/chat']
  });
});

module.exports = router;