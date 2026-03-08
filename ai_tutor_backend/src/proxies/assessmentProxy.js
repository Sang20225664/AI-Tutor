const express = require('express');
const axios = require('axios');
const router = express.Router();
const auth = require('../middleware/auth');

const ASSESSMENT_URL = process.env.ASSESSMENT_SERVICE_URL || 'http://assessment:3003';

// Generic proxy function
async function proxyRequest(req, res, targetPath) {
    try {
        const url = `${ASSESSMENT_URL}${targetPath}`;
        console.log(`[Proxy] ${req.method} -> ${url}`);

        const response = await axios({
            method: req.method,
            url: url,
            headers: {
                ...req.headers,
                host: new URL(ASSESSMENT_URL).host
            },
            data: req.body,
            timeout: 5000
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error('[Proxy Error]', error.message);
            res.status(502).json({ success: false, message: 'Assessment Service unavailable' });
        }
    }
}

// === API Proxy Routes ===

// Progress Summary
router.get('/progress/summary', auth, (req, res) => {
    proxyRequest(req, res, '/api/v1/progress/summary');
});

// Progress by Lesson
router.get('/progress/lesson/:id', auth, (req, res) => {
    proxyRequest(req, res, `/api/v1/progress/lesson/${req.params.id}`);
});

// Update Progress (Lesson Complete)
router.post('/progress/lesson/:id', auth, (req, res) => {
    proxyRequest(req, res, `/api/v1/progress/lesson/${req.params.id}`);
});

// Quiz Submission
router.post('/quizzes/:id/submit', auth, (req, res) => {
    proxyRequest(req, res, `/api/v1/attempts/quiz/${req.params.id}/submit`);
});

module.exports = router;
