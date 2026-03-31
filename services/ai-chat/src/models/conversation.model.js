const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, required: false },
    lessonId: { type: mongoose.Schema.Types.ObjectId, required: false },
    isPinned: { type: Boolean, default: false },
    messages: [messageSchema]
}, { timestamps: true });

// Cosmos DB (Mongo API) requires matching indexes for ORDER BY with filters
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, isPinned: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
