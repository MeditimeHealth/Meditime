import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

async function fix() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected.');

    const db = mongoose.connection.db;
    const collection = db!.collection('users');

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

    console.log('Cleanup complete. Mongoose will recreate indexes on next app start.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fix();
