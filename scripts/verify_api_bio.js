
const http = require('http');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // 1. Get a doctor ID from DB
    // Load env vars
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach((line) => {
        if (!line || line.startsWith('#')) return;
        const firstEquals = line.indexOf('=');
        if (firstEquals !== -1) {
          const key = line.substring(0, firstEquals).trim();
          let value = line.substring(firstEquals + 1).trim();
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          process.env[key] = value;
        }
      });
    }

    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    const doctorSchema = new mongoose.Schema({}, { strict: false });
    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
    
    // Find a doctor WITH a bio
    const doctor = await Doctor.findOne({ bio: { $exists: true, $ne: "" } });
    await mongoose.disconnect();

    if (!doctor) {
        console.log("No doctor with bio found in DB.");
        return;
    }

    const doctorId = doctor._id.toString();
    console.log(`Testing with Doctor ID: ${doctorId}`);
    console.log(`Expected Bio: ${doctor.bio.substring(0, 20)}...`);

    // 2. Call API
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/doctors/${doctorId}`,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.doctor && json.doctor.bio) {
             console.log("API SUCCESS: Bio field matches.");
             console.log(`API Bio: ${json.doctor.bio.substring(0, 20)}...`);
          } else {
             console.log("API FAILURE: Bio field missing or empty in API response.");
             console.log("Full Response Keys:", Object.keys(json.doctor || {}));
          }
        } catch (e) {
            console.error("Error parsing API response:", e);
            console.log("Raw response:", data);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
    });

    req.end();

  } catch (err) {
    console.error(err);
  }
}

main();
