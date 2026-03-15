const axios = require('axios');
const QuizAttempt = require('../models/QuizAttempt');

const LEARNING_SERVICE_URL = process.env.LEARNING_SERVICE_URL || 'http://localhost:3002';

const analysisController = {
    /**
     * GET /api/v1/analysis/weak-topics
     * Returns a list of weak topics for the user (accuracy < 60%)
     */
    async getWeakTopics(req, res) {
        try {
            const userId = req.user?.userId || req.headers['x-user-id'];
            
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized: Missing User ID' });
            }

            // 1. Fetch all attempts for the user
            const attempts = await QuizAttempt.find({ userId }).lean();

            if (!attempts.length) {
                return res.json({ success: true, data: [] });
            }

            // 2. Calculate average score per quizId
            const quizScores = {};
            attempts.forEach(attempt => {
                const qid = attempt.quizId.toString();
                if (!quizScores[qid]) {
                    quizScores[qid] = { totalScore: 0, count: 0 };
                }
                quizScores[qid].totalScore += attempt.score;
                quizScores[qid].count += 1;
            });

            // 3. Map quizId -> lessonId via Learning Service internal API
            const lessonStats = {};
            const quizIds = Object.keys(quizScores);
            for (const qid of quizIds) {
                try {
                    const response = await axios.get(`${LEARNING_SERVICE_URL}/internal/quizzes/${qid}`, { timeout: 3000 });
                    if (response.data && response.data.found && response.data.quiz) {
                        const quizData = response.data.quiz;
                        if (quizData.lessonId) {
                            const lid = quizData.lessonId.toString();
                            if (!lessonStats[lid]) {
                                lessonStats[lid] = {
                                    lessonId: lid,
                                    lessonTitle: (quizData.title || '').replace(/^Quiz:\s*/, '').replace(/^AI Quiz — /, ''),
                                    totalScore: 0,
                                    count: 0
                                };
                            }
                            lessonStats[lid].totalScore += quizScores[qid].totalScore;
                            lessonStats[lid].count += quizScores[qid].count;
                        }
                    }
                } catch (err) {
                    console.warn(`Could not fetch quiz ${qid} for weak topic analysis: ${err.message}`);
                }
            }

            // 4. Calculate final accuracy per lesson and filter < 60%
            const weakTopics = [];
            for (const lid in lessonStats) {
                const stat = lessonStats[lid];
                const accuracy = Math.round(stat.totalScore / stat.count);
                
                if (accuracy < 60) {
                    weakTopics.push({
                        lessonId: stat.lessonId,
                        lessonTitle: stat.lessonTitle,
                        accuracy
                    });
                }
            }

            // Sort by lowest accuracy first
            weakTopics.sort((a, b) => a.accuracy - b.accuracy);

            res.json({
                success: true,
                data: weakTopics
            });

        } catch (error) {
            console.error('getWeakTopics failed:', error);
            res.status(500).json({ success: false, message: 'Failed to analyze weak topics' });
        }
    }
};

module.exports = analysisController;
