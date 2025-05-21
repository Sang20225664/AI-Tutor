require("dotenv").config(); // Sửa đường dẫn .env
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose"); // Thêm dòng này
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const geminiRoutes = require("./routes/geminiRoute");

// Initialize the app
const app = express();
const mongoURI = process.env.MONGO_URI;

// Middleware
app.use(express.json({ extended: false }));
app.use(cors({
  origin: ['http://localhost', 'http://your-flutter-app-ip', 'http://10.0.2.2'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan("dev"));
app.use("api/gemini", geminiRoutes);

mongoose.connect(mongoURI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));

// Test route
app.get("/api/test", (req, res) => {
  res.json({ status: "success", message: "API is working" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ success: false, message: "Server Error!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Chỉ hiển thị 10 ký tự đầu của MONGO_URI để bảo mật
  console.log("MongoDB URI:", process.env.MONGO_URI?.substring(0, 10) + "...");
});