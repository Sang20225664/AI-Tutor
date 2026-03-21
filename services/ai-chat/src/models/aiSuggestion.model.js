const mongoose = require('mongoose');

const aiSuggestionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    grade: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    subjectName: { type: String, default: '' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    difficultyText: { type: String, default: 'Cơ bản' },
    duration: { type: Number, default: 30 },
    icon: { type: String, default: 'lightbulb' },
    backgroundColor: { type: String, default: '0xFFE3F2FD' },
    topics: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

// Index for fast retrieval: newest first per user
aiSuggestionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AiSuggestion', aiSuggestionSchema);
