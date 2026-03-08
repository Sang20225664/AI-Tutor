const axios = require('axios');
const Progress = require('../models/Progress');

const LEARNING_SERVICE_URL = process.env.LEARNING_SERVICE_URL || 'http://localhost:3002';

const progressController = {
    // Internal helper called by attemptController when a quiz is submitted
    async internalUpdateProgress(userId, lessonId, quizScore) {
        let progress = await Progress.findOne({ userId, lessonId });

        if (!progress) {
            progress = new Progress({ userId, lessonId, completionPercent: 0, attempts: 0 });
        }

        progress.completionPercent = 100;
        progress.quizScore = quizScore;
        progress.attempts += 1;
        progress.lastAccessedAt = new Date();

        await progress.save();
        console.log(`Progress updated for user ${userId}, lesson ${lessonId}, score: ${quizScore}`);
        return progress;
    },

    /**
     * POST /api/v1/progress/lesson/:lessonId
     * Create or update progress for a lesson (called on lesson view)
     */
    async getOrCreateProgress(req, res) {
        try {
            const { lessonId } = req.params;
            const userId = req.user.userId;

            // Fetch lesson to ensure it exists
            try {
                const url = `${LEARNING_SERVICE_URL}/api/v1/lessons/${lessonId}`;
                await axios.get(url, { timeout: 3000 });
            } catch (err) {
                return res.status(404).json({ success: false, message: 'Lesson not found' });
            }

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
            } else {
                progress.lastAccessedAt = new Date();
                await progress.save();
            }

            res.json({ success: true, data: progress });
        } catch (error) {
            console.error('getOrCreateProgress failed:', error.message);
            res.status(500).json({ success: false, message: 'Failed to track progress' });
        }
    },

    /**
     * GET /api/v1/progress/summary - Dashboard API
     * Returns overall learning statistics
     */
    async getProgressSummary(req, res) {
        try {
            const userId = req.user.userId;
            const rawProgressRecords = await Progress.find({ userId }).sort({ lastAccessedAt: -1 }).lean();

            // Fetch lessons from Learning Service
            let allLessons = [];
            try {
                const resLessons = await axios.get(`${LEARNING_SERVICE_URL}/api/v1/lessons`, { timeout: 5000 });
                allLessons = resLessons.data.data || [];
            } catch (err) {
                console.error('Failed to fetch lessons for progress summary:', err.message);
            }

            const progressRecords = rawProgressRecords.map(p => {
                const matchingLesson = allLessons.find(l => l._id.toString() === p.lessonId.toString());
                if (matchingLesson) {
                    p.lessonId = {
                        _id: matchingLesson._id,
                        title: matchingLesson.title,
                        subjectName: matchingLesson.subjectName,
                        grade: matchingLesson.grade,
                        difficulty: matchingLesson.difficulty
                    };
                } else {
                    p.lessonId = null;
                }
                return p;
            });

            // Calculate statistics
            const totalLessons = progressRecords.length;
            const completedLessons = progressRecords.filter(p => p.completionPercent === 100).length;
            const inProgressLessons = progressRecords.filter(p => p.completionPercent > 0 && p.completionPercent < 100).length;

            const scoresAvailable = progressRecords.filter(p => p.quizScore !== null && p.quizScore !== undefined);
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
                if (progress.quizScore !== null && progress.quizScore !== undefined) {
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

            const recentActivity = progressRecords.slice(0, 5).map(p => ({
                lessonId: p.lessonId?._id,
                lessonTitle: p.lessonId?.title,
                subjectName: p.lessonId?.subjectName,
                completionPercent: p.completionPercent,
                quizScore: p.quizScore,
                lastAccessedAt: p.lastAccessedAt
            }));

            res.json({
                success: true,
                data: {
                    overview: {
                        totalLessons,
                        completedLessons,
                        inProgressLessons,
                        averageScore,
                        completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
                    },
                    subjectsProgress: Object.values(subjectsProgress),
                    recentActivity
                }
            });
        } catch (error) {
            console.error('getProgressSummary failed:', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch progress summary' });
        }
    },

    /**
     * GET /api/v1/progress/lesson/:lessonId
     */
    async getProgressByLesson(req, res) {
        try {
            const { lessonId } = req.params;
            const userId = req.user.userId;

            const progress = await Progress.findOne({ userId, lessonId });
            res.json({ success: true, data: progress || null });
        } catch (error) {
            console.error('getProgressByLesson failed:', error.message);
            res.status(500).json({ success: false, message: 'Failed to fetch progress' });
        }
    }
};

module.exports = progressController;
