// routes/geminiRoutes.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// routes/geminiRoutes.js
router.post('/generate', async (req, res) => {
  console.log('Received request:', req.body); // Log incoming data
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log('AI Response:', text); // Log AI output
    res.json({
      success: true,
      response: text
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;