import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function recreateDoctors() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI not found');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const dbName =
      uri.split('/').pop()?.split('?')[0] || 'meditime';

    const db = client.db(dbName);
    const doctorsColl = db.collection('doctors');

    const doctors = await doctorsColl.find({}).toArray();

    console.log(`Found ${doctors.length} doctors`);

    if (!doctors.length) {
      console.log('No doctors found');
      return;
    }

    // Keep mapping
    const idMap = new Map();

    // Remove _id before insert
    const doctorsWithoutIds = doctors.map((doctor) => {
      const { _id, ...rest } = doctor;
      return rest;
    });

    const insertResult = await doctorsColl.insertMany(
      doctorsWithoutIds
    );

    const newIds = Object.values(insertResult.insertedIds);

    doctors.forEach((doctor, index) => {
      idMap.set(String(doctor._id), newIds[index]);
    });

    // Delete originals
    const oldIds = doctors.map((d) => d._id);

    const deleteResult = await doctorsColl.deleteMany({
      _id: { $in: oldIds },
    });

    console.log(
      `Deleted ${deleteResult.deletedCount} original doctors`
    );

    console.log(
      `Inserted ${newIds.length} doctors with fresh ObjectIds`
    );

    console.log('\nID Mapping:');

    for (const [oldId, newId] of idMap.entries()) {
      console.log(`${oldId} -> ${newId}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

recreateDoctors();