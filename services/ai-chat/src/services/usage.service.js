const mongoose = require('mongoose');
const Usage = require('../models/usage.model');
const logger = require('../config/logger');

const toObjectId = (value) => {
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
        return null;
    }
    return new mongoose.Types.ObjectId(value);
};

/**
 * Log usage to the database asynchronously.
 * Does not block the main execution flow.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.type - 'chat', 'quiz', 'adaptive_quiz', 'flashcard', 'summary', 'suggestion'
 * @param {Object} params.usage - { promptTokens, completionTokens, totalTokens }
 * @param {string} [params.conversationId]
 * @param {string} [params.requestId]
 * @param {string} [params.model]
 * @param {boolean} [params.cached]
 */
const logUsage = ({ userId, type, usage, conversationId, requestId, model, cached }) => {
    if (!usage || !userId) return;

    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
        logger.warn(`Skipping AI usage log because userId is invalid: ${userId}`);
        return;
    }

    Usage.create({
        userId: userObjectId,
        type: type || 'chat',
        conversationId,
        requestId,
        model: model || usage.model,
        cached: cached || false,
        promptTokens: usage.promptTokens || 0,
        completionTokens: usage.completionTokens || 0,
        totalTokens: usage.totalTokens || 0
    }).catch(err => {
        logger.error(`Failed to log AI usage for user ${userId}: ${err.message}`);
    });
};

/**
 * Get total token usage for a user today.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
const getDailyTokenUsage = async (userId) => {
    const userObjectId = toObjectId(userId);
    if (!userObjectId) {
        throw new Error('Invalid userId');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await Usage.aggregate([
        { 
            $match: { 
                userId: userObjectId,
                createdAt: { $gte: startOfDay } 
            } 
        },
        { 
            $group: { 
                _id: null, 
                totalTokens: { $sum: '$totalTokens' } 
            } 
        }
    ]);

    return result.length > 0 ? result[0].totalTokens : 0;
};

/**
 * Get system-wide usage summary
 *
 * @param {Date} fromDate
 * @param {Date} toDate
 * @returns {Promise<Object>}
 */
const getUsageSummary = async (fromDate, toDate) => {
    const matchStage = {};
    if (fromDate || toDate) {
        matchStage.createdAt = {};
        if (fromDate) matchStage.createdAt.$gte = new Date(fromDate);
        if (toDate) matchStage.createdAt.$lte = new Date(toDate);
    }

    const [summary, byType, dailyUsage, topUsers] = await Promise.all([
        // Overall total
        Usage.aggregate([
            { $match: matchStage },
            { 
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    totalTokens: { $sum: '$totalTokens' },
                    promptTokens: { $sum: '$promptTokens' },
                    completionTokens: { $sum: '$completionTokens' }
                }
            }
        ]),
        // Breakdown by type
        Usage.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $ifNull: ['$type', 'chat'] },
                    requests: { $sum: 1 },
                    tokens: { $sum: '$totalTokens' }
                }
            },
            { $sort: { tokens: -1 } }
        ]),
        // Daily trend
        Usage.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    requests: { $sum: 1 },
                    tokens: { $sum: '$totalTokens' },
                    promptTokens: { $sum: '$promptTokens' },
                    completionTokens: { $sum: '$completionTokens' }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        // Top 10 users
        Usage.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$userId',
                    requests: { $sum: 1 },
                    tokens: { $sum: '$totalTokens' }
                }
            },
            { $sort: { tokens: -1 } },
            { $limit: 10 }
        ])
    ]);

    return {
        totalRequests: summary.length > 0 ? summary[0].totalRequests : 0,
        totalTokens: summary.length > 0 ? summary[0].totalTokens : 0,
        promptTokens: summary.length > 0 ? summary[0].promptTokens : 0,
        completionTokens: summary.length > 0 ? summary[0].completionTokens : 0,
        byType,
        dailyUsage,
        topUsers
    };
};

module.exports = {
    logUsage,
    getDailyTokenUsage,
    getUsageSummary
};
