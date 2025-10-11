const express = require('express');
const router = express.Router();

// GET /api/chat-history
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Chat history routes working",
        history: []
    });
});

// POST /api/chat-history
router.post('/', (req, res) => {
    res.json({
        success: true,
        message: "Create chat history endpoint working"
    });
});

module.exports = router;