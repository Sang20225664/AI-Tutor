const axios = require('axios');
const lessonService = require('../services/lessonService');

const lessonController = {
    async getAll(req, res) {
        try {
            const lessons = await lessonService.getAll(req.query);
            res.json({ success: true, data: lessons, count: lessons.length });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getById(req, res) {
        try {
            const lesson = await lessonService.getById(req.params.id);
            if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

            // FIRE AND FORGET: Cập nhật tiến độ học tập (Progress) Async
            if (req.user && req.user.userId) {
                const assessmentUrl = process.env.ASSESSMENT_SERVICE_URL || 'http://assessment:3003';
                // Push request báo hiệu đã đọc bài mà không cần await (BullMQ/Internal API)
                axios.post(`${assessmentUrl}/api/v1/progress/lesson/${lesson._id}`, {}, {
                    headers: { Authorization: req.headers.authorization },
                    timeout: 1000
                }).catch(err => console.error("Lỗi cập nhật tiến độ ngầm:", err.message));
            }

            res.json({ success: true, data: lesson });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getSuggestions(req, res) {
        try {
            const suggestions = await lessonService.getSuggestions(req.query);
            res.json({ success: true, data: suggestions, count: suggestions.length });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Internal endpoint — AI service calls this to get full lesson content
    async getLessonInternal(req, res) {
        try {
            const Lesson = require('../models/Lesson');
            const lesson = await Lesson.findById(req.params.id);
            if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
            res.json({ success: true, data: lesson });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = lessonController;
