require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const logger = require('./src/config/logger');

const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin, credentials: true }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, req);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        service: 'auth',
        status: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Internal endpoint — other services call this to verify JWT tokens
app.get('/internal/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false, message: 'No token provided' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ valid: false, message: 'Invalid token' });
    }
});

// Routes
app.use('/api/auth', userRoutes);

// Connect to MongoDB and start server
mongoose.set('strictQuery', false);
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('🔐 Auth Service Started');
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
