const usageService = require('../services/usage.service');
const logger = require('../config/logger');

const parseDateParam = (value, fieldName) => {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        const error = new Error(`${fieldName} must be a valid date`);
        error.statusCode = 400;
        throw error;
    }

    return parsed;
};

/**
 * GET /api/v1/ai/admin/usage-summary
 * Query Params: ?from=...&to=...
 */
const getUsageSummary = async (req, res) => {
    try {
        const { from, to } = req.query;
        const summary = await usageService.getUsageSummary(
            parseDateParam(from, 'from'),
            parseDateParam(to, 'to')
        );

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        logger.error(`Failed to fetch AI usage summary: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch AI usage summary'
        });
    }
};

module.exports = {
    getUsageSummary
};
