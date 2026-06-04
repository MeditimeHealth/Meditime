import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not defined in environment');
    }
    await mongoose.connect(uri);
    const result = await mongoose.connection.db.collection('doctors').deleteMany({});
    console.log(`Deleted ${result.deletedCount} doctor documents`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error deleting doctors:', err);
    process.exit(1);
  }
})();
