const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    icon: { type: String, required: true }, // Icon name from Material Icons
    color: { type: String, required: true }, // Hex color code
    description: { type: String },
    grade: [{ type: Number }], // Grades this subject is for (1-12)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Subject", subjectSchema);
