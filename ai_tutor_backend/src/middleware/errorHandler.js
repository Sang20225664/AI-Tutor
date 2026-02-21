const logger = require('../config/logger');

/**
 * Global Error Handler Middleware
 * Must be registered LAST in express middleware chain (server.js)
 * Catches all errors thrown by next(err) or unhandled promise rejections
 */
const errorHandler = (err, req, res, next) => {
    // Attach requestId if set by requestLogger middleware
    const requestId = req.requestId || 'unknown';

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Categorise known Mongoose errors
    let code = err.code || 'SERVER_ERROR';
    let message = err.message || 'Internal server error';

    if (err.name === 'ValidationError') {
        // Mongoose schema validation
        code = 'VALIDATION_ERROR';
        message = Object.values(err.errors).map(e => e.message).join(', ');
        return res.status(400).json({ success: false, error: { code, message, requestId } });
    }

    if (err.name === 'CastError') {
        code = 'INVALID_ID';
        message = `Invalid ${err.path}: ${err.value}`;
        return res.status(400).json({ success: false, error: { code, message, requestId } });
    }

    if (err.code === 11000) {
        // Mongo duplicate key
        code = 'DUPLICATE_KEY';
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `Duplicate value for ${field}`;
        return res.status(409).json({ success: false, error: { code, message, requestId } });
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        code = 'UNAUTHORIZED';
        message = 'Invalid or expired token';
        return res.status(401).json({ success: false, error: { code, message, requestId } });
    }

    // Log full error internally (with stack)
    logger.error('Unhandled error', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.userId || null,
        statusCode,
        code,
        message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });

    // Never leak stack trace to client
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message: statusCode === 500 && process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : message,
            requestId
        }
    });
};

module.exports = errorHandler;
