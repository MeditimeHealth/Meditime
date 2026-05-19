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

    // Require actual model definitions to ensure no duplicate schema compile issues
    // Just delete from cache if present
    delete mongoose.models.Appointment;
    delete mongoose.models.Doctor;

    // Load actual models
    const Appointment = require('../models/Appointment').default;
    const Doctor = require('../models/Doctor').default;

    const appointments = await Appointment.find({})
      .populate('doctorId')
      .populate('userId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });

    console.log(`First 5 appointments:`);
    appointments.slice(0, 5).forEach((appt, idx) => {
      console.log(`${idx + 1}. Patient: ${appt.patientName}`);
      console.log(`   doctorId value:`, appt.doctorId);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
