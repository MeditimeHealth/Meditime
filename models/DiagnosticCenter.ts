import mongoose, { Schema, Document } from 'mongoose';

export interface IDiagnosticCenter extends Document {
  name: string;
  division?: string;
  district?: string;
  thana?: string;
  address?: string;
  phone?: string;
  email?: string;
  packageDiscount?: number; // Percentage discount for packages
  minTestsForPackage?: number; // Minimum tests for package discount
  createdAt: Date;
  updatedAt: Date;
}

const DiagnosticCenterSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    nameBn: {
      type: String,
      trim: true,
    },
    division: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    thana: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    packageDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    minTestsForPackage: {
      type: Number,
      default: 3,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

const DiagnosticCenter = mongoose.models.DiagnosticCenter || mongoose.model<IDiagnosticCenter>('DiagnosticCenter', DiagnosticCenterSchema);

export default DiagnosticCenter;

