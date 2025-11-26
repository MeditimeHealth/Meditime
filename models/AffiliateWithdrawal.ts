import mongoose, { Schema, Document } from 'mongoose';

export interface IAffiliateWithdrawal extends Document {
  affiliateId: mongoose.Types.ObjectId;
  amount: number;
  patientName: string;
  patientPhone: string;
  hospitalName: string;
  proofPhotos: string[];
  paymentMethod: string;
  paymentDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateWithdrawalSchema: Schema = new Schema(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: 'Affiliate',
      required: [true, 'Affiliate ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Withdrawal amount is required'],
      min: [1, 'Withdrawal amount must be at least 1'],
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone is required'],
      trim: true,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    proofPhotos: {
      type: [String],
      required: [true, 'At least one proof photo is required'],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one proof photo is required',
      },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    paymentDetails: {
      type: String,
      required: [true, 'Payment details are required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
AffiliateWithdrawalSchema.index({ affiliateId: 1, status: 1 });
AffiliateWithdrawalSchema.index({ status: 1, createdAt: -1 });

const AffiliateWithdrawal = mongoose.models.AffiliateWithdrawal || 
  mongoose.model<IAffiliateWithdrawal>('AffiliateWithdrawal', AffiliateWithdrawalSchema);

export default AffiliateWithdrawal;
