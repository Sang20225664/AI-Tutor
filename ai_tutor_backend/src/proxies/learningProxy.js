const express = require('express');
const axios = require('axios');
const router = express.Router();

const LEARNING_URL = process.env.LEARNING_SERVICE_URL || 'http://learning:3002';

// Generic proxy to Learning Service
async function proxyGet(req, res, path) {
    try {
        const url = `${LEARNING_URL}${path}`;
        const qs = new URLSearchParams(req.query).toString();
        const fullUrl = qs ? `${url}?${qs}` : url;

        const response = await axios.get(fullUrl, {
            headers: { ...req.headers },
            timeout: 5000
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.error('❌ Learning service unreachable:', error.message);
            res.status(503).json({ success: false, message: 'Learning service unavailable' });
        } else {
            console.error('❌ Learning proxy error:', error.message);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

// === Subjects ===
router.get('/subjects', (req, res) => proxyGet(req, res, '/api/v1/subjects'));
router.get('/subjects/:id', (req, res) => proxyGet(req, res, `/api/v1/subjects/${req.params.id}`));

// === Lessons ===
router.get('/lessons', (req, res) => proxyGet(req, res, '/api/v1/lessons'));

// Intercept GET /lessons/:id — forward auth so Learning can track progress asynchronously
router.get('/lessons/:id', async (req, res) => {
    try {
        const url = `${LEARNING_URL}/api/v1/lessons/${req.params.id}`;
        const headers = {};
        if (req.header('Authorization')) headers.Authorization = req.header('Authorization');
        if (req.headers['x-request-id']) headers['x-request-id'] = req.headers['x-request-id'];

        const response = await axios.get(url, {
            headers,
            timeout: 5000
        });
        const responsePayload = response.data;
        const lessonData = responsePayload.data;

        res.json({
            ...responsePayload,
            data: {
                ...lessonData,
                progress: null
            }
        });
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error('❌ Learning proxy error on /lessons/:id:', error.message);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
});

// === Quizzes (GET only — submission stays in monolith/assessment) ===
router.get('/quizzes', (req, res) => proxyGet(req, res, '/api/v1/quizzes'));
router.get('/quizzes/:id', (req, res) => proxyGet(req, res, `/api/v1/quizzes/${req.params.id}`));

// === Lesson Suggestions ===
router.get('/lesson-suggestions', (req, res) => proxyGet(req, res, '/api/v1/lessons/suggestions'));

module.exports = router;
