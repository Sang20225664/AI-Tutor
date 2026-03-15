const mongoose = require('mongoose');

const summaryCacheSchema = new mongoose.Schema({
    cacheKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    lessonId: { type: String, required: true },
    lessonTitle: String,
    model: String,
    promptVersion: String,
    summary: [{ type: String }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 7 // TTL: 7 days
    }
});

module.exports = mongoose.model('SummaryCache', summaryCacheSchema);
