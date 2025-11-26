import mongoose, { Schema, Document } from 'mongoose';

export interface IAffiliate extends Document {
  name: string; // Stores NID
  email: string;
  phoneNumber: string;
  password: string;
  affiliateCode: string;
  isActive: boolean;
  earnings: number;
  referrals: number;
  // Wallet fields
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingCommissions: number;
  // Payment information
  paymentMethod?: string;
  paymentDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name/NID is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    affiliateCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    earnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    referrals: {
      type: Number,
      default: 0,
      min: 0,
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
if (mongoose.models.Affiliate) {
  mongoose.deleteModel('Affiliate');
}

const Affiliate = mongoose.model<IAffiliate>('Affiliate', AffiliateSchema);

export default Affiliate;
