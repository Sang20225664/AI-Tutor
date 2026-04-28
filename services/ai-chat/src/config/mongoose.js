const mongoose = require('mongoose');

const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
    try {
        await mongoose.connect(MONGO_URI, {
            dbName: 'ai_chat_db',
            serverSelectionTimeoutMS: 10000,
            autoIndex: true,
        });
        console.log('✅ Connected to MongoDB (AI Chat DB)');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
