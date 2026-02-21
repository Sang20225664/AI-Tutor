/**
 * Unified Response Helper
 * All API responses must go through these helpers to ensure consistency
 *
 * Success shape:  { success: true,  data: {},   message: "..." }
 * Error shape:    { success: false, error: { code: "...", message: "..." } }
 */

/**
 * 200 OK
 */
const ok = (res, data = null, message = 'OK') =>
    res.status(200).json({ success: true, data, message });

/**
 * 201 Created
 */
const created = (res, data = null, message = 'Created') =>
    res.status(201).json({ success: true, data, message });

/**
 * 400 Validation / Bad Request
 */
const validationError = (res, message = 'Validation failed', details = []) =>
    res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message, details }
    });

/**
 * 401 Unauthorized
 */
const unauthorized = (res, message = 'Unauthorized') =>
    res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message }
    });

/**
 * 404 Not Found
 */
const notFound = (res, resource = 'Resource') =>
    res.status(404).json({
        success: false,
        error: { code: `${resource.toUpperCase().replace(/ /g, '_')}_NOT_FOUND`, message: `${resource} not found` }
    });

/**
 * 409 Conflict
 */
const conflict = (res, message = 'Conflict', code = 'CONFLICT') =>
    res.status(409).json({
        success: false,
        error: { code, message }
    });

/**
 * 500 Internal Server Error
 * Never expose raw error to client in production
 */
const serverError = (res, message = 'Internal server error', code = 'SERVER_ERROR') =>
    res.status(500).json({
        success: false,
        error: { code, message }
    });

module.exports = { ok, created, validationError, unauthorized, notFound, conflict, serverError };
