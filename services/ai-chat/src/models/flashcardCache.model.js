const mongoose = require('mongoose');

const flashcardCacheSchema = new mongoose.Schema({
    lessonId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    lessonTitle: String,
    cards: [{
        front: { type: String, required: true },
        back: { type: String, required: true }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 7 // Auto-delete after 7 days (TTL index)
    }
});

module.exports = mongoose.model('FlashcardCache', flashcardCacheSchema);
