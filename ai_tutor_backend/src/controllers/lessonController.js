const Lesson = require('../models/lesson');
const User = require('../models/User'); // Fixed path - capital U

const getLessons = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Lessons endpoint working",
            lessons: []
        });
    } catch (error) {
        console.error('Get lessons error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy lessons'
        });
    }
};

const createLesson = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Create lesson endpoint working"
        });
    } catch (error) {
        console.error('Create lesson error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo lesson'
        });
    }
};

module.exports = {
    getLessons,
    createLesson
};
