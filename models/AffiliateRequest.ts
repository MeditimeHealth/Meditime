import mongoose, { Schema, Document } from 'mongoose';

export interface IAffiliateRequest extends Document {
  affiliateId: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  hospitalName: string;
  proofPhoto?: string; // imgbb URL (deprecated, use proofPhotos)
  proofPhotos?: string[]; // Array of imgbb URLs for multiple photos
  appointmentId?: mongoose.Types.ObjectId; // Reference to appointment if linked
  commissionAmount?: number; // Flat rate commission set by admin
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateRequestSchema: Schema = new Schema(
  {
    affiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone number is required'],
      trim: true,
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    proofPhoto: {
      type: String,
      trim: true,
    },
    proofPhotos: {
      type: [String],
      default: [],
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    commissionAmount: {
      type: Number,
      min: [0, 'Commission amount must be positive'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Delete existing model to force recompilation with updated schema
if (mongoose.models.AffiliateRequest) {
  mongoose.deleteModel('AffiliateRequest');
}

const AffiliateRequest = mongoose.model<IAffiliateRequest>('AffiliateRequest', AffiliateRequestSchema);

export default AffiliateRequest;
