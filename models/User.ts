import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  phoneNumber: string;
  username?: string;
  fullName: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  age?: number;
  password?: string;
  photo?: string;
  resetOtp?: string;
  resetOtpExpiry?: Date;
  role?: 'user' | 'doctor' | 'bloodDonor' | 'ambulance' | 'affiliate';
  userType?: 'user' | 'doctor' | 'bloodDonor' | 'ambulance' | 'affiliate';
  doctorId?: mongoose.Types.ObjectId;
  authProvider?: 'credentials' | 'google';
  googleId?: string;
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
  isPhoneVerified?: boolean;
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
      trim: true,
    },
    username: {
      type: String,
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
      required: function(this: any) {
        return this.authProvider !== 'google';
      },
      minlength: [6, 'Password must be at least 6 characters'],
    },
    authProvider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    googleId: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'doctor', 'bloodDonor', 'ambulance', 'affiliate'],
      default: 'user',
    },
    userType: {
      type: String,
      enum: ['user', 'doctor', 'bloodDonor', 'ambulance', 'affiliate'],
      default: 'user',
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    photo: {
      type: String,
      trim: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    resetOtp: {
      type: String,
    },
    resetOtpExpiry: {
      type: Date,
    },
    // Affiliate-specific fields
    affiliateCode: {
      type: String,
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

// Add partial unique indexes to allow multiple null/empty values
UserSchema.index(
  { phoneNumber: 1 }, 
  { unique: true, partialFilterExpression: { phoneNumber: { $type: "string", $gt: "" } } }
);

UserSchema.index(
  { username: 1 }, 
  { unique: true, partialFilterExpression: { username: { $type: "string", $gt: "" } } }
);

UserSchema.index(
  { affiliateCode: 1 }, 
  { unique: true, partialFilterExpression: { affiliateCode: { $type: "string", $gt: "" } } }
);

// Use existing model or create new one
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
