const mongoose = require('mongoose');

/**
 * AIConversationMessage Collection
 * Individual messages within a conversation session
 * Separated for better query performance and scalability
 */
const aiConversationMessageSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AIConversationSession',
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 10000
    },
    tokenCount: {
        type: Number,
        default: 0
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false // Only need createdAt for messages
});

// Compound index for retrieving conversation history
aiConversationMessageSchema.index({ sessionId: 1, createdAt: 1 });

// Index for pagination
aiConversationMessageSchema.index({ sessionId: 1, _id: -1 });

module.exports = mongoose.model('AIConversationMessage', aiConversationMessageSchema);
