require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./src/config/logger');

const subjectRoutes = require('./src/routes/subjectRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
const quizController = require('./src/controllers/quizController');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, req);
    next();
});

// Health check — process alive
app.get('/health', (req, res) => {
    res.json({
        service: 'learning',
        status: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Readiness — DB connected (for K8s readiness probe)
app.get('/ready', (req, res) => {
    if (mongoose.connection.readyState === 1) {
        res.json({ ready: true });
    } else {
        res.status(503).json({ ready: false });
    }
});

// Public API routes
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/quizzes', quizRoutes);

// Internal API — service-to-service (Assessment calls this)
app.get('/internal/quizzes/:id', quizController.getByIdInternal);

// Connect to MongoDB and start server
mongoose.set('strictQuery', false);
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('📚 Learning Service Started');
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
