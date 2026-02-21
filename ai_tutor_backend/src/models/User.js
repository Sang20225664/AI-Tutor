const mongoose = require('mongoose');

/**
 * User Model - V2 Schema
 * Enhanced with role, status, grade, and AI usage tracking
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
        index: true
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true, // allows multiple null values (users without email)
        trim: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'teacher'],
        default: 'student',
        index: true
    },
    grade: {
        type: Number,
        min: 10,
        max: 12,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'banned', 'inactive'],
        default: 'active',
        index: true
    },
    avatar: {
        type: String,
        default: ''
    },
    fullName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    // AI Usage Tracking
    aiUsage: {
        totalCalls: { type: Number, default: 0 },
        totalTokens: { type: Number, default: 0 },
        estimatedCost: { type: Number, default: 0 } // in USD cents
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for common queries
userSchema.index({ role: 1, status: 1 });
userSchema.index({ grade: 1 });

module.exports = mongoose.model('User', userSchema);

