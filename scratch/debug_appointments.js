const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
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
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          process.env[key] = value;
        }
      });
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not found in env');
      process.exit(1);
    }
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Define models dynamically
    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', new mongoose.Schema({}, { strict: false }));
    const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', new mongoose.Schema({
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
    }, { strict: false }));

    const appointments = await Appointment.find({}).limit(5);
    console.log(`Found ${appointments.length} appointments`);

    for (let index = 0; index < appointments.length; index++) {
      const appt = appointments[index];
      console.log(`Appointment patientName: ${appt.patientName}`);
      console.log(`doctorId in db (raw): ${appt.doctorId} (type: ${typeof appt.doctorId})`);
      
      const doc = await Doctor.findById(appt.doctorId);
      console.log(`Looking up doctor by ID directly: ${doc ? doc.name : 'NOT FOUND'}`);

      // Try population manually
      const populated = await Appointment.findById(appt._id).populate('doctorId');
      console.log(`Populated doctor: ${populated.doctorId ? populated.doctorId.name : 'NULL/NOT POPULATED'}`);
      console.log('---');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error in script:', err);
  }
}

main();
