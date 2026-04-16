require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./src/config/logger');

const assessmentRoutes = require('./src/routes/assessmentRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin, credentials: true }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Health check — process alive
app.get('/health', (req, res) => {
    res.json({
        service: 'assessment',
        status: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Readiness — DB connected
app.get('/ready', (req, res) => {
    if (mongoose.connection.readyState === 1) {
        res.json({ ready: true });
    } else {
        res.status(503).json({ ready: false });
    }
});

// Public API routes (JWT auth required)
app.use('/api/v1', assessmentRoutes);

// Internal routes (no JWT auth — service-to-service only)
const analysisController = require('./src/controllers/analysisController');
app.get('/internal/analysis/weak-topics', analysisController.getWeakTopics);

// Connect to MongoDB and start server
mongoose.set('strictQuery', false);
mongoose
    .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
        console.log('📝 Assessment Service Started');
        console.log('📊 Port: %s', PORT);
        console.log('💾 MongoDB: Connected');
        app.listen(PORT, '0.0.0.0', () => {
            console.log('✅ Listening on port %s', PORT);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });
