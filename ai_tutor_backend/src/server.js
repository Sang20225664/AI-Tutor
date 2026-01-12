require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require('./config/logger');

// Version info for CD pipeline tracking
const APP_VERSION = "1.0.0";
const BUILD_TIME = new Date().toISOString();
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import routes
const apiRoutes = require("./routes/api");
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

// Morgan -> Winston stream (unify request logs)
const morganStream = {
  write: (message) => {
    // message already contains newline
    logger.info(message.trim());
  }
};

// Choose morgan format depending on environment
const morganFormat = process.env.MORGAN_FORMAT || (process.env.NODE_ENV === 'production' ? 'combined' : 'dev');
app.use(morgan(morganFormat, { stream: morganStream }));

// === Auto-seed function ===
async function autoSeedDatabase() {
  try {
    const Subject = require('./models/subject');
    const count = await Subject.countDocuments();

    if (count === 0) {
      console.log('📦 Database is empty, running auto-seed...');
      const seedDatabase = require('./seedData');
      await seedDatabase();
      console.log('✅ Auto-seed completed!');
    } else {
      console.log(`✅ Database already has ${count} subjects, skipping seed`);
    }
  } catch (error) {
    console.error('⚠️  Auto-seed failed:', error.message);
  }
}

// === MongoDB Connection ===
mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URI, {})
  .then(async () => {
    logger.info('🚀 AI Tutor Backend Started Successfully');
    logger.info('📊 Server: http://%s:%s', HOST, PORT);
    logger.info('💾 Database: Connected to MongoDB');
    logger.info('🔑 Gemini API: %s', process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing');
    logger.info('🌍 Environment: %s', process.env.NODE_ENV);
    logger.info('📋 Admin Panel: http://%s:%s/admin', HOST, PORT);
    logger.info('%s', '─'.repeat(50));

    // Auto-seed if database is empty
    await autoSeedDatabase();
  })
  .catch((err) => {
    logger.error('❌ MongoDB Connection Error: %s', err.message, { stack: err.stack });
    process.exit(1);
  });

// === Routes ===
// Use centralized API routes (includes subjects, quizzes, lessons)
app.use("/api", apiRoutes);

// Keep backward compatibility for existing routes
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/chat-history", chatHistoryRoutes);

// --- Root route ---
app.get("/", (req, res) => {
  res.json({
    message: "AI Tutor Backend API",
    version: APP_VERSION,
    buildTime: BUILD_TIME,
    status: "running",
    endpoints: {
      test: "/api/test",
      ping: "/api/ping",
      health: "/health",
      users: "/api/users",
      lessons: "/api/lessons",
      chats: "/api/chats",
      chatHistory: "/api/chat-history",
      gemini: "/api/gemini",
      testGemini: "/api/test-gemini",
    },
  });
});

// --- Health check for K8s liveness/readiness probes ---
app.get("/health", (req, res) => {
  const healthcheck = {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  };

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ ...healthcheck, status: "unhealthy" });
  }

  res.json(healthcheck);
});

// --- Test route ---
app.get("/api/test", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

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
  logger.info('🏓 Ping received from %s', req.get('Origin') || 'unknown');
  res.json({
    success: true,
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
    cors: "enabled"
  });
});

// Readiness: check MongoDB connection only 
app.get('/api/ready', (req, res) => {
  const state = mongoose.connection.readyState; // 0 disconnected,1 connected,2 connecting,3 disconnecting
  const ready = state === 1;

  logger.info('🔎 Readiness check: mongoose.readyState=%d', state);

  if (!ready) {
    return res.status(503).json({
      ready: false,
      dbState: state,
      message: 'MongoDB not connected'
    });
  }

  return res.json({
    ready: true,
    dbState: state,
    message: 'OK'
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
  // Log error with request context when available
  const meta = {
    url: req.originalUrl,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.body
  };
  logger.error('Server Error: %s', err.message, { stack: err.stack, ...meta });
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// === Start Server ===
app.listen(PORT, HOST, () => {
  // Startup message moved to MongoDB connection success
});

