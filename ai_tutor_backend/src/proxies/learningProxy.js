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

// Intercept GET /lessons/:id — fetch lesson from Learning + progress from Assessment
router.get('/lessons/:id', async (req, res) => {
    try {
        const url = `${LEARNING_URL}/api/v1/lessons/${req.params.id}`;
        const response = await axios.get(url, { timeout: 5000 });
        const responsePayload = response.data;
        const lessonData = responsePayload.data;

        let progress = null;
        const authHeader = req.header('Authorization');
        if (authHeader && lessonData) {
            try {
                const ASSESSMENT_URL = process.env.ASSESSMENT_SERVICE_URL || 'http://assessment:3003';
                // Proxy to Assessment Service to get/create progress
                const progressRes = await axios.post(
                    `${ASSESSMENT_URL}/api/v1/progress/lesson/${lessonData._id}`,
                    {},
                    {
                        headers: {
                            'Authorization': authHeader,
                            'x-request-id': req.headers['x-request-id']
                        },
                        timeout: 3000
                    }
                );
                if (progressRes.data.success) {
                    progress = progressRes.data.data;
                }
            } catch (authError) {
                console.warn('Progress tracking skipped in proxy:', authError.message);
            }
        }

        res.json({
            ...responsePayload,
            data: {
                ...lessonData,
                progress: progress ? {
                    completionPercent: progress.completionPercent,
                    quizScore: progress.quizScore,
                    attempts: progress.attempts,
                    lastAccessedAt: progress.lastAccessedAt
                } : null
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
