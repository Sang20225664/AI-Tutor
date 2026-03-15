const mongoose = require('mongoose');

const flashcardCacheSchema = new mongoose.Schema({
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
    cards: [{
        front: { type: String, required: true },
        back: { type: String, required: true }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 7 // TTL: 7 days
    }
});

module.exports = mongoose.model('FlashcardCache', flashcardCacheSchema);
