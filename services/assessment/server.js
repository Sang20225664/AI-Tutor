require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const assessmentRoutes = require('./src/routes/assessmentRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(cors());

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

// Public API routes
app.use('/api/v1', assessmentRoutes);

// Connect to MongoDB and start server
mongoose.set('strictQuery', false);
mongoose
    .connect(process.env.MONGO_URI)
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
