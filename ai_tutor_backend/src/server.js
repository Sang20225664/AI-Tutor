require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/mongoose");

// Khởi tạo app
const app = express();

// Kết nối MongoDB
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ success: false, message: "Server Error!" });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("MongoDB URI:", process.env.MONGO_URI);
});