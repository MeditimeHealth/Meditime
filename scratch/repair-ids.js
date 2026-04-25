const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MONGODB_URI = "mongodb+srv://laptopsakku_db_user:gd2QHCUtV50N95tZ@meditime.4ebe8ls.mongodb.net/?appName=meditime";

async function repair() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(MONGODB_URI);
    
    const Booking = mongoose.model('DiagnosticBooking', new Schema({
      bookingId: String
    }, { collection: 'diagnosticbookings' }));
    
    const bookings = await Booking.find({ $or: [{ bookingId: null }, { bookingId: { $exists: false } }] });
    console.log(`Found ${bookings.length} bookings without ID.`);
    
    for (const b of bookings) {
      const newId = `MDT-${Math.floor(10000000 + Math.random() * 90000000)}`;
      await Booking.updateOne({ _id: b._id }, { $set: { bookingId: newId } });
      console.log(`Updated ${b._id} -> ${newId}`);
    }
    
    console.log("Repair complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

repair();
