const logger = require('../config/logger');

const adminMiddleware = (req, res, next) => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const adminIdsStr = process.env.ADMIN_USER_IDS || '';
    const adminIds = adminIdsStr.split(',').map(id => id.trim()).filter(id => id.length > 0);

    const isAdminRole = req.user?.role === 'admin';
    const isWhitelisted = adminIds.includes(userId.toString());

    if (!isAdminRole && !isWhitelisted) {
        logger.warn(`Unauthorized admin access attempt by user ${userId}`);
        return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }

    next();
};

module.exports = adminMiddleware;
