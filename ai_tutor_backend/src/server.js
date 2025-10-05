require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// === Initialize app ===
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
const MONGO_URI = process.env.MONGO_URI;

// === Middleware ===
app.use(express.json({ limit: "10mb" }));
app.use(helmet());
app.use(morgan("dev"));

// --- CORS setup ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["*"],
  })
);

// === MongoDB Connection ===
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`✅ MongoDB Connected: ${MONGO_URI}`))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// === Routes ===
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/chat-history", require("./routes/chatHistoryRoutes"));
app.use("/api/gemini", require("./routes/geminiRoutes"));

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
app.get("/api/test", (req, res) => {
  res.json({ status: "success", message: "API is working" });
});

// --- Ping route ---
app.get("/api/ping", (req, res) => {
  console.log("✅ Backend received ping from frontend");
  res.status(200).json({ success: true, message: "Pong from Backend" });
});

// --- Test Gemini API ---
app.post("/api/test-gemini", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = req.body.message || "Xin chào! Hãy tự giới thiệu bằng tiếng Việt.";
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({
      success: true,
      message: "Gemini API is working!",
      response: text,
      apiKey: process.env.GEMINI_API_KEY ? "✅ API Key is set" : "⚠️ Missing API Key",
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

// === Global Error Handler ===
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// === Start Server ===
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log("MongoDB URI:", MONGO_URI ? MONGO_URI.substring(0, 25) + "..." : "undefined");
});
