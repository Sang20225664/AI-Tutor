const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: {
        type: String,
        enum: ['chat', 'quiz', 'adaptive_quiz', 'flashcard', 'summary', 'suggestion'],
        default: 'chat',
        required: true
    },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: false },
    requestId: { type: String, required: false },
    model: { type: String, required: false },
    cached: { type: Boolean, default: false },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for fast querying and quota checks
usageSchema.index({ userId: 1, createdAt: -1 });
usageSchema.index({ type: 1, createdAt: -1 });
usageSchema.index({ conversationId: 1 });
usageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Usage', usageSchema);
