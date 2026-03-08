const mongoose = require('mongoose');

/**
 * QuizAttempt Collection - Quiz History Tracking
 * Records every quiz attempt for analytics
 */
const quizAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
        index: true
    },
    answers: [{
        questionIndex: Number,
        selectedAnswer: Number, // index of selected option
        isCorrect: Boolean
    }],
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    timeSpent: {
        type: Number, // seconds
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false // Only need createdAt
});

// Compound index for user quiz history
quizAttemptSchema.index({ userId: 1, quizId: 1, createdAt: -1 });

// Index for analytics (leaderboard, quiz stats)
quizAttemptSchema.index({ quizId: 1, score: -1 });

// Index for dashboard "recent activity" query
quizAttemptSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
