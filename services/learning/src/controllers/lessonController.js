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
    }
};

module.exports = lessonController;
