const usageService = require('../services/usage.service');
const logger = require('../config/logger');

const quotaMiddleware = async (req, res, next) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const dailyLimit = parseInt(process.env.AI_DAILY_TOKEN_LIMIT) || 50000;
        const tokensUsed = await usageService.getDailyTokenUsage(userId);

        if (tokensUsed >= dailyLimit) {
            logger.warn(`User ${userId} exceeded daily token limit (${tokensUsed}/${dailyLimit})`);
            return res.status(429).json({
                success: false,
                message: 'Bạn đã hết lượt sử dụng AI hôm nay.',
                data: {
                    tokensUsed,
                    dailyLimit
                }
            });
        }

        next();
    } catch (error) {
        if (error.message === 'Invalid userId') {
            return res.status(401).json({ success: false, message: 'Invalid user identity' });
        }

        logger.error(`Quota check failed: ${error.message}`);
        // Cho phép đi tiếp nếu bị lỗi DB để không làm gián đoạn trải nghiệm
        next();
    }
};

module.exports = quotaMiddleware;
