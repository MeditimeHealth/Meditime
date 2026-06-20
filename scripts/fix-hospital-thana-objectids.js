import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixHospitalThanaStrings() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found in .env.local');

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const dbName = uri.split('/').pop()?.split('?')[0] || 'meditime';
    const db = client.db(dbName);
    const hospitals = db.collection('hospitals');

    // Find all hospitals where thana is a plain string (not already an ObjectId)
    const all = await hospitals.find({}).toArray();

    let converted = 0;
    let skipped = 0;
    let invalid = 0;

    for (const hospital of all) {
      const thana = hospital.thana;

      // Already an ObjectId — skip
      if (thana instanceof ObjectId) {
        skipped++;
        continue;
      }

      // Is a string that looks like a valid ObjectId hex
      if (typeof thana === 'string' && ObjectId.isValid(thana) && thana.length === 24) {
        await hospitals.updateOne(
          { _id: hospital._id },
          { $set: { thana: new ObjectId(thana) } }
        );
        console.log(`✓ Converted  "${hospital.name}"  thana: "${thana}" → ObjectId`);
        converted++;
      } else if (thana == null) {
        console.log(`⚠ No thana set for: "${hospital.name}" — skipping`);
        skipped++;
      } else {
        console.log(`✗ Invalid thana value for: "${hospital.name}" — value:`, thana);
        invalid++;
      }
    }

    console.log('\n─────────────────────────────────────────');
    console.log(`Total hospitals : ${all.length}`);
    console.log(`Converted       : ${converted}`);
    console.log(`Already ObjectId: ${skipped}`);
    console.log(`Invalid/skipped : ${invalid}`);
    console.log('─────────────────────────────────────────');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

fixHospitalThanaStrings();
