const mongoose = require("mongoose");

const lessonSuggestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    subjectName: { type: String },
    grade: { type: Number, required: true }, // Chỉ cho 1 lớp cụ thể
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    topics: [{ type: String }],
    duration: { type: Number }, // Thời lượng dự kiến (phút)
    icon: { type: String, default: "lightbulb" }, // Icon suggestion
    color: { type: String, default: "#FFC107" }, // Màu card
    lessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }], // Danh sách bài học liên quan
    order: { type: Number, default: 0 }, // Thứ tự hiển thị
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LessonSuggestion", lessonSuggestionSchema);
