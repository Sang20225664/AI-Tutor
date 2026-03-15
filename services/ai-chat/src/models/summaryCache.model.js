const mongoose = require('mongoose');

const summaryCacheSchema = new mongoose.Schema({
    lessonId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    lessonTitle: String,
    summary: [{ type: String }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 7 // Auto-delete after 7 days (TTL index)
    }
});

module.exports = mongoose.model('SummaryCache', summaryCacheSchema);
