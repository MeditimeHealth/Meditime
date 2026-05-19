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
    await mongoose.connect(uri);

    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', new mongoose.Schema({}, { strict: false }));
    const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', new mongoose.Schema({
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
    }, { strict: false }));

    const appointments = await Appointment.find({}).sort({ createdAt: -1 });
    console.log(`Loaded ${appointments.length} appointments, sorted by newest first:`);

    appointments.forEach((appt, idx) => {
      console.log(`${idx + 1}. Patient: ${appt.patientName}, doctorId: ${appt.doctorId}, CreatedAt: ${appt.createdAt}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
