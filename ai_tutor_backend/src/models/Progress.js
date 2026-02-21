const mongoose = require('mongoose');

/**
 * Progress Collection - Core of Learning Analytics
 * Tracks user progress through lessons
 */
const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
        index: true
    },
    completionPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    quizScore: {
        type: Number,
        default: null, // null if quiz not taken yet
        min: 0,
        max: 100
    },
    attempts: {
        type: Number,
        default: 0
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound unique index: one progress record per user per lesson
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

// Index for analytics queries
progressSchema.index({ userId: 1, updatedAt: -1 });
progressSchema.index({ lessonId: 1, completionPercent: 1 });

module.exports = mongoose.model('Progress', progressSchema);
