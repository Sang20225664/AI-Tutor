const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const dbName = process.env.MONGO_DB_NAME || 'learning_db';

if (!mongoUri) {
  console.error('MONGO_URI or MONGODB_URI is required');
  process.exit(1);
}

mongoose.connect(mongoUri, { dbName })
  .then(async () => {
    const subjects = await mongoose.connection.db.collection('subjects').find({}).toArray();
    console.log(`Subjects in ${dbName}:`, subjects.length);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
