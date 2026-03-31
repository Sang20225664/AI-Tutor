const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    subjectName: { type: String }, // Denormalized for quick access
    grade: [{ type: Number }], // Grades this lesson is for
    topics: [{ type: String }], // Topics covered in this lesson
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    duration: { type: Number, default: 0 }, // Estimated duration in minutes
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Cosmos DB (Mongo API): support ORDER BY createdAt with common filters
lessonSchema.index({ createdAt: -1 });
lessonSchema.index({ subjectId: 1, createdAt: -1 });
lessonSchema.index({ subjectName: 1, createdAt: -1 });
lessonSchema.index({ grade: 1, createdAt: -1 });

module.exports = mongoose.model("Lesson", lessonSchema);
