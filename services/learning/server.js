require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./src/config/logger');

const subjectRoutes = require('./src/routes/subjectRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
const quizController = require('./src/controllers/quizController');
const Subject = require('./src/models/Subject');
const Lesson = require('./src/models/Lesson');
const Quiz = require('./src/models/Quiz');
const LessonSuggestion = require('./src/models/LessonSuggestion');

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

// Internal API — service-to-service
const lessonController = require('./src/controllers/lessonController');
app.get('/internal/quizzes/:id', quizController.getByIdInternal);
app.post('/internal/quizzes', quizController.createQuiz);          // AI Service saves quiz
app.get('/internal/lessons/:id', lessonController.getLessonInternal); // AI Service fetches lesson

async function ensureIndexes() {
    const indexTasks = [
        { name: 'Subject', model: Subject },
        { name: 'Lesson', model: Lesson },
        { name: 'Quiz', model: Quiz },
        { name: 'LessonSuggestion', model: LessonSuggestion }
    ];

    for (const { name, model } of indexTasks) {
        try {
            await model.createIndexes();
            logger.info(`[Index] ${name}: indexes ensured`);
        } catch (error) {
            logger.warn(`[Index] ${name}: ensure failed - ${error.message}`);
        }
    }
}

// Connect to MongoDB and start server
mongoose.set('strictQuery', false);
mongoose
    .connect(process.env.MONGO_URI, {
        autoIndex: true
    })
    .then(async () => {
        console.log('📚 Learning Service Started');
        console.log('📊 Port: %s', PORT);
        console.log('💾 MongoDB: Connected');

        await ensureIndexes();

        app.listen(PORT, '0.0.0.0', () => {
            console.log('✅ Listening on port %s', PORT);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });
