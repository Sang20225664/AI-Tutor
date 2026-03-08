const Quiz = require('../models/Quiz');

const quizService = {
    async getAll(query = {}) {
        const filter = {};
        if (query.subjectId) filter.subjectId = query.subjectId;
        if (query.subjectName) filter.subjectName = query.subjectName;
        if (query.grade) filter.grade = Number(query.grade);
        return Quiz.find(filter).populate('subjectId', 'name icon color').sort({ createdAt: -1 });
    },

    async getById(id) {
        return Quiz.findById(id).populate('subjectId', 'name icon color');
    },

    async create(data) {
        return Quiz.create(data);
    }
};

module.exports = quizService;
