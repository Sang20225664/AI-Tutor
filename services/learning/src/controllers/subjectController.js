const subjectService = require('../services/subjectService');

const subjectController = {
    async getAll(req, res) {
        try {
            const { grade } = req.query;

            if (grade !== undefined) {
                const parsedGrade = Number(grade);
                if (!Number.isInteger(parsedGrade) || parsedGrade < 1 || parsedGrade > 12) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid grade. Expected integer between 1 and 12.'
                    });
                }
            }

            const subjects = await subjectService.getAll(req.query);
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
