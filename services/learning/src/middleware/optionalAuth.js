const jwt = require('jsonwebtoken');

module.exports = function optionalAuth(req, _res, next) {
    const authHeader = req.header('Authorization');
    const jwtSecret = process.env.JWT_SECRET;

    if (!authHeader || !jwtSecret) {
        return next();
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return next();
    }

    try {
        req.user = jwt.verify(token, jwtSecret);
    } catch (err) {
        // Lesson content is public; invalid tokens should only skip tracking.
    }

    next();
};
