const express = require('express');
const axios = require('axios');
const router = express.Router();

const AICHAT_SERVICE_URL = process.env.AICHAT_SERVICE_URL || 'http://localhost:3004';

// Generic proxy function
async function proxyAiChat(req, res, targetPath) {
    try {
        const url = `${AICHAT_SERVICE_URL}${targetPath}`;
        const response = await axios({
            method: req.method,
            url: url,
            data: req.body,
            headers: {
                ...req.headers,
                host: new URL(AICHAT_SERVICE_URL).host
            },
            timeout: 30000 // Gemini can be slow
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`❌ AI Chat proxy error (${targetPath}):`, error.message);
            res.status(500).json({ success: false, message: 'AI Chat service unavailable' });
        }
    }
}

// Proxy /api/chat POST -> AI Chat Service /api/v1/ai/messages
router.post('/chat', (req, res) => proxyAiChat(req, res, '/api/v1/ai/messages'));
router.post('/gemini/chat', (req, res) => proxyAiChat(req, res, '/api/v1/ai/messages'));

// Proxy /api/chat-history GET -> AI Chat Service /api/v1/ai/conversations
router.get('/chat-history', (req, res) => proxyAiChat(req, res, '/api/v1/ai/conversations'));
router.get('/chats', (req, res) => proxyAiChat(req, res, '/api/v1/ai/conversations'));

// Support direct calls if needed
router.use('/ai', async (req, res) => {
    // /api/ai/health -> /health or /api/v1/ai/health
    const path = req.path;
    await proxyAiChat(req, res, `/api/v1/ai${path}`);
});

module.exports = router;
