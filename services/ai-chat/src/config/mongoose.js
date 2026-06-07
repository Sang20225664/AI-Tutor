const mongoose = require('mongoose');

const connectDB = async (retries = 5, delayMs = 3000) => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(MONGO_URI, {
                dbName: 'ai_chat_db',
                serverSelectionTimeoutMS: 10000,
                autoIndex: true,
                maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 10,
            });
            console.log('✅ Connected to MongoDB (AI Chat DB)');
            return;
        } catch (err) {
            console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
            if (attempt === retries) {
                console.error('❌ All MongoDB connection attempts exhausted. Exiting.');
                process.exit(1);
            }
            const wait = delayMs * attempt;
            console.log(`🔄 Retrying in ${wait / 1000}s...`);
            await new Promise(r => setTimeout(r, wait));
        }
    }
};

module.exports = connectDB;
