/**
 * fix-location-objectids.js
 *
 * One-time migration: converts plain string ObjectId references
 * to proper BSON ObjectId types in the districts and thanas collections.
 *
 * Run:  node scripts/fix-location-objectids.js
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set in .env.local');
  process.exit(1);
}

async function fixCollection(db, collectionName, foreignKeyField) {
  const collection = db.collection(collectionName);
  const docs = await collection.find({}).toArray();

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const doc of docs) {
    const rawValue = doc[foreignKeyField];

    // Already an ObjectId → skip
    if (rawValue instanceof ObjectId) {
      skipped++;
      continue;
    }

    // Plain string that looks like an ObjectId
    if (typeof rawValue === 'string' && ObjectId.isValid(rawValue)) {
      try {
        await collection.updateOne(
          { _id: doc._id },
          { $set: { [foreignKeyField]: new ObjectId(rawValue) } }
        );
        fixed++;
      } catch (err) {
        console.error(`  ✗ Failed to fix ${collectionName} doc ${doc._id}:`, err.message);
        errors++;
      }
    } else {
      console.warn(`  ⚠ ${collectionName} doc ${doc._id}: unexpected ${foreignKeyField} value:`, rawValue);
      skipped++;
    }
  }

  console.log(`  ${collectionName}.${foreignKeyField}: fixed=${fixed}, skipped=${skipped}, errors=${errors}`);
}

async function main() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    // Infer DB name from URI (last path segment before query string)
    const dbName = MONGODB_URI.split('/').pop().split('?')[0];
    const db = client.db(dbName);

    console.log(`Using database: ${dbName}\n`);

    console.log('Fixing districts.division ...');
    await fixCollection(db, 'districts', 'division');

    console.log('\nFixing thanas.district ...');
    await fixCollection(db, 'thanas', 'district');

    console.log('\nDone! Please restart your Next.js server.');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
