const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const router = express.Router();

const AICHAT_SERVICE_URL = process.env.AICHAT_SERVICE_URL || 'http://localhost:3004';

// Rate Limiter: 10 requests / minute / user
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 min
    max: 10, // 10 requests
    keyGenerator: (req) => {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.decode(token);
                if (decoded && (decoded.userId || decoded.id)) {
                    return decoded.userId || decoded.id;
                }
            } catch (e) { }
        }
        return req.ip;
    },
    message: { success: false, message: 'Too many AI requests from this user, please try again after a minute' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.use(aiLimiter);

// Generic proxy function
async function proxyAiChat(req, res, targetPath) {
    try {
        const url = `${AICHAT_SERVICE_URL}${targetPath}`;
        
        const response = await axios({
            method: req.method,
            url: url,
            headers: {
                ...req.headers,
                host: new URL(AICHAT_SERVICE_URL).host
            },
            data: req.body,
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

// Proxy /api/generate-quiz POST -> AI Chat Service /api/v1/ai/generate-quiz
router.post('/generate-quiz', (req, res) => proxyAiChat(req, res, '/api/v1/ai/generate-quiz'));

// Phase 2: AI Personalization
router.post('/adaptive-quiz', (req, res) => proxyAiChat(req, res, '/api/v1/ai/adaptive-quiz'));
router.post('/generate-flashcards', (req, res) => proxyAiChat(req, res, '/api/v1/ai/generate-flashcards'));
router.post('/summarize', (req, res) => proxyAiChat(req, res, '/api/v1/ai/summarize'));
router.post('/suggest-lessons', (req, res) => proxyAiChat(req, res, '/api/v1/ai/suggest-lessons'));
router.get('/suggest-lessons', (req, res) => proxyAiChat(req, res, '/api/v1/ai/suggest-lessons'));

// Proxy /api/chat-history GET -> AI Chat Service /api/v1/ai/conversations
router.get('/chat-history', (req, res) => proxyAiChat(req, res, '/api/v1/ai/conversations'));
router.get('/chats', (req, res) => proxyAiChat(req, res, '/api/v1/ai/conversations'));
router.delete('/chats/:id', (req, res) => proxyAiChat(req, res, `/api/v1/ai/conversations/${req.params.id}`));
router.patch('/chats/:id/pin', (req, res) => proxyAiChat(req, res, `/api/v1/ai/conversations/${req.params.id}/pin`));

// Support direct calls if needed
router.use('/ai', async (req, res) => {
    // /api/ai/health -> /health or /api/v1/ai/health
    const path = req.path;
    await proxyAiChat(req, res, `/api/v1/ai${path}`);
});

module.exports = router;
