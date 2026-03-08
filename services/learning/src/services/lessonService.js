const Lesson = require('../models/Lesson');
const LessonSuggestion = require('../models/LessonSuggestion');

const lessonService = {
    async getAll(query = {}) {
        const filter = {};
        if (query.subjectId) filter.subjectId = query.subjectId;
        if (query.subjectName) filter.subjectName = query.subjectName;
        if (query.grade) filter.grade = Number(query.grade);
        return Lesson.find(filter).populate('subjectId', 'name icon color').sort({ createdAt: -1 });
    },

    async getById(id) {
        return Lesson.findById(id).populate('subjectId', 'name icon color description');
    },

    async create(data) {
        return Lesson.create(data);
    },

    // Suggestions (merged into lesson service per review)
    async getSuggestions(query = {}) {
        const filter = {};
        if (query.subjectId) filter.subjectId = query.subjectId;
        if (query.grade) filter.grade = Number(query.grade);
        return LessonSuggestion.find(filter).populate('subjectId', 'name icon color').sort({ order: 1 });
    }
};

module.exports = lessonService;
