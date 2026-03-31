const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    subjectName: { type: String }, // Denormalized for quick access
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }, // Link to source lesson (AI quizzes)
    grade: [{ type: Number }], // Grades this quiz is for
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    generatedBy: { type: String, enum: ["seed", "AI", "AI-Adaptive"], default: "seed" }, // Origin of the quiz
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        answer: { type: Number, required: true }, // Index of correct answer (0-based)
        explanation: { type: String } // Optional explanation for the answer
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Cosmos DB (Mongo API): support ORDER BY createdAt with common filters
quizSchema.index({ createdAt: -1 });
quizSchema.index({ subjectId: 1, createdAt: -1 });
quizSchema.index({ subjectName: 1, createdAt: -1 });
quizSchema.index({ grade: 1, createdAt: -1 });

module.exports = mongoose.model("Quiz", quizSchema);
