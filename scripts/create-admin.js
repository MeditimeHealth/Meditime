const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Try to load .env.local if dotenv is available
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not installed or file doesn't exist - continue without it
}

// Static admin credentials
const ADMIN_CREDENTIALS = {
  phoneNumber: 'admin123',
  password: 'admin123',
  fullName: 'Admin User',
  email: 'admin@meditime.com',
  gender: 'other',
  age: 30,
  role: 'admin'
};

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [1, 'Age must be greater than 0'],
      max: [150, 'Age must be less than 150'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

async function createAdmin() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { phoneNumber: ADMIN_CREDENTIALS.phoneNumber },
        { email: ADMIN_CREDENTIALS.email },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Phone Number:', existingAdmin.phoneNumber);
      console.log('Email:', existingAdmin.email);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

    // Create admin user
    const admin = await User.create({
      ...ADMIN_CREDENTIALS,
      password: hashedPassword,
    });

    console.log('Admin user created successfully!');
    console.log('==============================');
    console.log('Phone Number:', ADMIN_CREDENTIALS.phoneNumber);
    console.log('Password:', ADMIN_CREDENTIALS.password);
    console.log('Email:', ADMIN_CREDENTIALS.email);
    console.log('Full Name:', ADMIN_CREDENTIALS.fullName);
    console.log('Role:', ADMIN_CREDENTIALS.role);
    console.log('==============================');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();

