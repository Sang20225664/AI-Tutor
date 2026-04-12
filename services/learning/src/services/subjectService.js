const Subject = require('../models/Subject');

const subjectService = {
    async getAll(query = {}) {
        const filter = {};

        if (query.grade !== undefined) {
            filter.grade = { $in: [Number(query.grade)] };
        }

        return Subject.find(filter).sort({ name: 1 });
    },

    async getById(id) {
        return Subject.findById(id);
    },

    async create(data) {
        return Subject.create(data);
    }
};

module.exports = subjectService;
