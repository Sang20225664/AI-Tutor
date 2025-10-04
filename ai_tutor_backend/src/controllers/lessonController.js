const Lesson = require('../models/lesson');
const User = require('../models/user'); // Nếu có

const getLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find();
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy danh sách bài học" });
    }
};

const createLesson = async (req, res) => {
    try {
        const { title, content } = req.body;
        const newLesson = new Lesson({ title, content });
        await newLesson.save();
        res.status(201).json(newLesson);
    } catch (error) {
        res.status(500).json({ error: "Lỗi tạo bài học" });
    }
};

module.exports = { getLessons, createLesson };
