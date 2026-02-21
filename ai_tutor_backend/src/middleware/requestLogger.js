const { randomUUID } = require('crypto');
const logger = require('../config/logger');

/**
 * Request Logger Middleware — Phase 2.5 Task 4
 * Attaches a unique requestId to every request and logs structured data on response finish.
 * Register this BEFORE routes in server.js.
 */
const requestLogger = (req, res, next) => {
    req.requestId = randomUUID(); // Unique ID for tracing this request through logs
    req.startTime = Date.now();

    res.on('finish', () => {
        const responseTime = Date.now() - req.startTime;
        const level = res.statusCode >= 500 ? 'error'
            : res.statusCode >= 400 ? 'warn'
                : 'info';

        logger[level]('HTTP', {
            requestId: req.requestId,
            method: req.method,
            path: req.path,
            query: req.query,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userId: req.user?.userId || 'anonymous',
            userAgent: req.get('user-agent') || null
        });
    });

    next();
};

module.exports = requestLogger;
