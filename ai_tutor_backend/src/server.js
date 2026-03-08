require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require('./config/logger');

// Version info for CD pipeline tracking
const APP_VERSION = "1.0.0";
const BUILD_TIME = new Date().toISOString();

// Import routes from domain folders
const authProxy = require("./proxies/authProxy");
const learningProxy = require("./proxies/learningProxy");
const assessmentProxy = require("./proxies/assessmentProxy");
const aiChatProxy = require("./proxies/aiChatProxy");

// Import shared middleware
const auth = require("./middleware/auth");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

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

// === Structured request logger (attaches requestId, logs on finish) ===
app.use(requestLogger);

// === Custom request logging for demo/visibility ===
const os = require('os');
const podHostname = os.hostname();

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] [POD: ${podHostname}] ${req.method} ${req.path}`;

  // Write to stderr (which is captured by kubectl logs)
  process.stderr.write(logMsg + ' - START\n');

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    process.stderr.write(logMsg + ` - ${res.statusCode} - END\n`);
    return originalSend.call(this, data);
  };

  next();
});

// === Start Server immediately (no DB connection needed for Gateway) ===
logger.info('🚀 API Gateway Started Successfully');
logger.info('📊 Gateway: http://%s:%s', HOST, PORT);
logger.info('🌍 Environment: %s', process.env.NODE_ENV);
logger.info('%s', '─'.repeat(50));

// === Routes (domain-organized) ===
// Auth domain
app.use("/api/users", authProxy);

// Learning domain (proxied to Learning Service)
app.use("/api", learningProxy);

// Learning domain — quiz POST submission stays in monolith (assessment logic)
// Assessment domain handled by Proxy
app.use("/api", assessmentProxy);

// AI/Chat domain (proxied to AI Chat Service)
app.use("/api", aiChatProxy);

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
      chatHistory: "/api/chat-history"
    },
  });
});

// --- Health check for K8s liveness/readiness probes ---
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    service: "api-gateway"
  });
});

// Health check endpoint
app.get("/api/ping", (req, res) => {
  res.json({
    success: true,
    message: "API Gateway is running!",
    timestamp: new Date().toISOString()
  });
});

// Readiness: Gateway is always ready if process is running
app.get('/api/ready', (req, res) => {
  return res.json({
    ready: true,
    message: 'API Gateway OK'
  });
});



// === Global Error Handler (must be LAST) ===
app.use(errorHandler);

// === Start Server ===
app.listen(PORT, HOST, () => {
  logger.info(`Server is listening on ${HOST}:${PORT}`);
});

