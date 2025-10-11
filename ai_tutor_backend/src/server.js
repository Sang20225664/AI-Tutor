require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import routes
const geminiRoutes = require("./routes/geminiRoutes");
const userRoutes = require("./routes/userRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const chatRoutes = require("./routes/chatRoutes");
const chatHistoryRoutes = require("./routes/chatHistoryRoutes");

// === Initialize app ===
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
const MONGO_URI = process.env.MONGO_URI;

// === Middleware ===
app.use(express.json({ limit: "10mb" }));

// COMPLETELY DISABLE HELMET FOR DEVELOPMENT
if (process.env.NODE_ENV === 'development') {
  // Don't use helmet at all in development
  console.log('🔓 Helmet disabled for development');
} else {
  app.use(helmet());
}

// AGGRESSIVE CORS SETUP FIRST
app.use((req, res, next) => {
  // Set CORS headers as early as possible
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "false");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Max-Age", "86400");

  // Handle preflight requests immediately
  if (req.method === "OPTIONS") {
    console.log(`✅ CORS preflight for ${req.url}`);
    return res.status(200).end();
  }

  next();
});

// Secondary CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins in development
    callback(null, true);
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*'],
}));

// Only show important requests in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}

// === MongoDB Connection ===
mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log(`🚀 AI Tutor Backend Started Successfully`);
    console.log(`📊 Server: http://${HOST}:${PORT}`);
    console.log(`💾 Database: Connected to MongoDB`);
    console.log(
      `🔑 Gemini API: ${process.env.GEMINI_API_KEY ? "✅ Configured" : "❌ Missing"
      }`
    );
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📋 Admin Panel: http://${HOST}:${PORT}/admin`);
    console.log("─".repeat(50));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// === Routes ===
app.use("/api/gemini", geminiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/chat-history", chatHistoryRoutes);

// --- Root route ---
app.get("/", (req, res) => {
  res.json({
    message: "AI Tutor Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      test: "/api/test",
      ping: "/api/ping",
      users: "/api/users",
      lessons: "/api/lessons",
      chats: "/api/chats",
      chatHistory: "/api/chat-history",
      gemini: "/api/gemini",
      testGemini: "/api/test-gemini",
    },
  });
});

// --- Test route ---
app.get("/api/test", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt =
      req.body.message || "Xin chào! Hãy tự giới thiệu bằng tiếng Việt.";
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({
      success: true,
      message: "Gemini API is working!",
      response: text,
      apiKey:
        process.env.GEMINI_API_KEY
          ? "✅ API Key is set"
          : "⚠️ Missing API Key",
    });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Gemini API failed",
      error: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/ping", (req, res) => {
  console.log(`🏓 Ping received from ${req.get('Origin') || 'unknown'}`);
  res.json({
    success: true,
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
    cors: "enabled"
  });
});

// --- Admin panel route (simple HTML) ---
app.get("/admin", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).send("Access denied");
  }

  try {
    const User = require("./models/User");
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>AI Tutor Admin</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .stats { background: #e7f3ff; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>AI Tutor Admin Panel</h1>
      
      <div class="stats">
        <h3> Thống kê</h3>
        <p><strong>Tổng số users:</strong> ${users.length}</p>
        <p><strong>Server:</strong> Running on port ${PORT}</p>
        <p><strong>Database:</strong> MongoDB connected</p>
      </div>

      <h3> Danh sách Users</h3>
      <table>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>Ngày tạo</th>
          <th>Last Login</th>
        </tr>
        ${users
        .map(
          (user) => `
          <tr>
            <td>${user._id}</td>
            <td>${user.username}</td>
            <td>${user.email || "N/A"}</td>
            <td>${new Date(user.createdAt).toLocaleString("vi-VN")}</td>
            <td>${user.lastLogin
              ? new Date(user.lastLogin).toLocaleString("vi-VN")
              : "Never"
            }</td>
          </tr>
        `
        )
        .join("")}
      </table>

      <div style="margin-top: 30px;">
        <h3>  API Endpoints</h3>
        <ul>
          <li><a href="/api/users">GET /api/users</a> - Danh sách users (JSON)</li>
          <li><a href="/api/users/stats">GET /api/users/stats</a> - Thống kê (JSON)</li>
          <li><a href="/api/ping">GET /api/ping</a> - Test ping</li>
          <li><a href="/api/gemini/test">GET /api/gemini/test</a> - Test Gemini</li>
        </ul>
      </div>
    </body>
    </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).send("Error loading admin panel: " + error.message);
  }
});

// === Global Error Handler ===
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// === Start Server ===
app.listen(PORT, HOST, () => {
  // Startup message moved to MongoDB connection success
});

