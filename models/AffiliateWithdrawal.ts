import mongoose, { Schema, Document } from 'mongoose';

export interface IAffiliateWithdrawal extends Document {
  affiliateId: mongoose.Types.ObjectId;
  amount: number;
  patientName?: string;
  patientPhone?: string;
  hospitalName?: string;
  proofPhotos?: string[];
  paymentMethod?: string;
  paymentDetails?: string;
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
      trim: true,
    },
    patientPhone: {
      type: String,
      trim: true,
    },
    hospitalName: {
      type: String,
      trim: true,
    },
    proofPhotos: {
      type: [String],
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    paymentDetails: {
      type: String,
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
