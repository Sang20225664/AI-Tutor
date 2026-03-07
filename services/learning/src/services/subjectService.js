const Subject = require('../models/Subject');

const subjectService = {
    async getAll() {
        return Subject.find().sort({ name: 1 });
    },

    async getById(id) {
        return Subject.findById(id);
    },

    async create(data) {
        return Subject.create(data);
    }
};

module.exports = subjectService;
