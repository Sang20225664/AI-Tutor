const subjectService = require('../services/subjectService');

const subjectController = {
    async getAll(req, res) {
        try {
            const subjects = await subjectService.getAll();
            res.json({ success: true, data: subjects, count: subjects.length });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getById(req, res) {
        try {
            const subject = await subjectService.getById(req.params.id);
            if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
            res.json({ success: true, data: subject });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = subjectController;
