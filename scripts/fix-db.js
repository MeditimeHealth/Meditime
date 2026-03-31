const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://laptopsakku_db_user:gd2QHCUtV50N95tZ@meditime.4ebe8ls.mongodb.net/?appName=meditime';

async function fix() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('Fetching indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // List of indexes to drop if they exist
    const indexesToDrop = ['phoneNumber_1', 'username_1', 'affiliateCode_1'];

    for (const indexName of indexesToDrop) {
      if (indexes.some(idx => idx.name === indexName)) {
        console.log(`Dropping index: ${indexName}...`);
        await collection.dropIndex(indexName);
        console.log(`Dropped ${indexName}.`);
      } else {
        console.log(`Index ${indexName} not found, skipping.`);
      }
    }

    // Now, let's also check for existing duplicate nulls and delete them if they exist?
    // Actually, it's safer to just drop the index and let the app recreate it as a partial index.
    
    console.log('Cleanup complete. Mongoose will recreate indexes as partial indexes on next app interaction.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fix();
