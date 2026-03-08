const express = require('express');
const cors = require('cors');
require('dotenv').config();
const logger = require('./src/config/logger');

// Database Config
const connectDB = require('./src/config/mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, req);
    next();
});

// Routes Placeholder
const aiRoutes = require('./src/routes/ai.routes');
app.use('/api/v1/ai', aiRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'ai-chat-service' });
});

app.get('/ready', (req, res) => {
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
        res.status(200).json({ status: 'Ready', database: 'connected' });
    } else {
        res.status(503).json({ status: 'Not Ready', database: 'disconnected' });
    }
});

const PORT = process.env.PORT || 3004;

// Connect to DB and Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 AI Chat Service running on port ${PORT}`);
    });
});
