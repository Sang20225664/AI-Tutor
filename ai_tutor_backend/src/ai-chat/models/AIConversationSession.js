const mongoose = require('mongoose');

/**
 * AIConversationSession Collection
 * High-level chat session tracking with cost/token management
 */
const aiConversationSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        default: null,
        index: true
    },
    contextSummary: {
        type: String,
        maxlength: 500
    },
    tokenUsage: {
        inputTokens: { type: Number, default: 0 },
        outputTokens: { type: Number, default: 0 },
        totalTokens: { type: Number, default: 0 }
    },
    messageCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for finding user's active sessions
aiConversationSessionSchema.index({ userId: 1, status: 1, updatedAt: -1 });

// Index for cost analytics
aiConversationSessionSchema.index({ createdAt: -1, 'tokenUsage.totalTokens': -1 });

module.exports = mongoose.model('AIConversationSession', aiConversationSessionSchema);
