const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load env vars
try {
  require('dotenv').config({ path: '.env' });
} catch (e) {}

const ADMIN_CREDENTIALS = {
  username: 'admin',
  email: 'admin@meditime.com',
  password: 'admin123',
  role: 'superadmin',
};

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  },
  { timestamps: true }
);

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

    // Check if admin already exists
    const existing = await Admin.findOne({
      $or: [{ email: ADMIN_CREDENTIALS.email }, { username: ADMIN_CREDENTIALS.username }],
    });

    if (existing) {
      console.log('✅ Admin already exists in Admin collection!');
      console.log('   Email   :', existing.email);
      console.log('   Username:', existing.username);
      console.log('   Role    :', existing.role);
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

    await Admin.create({ ...ADMIN_CREDENTIALS, password: hashedPassword });

    console.log('✅ Admin created successfully in Admin collection!');
    console.log('==============================');
    console.log('  Email   :', ADMIN_CREDENTIALS.email);
    console.log('  Username:', ADMIN_CREDENTIALS.username);
    console.log('  Password:', ADMIN_CREDENTIALS.password);
    console.log('  Role    :', ADMIN_CREDENTIALS.role);
    console.log('==============================');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();
