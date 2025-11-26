import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  phoneNumber: string;
  username?: string;
  fullName: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  age?: number;
  password: string;
  photo?: string;
  role?: 'admin' | 'user' | 'doctor' | 'bloodDonor' | 'ambulance' | 'affiliate';
  userType?: 'user' | 'bloodDonor' | 'ambulance' | 'affiliate';
  // Affiliate-specific fields
  affiliateCode?: string;
  isActive?: boolean;
  walletBalance?: number;
  totalEarned?: number;
  totalWithdrawn?: number;
  pendingCommissions?: number;
  referrals?: number;
  earnings?: number;
  paymentMethod?: string;
  paymentDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
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
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
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
      enum: ['admin', 'user', 'doctor', 'bloodDonor', 'ambulance', 'affiliate'],
      default: 'user',
    },
    userType: {
      type: String,
      enum: ['user', 'bloodDonor', 'ambulance', 'affiliate'],
      default: 'user',
    },
    photo: {
      type: String,
      trim: true,
    },
    // Affiliate-specific fields
    affiliateCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingCommissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    referrals: {
      type: Number,
      default: 0,
      min: 0,
    },
    earnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    paymentDetails: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Delete existing model to force recompilation with updated schema
if (mongoose.models.User) {
  mongoose.deleteModel('User');
}

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
