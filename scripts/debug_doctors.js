
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // 1. Load env vars
    const envPath = path.resolve(process.cwd(), '.env.local');
    console.log('Loading .env.local from:', envPath);
    
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach((line) => {
        // Skip comments and empty lines
        if (!line || line.startsWith('#')) return;
        
        const firstEquals = line.indexOf('=');
        if (firstEquals !== -1) {
          const key = line.substring(0, firstEquals).trim();
          let value = line.substring(firstEquals + 1).trim();
          
          // Remove quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          if (value.startsWith("'") && value.endsWith("'")) {
             value = value.slice(1, -1);
          }

          process.env[key] = value;
        }
      });
    } else {
        console.log('.env.local file not found!');
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not found in env');
      process.exit(1);
    }
    
    console.log('URI loaded (starts with):', uri.substring(0, 15) + '...');

    // 2. Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // 3. Define minimal schema/model (to avoid TS import issues)
    // Clear potentially compiled model if using ts-node but we are in node
    if (mongoose.models.Doctor) {
        delete mongoose.models.Doctor;
    }
    
    const doctorSchema = new mongoose.Schema({}, { strict: false });
    const Doctor = mongoose.model('Doctor', doctorSchema);

    // 4. Query doctors
    const doctors = await Doctor.find({});
    console.log(`Found ${doctors.length} doctors`);

    doctors.forEach(d => {
      console.log(`ID: ${d._id}`);
      console.log(`Name: ${d.name}`);
      console.log(`Bio Length: ${d.bio ? d.bio.length : 0}`);
      console.log(`Bio Preview: ${d.bio ? d.bio.substring(0, 30) : 'N/A'}`);
      console.log('---');
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error in script:', err);
  }
}

main();
