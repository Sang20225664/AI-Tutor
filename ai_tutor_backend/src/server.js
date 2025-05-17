require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/mongoose");
const userRoutes = require("./routes/userRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

// Kết nối MongoDB
connectDB();

// Middleware
app.use(express.json());

app.use(cors()); // Cho phép truy cập từ frontend
app.use(helmet()); // Tăng cường bảo mật HTTP headers
app.use(morgan("dev")); // Logging request

// Định nghĩa API routes
app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/chats", chatRoutes);

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
    console.error("Lỗi Server:", err.message);
    res.status(500).json({ success: false, message: "Lỗi Server!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));
console.log("Đang kết nối tới MongoDB với URI:", process.env.MONGO_URI);
