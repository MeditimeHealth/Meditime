import mongoose, { Schema, Document } from 'mongoose';

export interface IAffiliateCommission extends Document {
  appointmentId: mongoose.Types.ObjectId;
  affiliateId: mongoose.Types.ObjectId;
  totalBill: number;
  commissionType: 'percentage' | 'flat';
  commissionValue: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateCommissionSchema: Schema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
      unique: true,
    },
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: 'Affiliate',
      required: [true, 'Affiliate ID is required'],
    },
    totalBill: {
      type: Number,
      required: [true, 'Total bill is required'],
      min: [0, 'Total bill must be positive'],
    },
    commissionType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: [true, 'Commission type is required'],
    },
    commissionValue: {
      type: Number,
      required: [true, 'Commission value is required'],
      min: [0, 'Commission value must be positive'],
    },
    commissionAmount: {
      type: Number,
      required: [true, 'Commission amount is required'],
      min: [0, 'Commission amount must be positive'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    paidAt: {
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
AffiliateCommissionSchema.index({ affiliateId: 1, status: 1 });
AffiliateCommissionSchema.index({ appointmentId: 1 });
AffiliateCommissionSchema.index({ status: 1, createdAt: -1 });

const AffiliateCommission = mongoose.models.AffiliateCommission || 
  mongoose.model<IAffiliateCommission>('AffiliateCommission', AffiliateCommissionSchema);

export default AffiliateCommission;
