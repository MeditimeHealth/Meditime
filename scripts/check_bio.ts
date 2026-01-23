
import fs from 'fs';
import path from 'path';
import dbConnect from '../lib/mongodb';
import Doctor from '../models/Doctor';

async function main() {
  try {
    // Load env vars manually
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }

    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in .env.local');
      process.exit(1);
    }

    await dbConnect();
    console.log('Connected to MongoDB');

    const doctors = await Doctor.find({}).select('name bio specialty');
    console.log(`Found ${doctors.length} doctors`);
    
    doctors.forEach(doc => {
      console.log('---------------------------------------------------');
      console.log(`Name: ${doc.name}`);
      console.log(`Specialty: ${doc.specialty}`);
      console.log(`Bio length: ${doc.bio ? doc.bio.length : 0}`);
      console.log(`Bio content: ${doc.bio ? doc.bio.substring(0, 50) + '...' : 'N/A'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
