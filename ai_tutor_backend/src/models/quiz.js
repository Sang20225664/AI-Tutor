const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    subjectName: { type: String }, // Denormalized for quick access
    grade: [{ type: Number }], // Grades this quiz is for
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        answer: { type: Number, required: true }, // Index of correct answer (0-based)
        explanation: { type: String } // Optional explanation for the answer
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Quiz", quizSchema);
