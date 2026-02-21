const Progress = require('../models/Progress');
const Lesson = require('../models/lesson');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const { ok, notFound, serverError } = require('../utils/response');

/**
 * Progress Controller - Phase 2 Core
 * Handles lesson view tracking, progress updates, and dashboard analytics
 */

/**
 * Get or Create Progress (Auto-create on lesson view)
 * Called when user views a lesson
 */
const getOrCreateProgress = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user.userId;

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return notFound(res, 'Lesson');

        let progress = await Progress.findOne({ userId, lessonId });

        if (!progress) {
            progress = new Progress({
                userId,
                lessonId,
                completionPercent: 0,
                attempts: 0,
                lastAccessedAt: new Date()
            });
            await progress.save();
            logger.info('Progress created', { requestId: req.requestId, userId, lessonId });
        } else {
            progress.lastAccessedAt = new Date();
            await progress.save();
        }

        ok(res, progress, progress.completionPercent === 0 ? 'Progress tracked - lesson started' : 'Progress updated');
    } catch (error) {
        logger.error('getOrCreateProgress failed', { requestId: req.requestId, error: error.message, stack: error.stack });
        serverError(res, 'Failed to track progress');
    }
};

/**
 * Update Progress (Called after quiz submission)
 * Updates completion percentage and quiz score
 */
const updateProgress = async (userId, lessonId, quizScore) => {
    try {
        let progress = await Progress.findOne({ userId, lessonId });

        if (!progress) {
            progress = new Progress({ userId, lessonId, completionPercent: 0, attempts: 0 });
        }

        progress.completionPercent = 100;
        progress.quizScore = quizScore;
        progress.attempts += 1;
        progress.lastAccessedAt = new Date();

        await progress.save();

        logger.info('Progress updated', { userId, lessonId, quizScore, attempts: progress.attempts });

        return progress;
    } catch (error) {
        logger.error('updateProgress failed', { userId, lessonId, error: error.message, stack: error.stack });
        throw error;
    }
};

/**
 * Get Progress Summary (Dashboard API)
 * Returns user's overall learning statistics
 */
const getProgressSummary = async (req, res) => {
    try {
        const userId = req.user.userId;
        const progressRecords = await Progress.find({ userId })
            .populate('lessonId', 'title subjectName grade difficulty')
            .sort({ lastAccessedAt: -1 });

        // Calculate statistics
        const totalLessons = progressRecords.length;
        const completedLessons = progressRecords.filter(p => p.completionPercent === 100).length;
        const inProgressLessons = progressRecords.filter(p => p.completionPercent > 0 && p.completionPercent < 100).length;

        // Calculate average score (only for completed lessons with quiz scores)
        const scoresAvailable = progressRecords.filter(p => p.quizScore !== null);
        const averageScore = scoresAvailable.length > 0
            ? Math.round(scoresAvailable.reduce((sum, p) => sum + p.quizScore, 0) / scoresAvailable.length)
            : 0;

        // Group by subject
        const subjectsProgress = {};
        progressRecords.forEach(progress => {
            if (!progress.lessonId) return; // Skip if lesson was deleted

            const subjectName = progress.lessonId.subjectName;
            if (!subjectsProgress[subjectName]) {
                subjectsProgress[subjectName] = {
                    subjectName,
                    totalLessons: 0,
                    completedLessons: 0,
                    averageScore: 0,
                    scores: []
                };
            }

            subjectsProgress[subjectName].totalLessons++;
            if (progress.completionPercent === 100) {
                subjectsProgress[subjectName].completedLessons++;
            }
            if (progress.quizScore !== null) {
                subjectsProgress[subjectName].scores.push(progress.quizScore);
            }
        });

        // Calculate average score per subject
        Object.values(subjectsProgress).forEach(subject => {
            if (subject.scores.length > 0) {
                subject.averageScore = Math.round(
                    subject.scores.reduce((sum, score) => sum + score, 0) / subject.scores.length
                );
            }
            delete subject.scores; // Remove scores array from response
        });

        // Recent activity (last 5 lessons accessed)
        const recentActivity = progressRecords.slice(0, 5).map(p => ({
            lessonId: p.lessonId?._id,
            lessonTitle: p.lessonId?.title,
            subjectName: p.lessonId?.subjectName,
            completionPercent: p.completionPercent,
            quizScore: p.quizScore,
            lastAccessedAt: p.lastAccessedAt
        }));

        ok(res, {
            overview: {
                totalLessons,
                completedLessons,
                inProgressLessons,
                averageScore,
                completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
            },
            subjectsProgress: Object.values(subjectsProgress),
            recentActivity
        });
    } catch (error) {
        logger.error('getProgressSummary failed', { requestId: req.requestId, error: error.message, stack: error.stack });
        serverError(res, 'Failed to fetch progress summary');
    }
};

/**
 * Get Progress by Lesson (for frontend to check if user started/completed)
 */
const getProgressByLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user.userId;

        const progress = await Progress.findOne({ userId, lessonId });
        ok(res, progress || null);
    } catch (error) {
        logger.error('getProgressByLesson failed', { requestId: req.requestId, error: error.message, stack: error.stack });
        serverError(res, 'Failed to fetch progress');
    }
};

module.exports = {
    getOrCreateProgress,
    updateProgress, // Used internally by quiz controller
    getProgressSummary,
    getProgressByLesson
};
