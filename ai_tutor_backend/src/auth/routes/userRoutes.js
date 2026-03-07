const express = require('express');
const axios = require('axios');
const router = express.Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth:3001';

// Proxy helper — forwards request to auth service and returns response
async function proxyToAuth(req, res, path) {
    try {
        const response = await axios({
            method: req.method,
            url: `${AUTH_SERVICE_URL}${path}`,
            data: req.body,
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
                ...(req.headers['x-request-id'] ? { 'x-request-id': req.headers['x-request-id'] } : {})
            },
            timeout: 5000
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            // Auth service returned an error — forward it
            res.status(error.response.status).json(error.response.data);
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.error('❌ Auth service unreachable:', error.message);
            res.status(503).json({
                success: false,
                message: 'Auth service unavailable'
            });
        } else {
            console.error('❌ Auth proxy error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

// GET /api/users - List users (dev only) — proxy to auth service
router.get('/', (req, res) => proxyToAuth(req, res, '/api/auth'));

// POST /api/users/register — proxy to auth service
router.post('/register', (req, res) => proxyToAuth(req, res, '/api/auth/register'));

// POST /api/users/login — proxy to auth service
router.post('/login', (req, res) => proxyToAuth(req, res, '/api/auth/login'));

// POST /api/users/login/google — proxy to auth service
router.post('/login/google', (req, res) => proxyToAuth(req, res, '/api/auth/login/google'));

module.exports = router;