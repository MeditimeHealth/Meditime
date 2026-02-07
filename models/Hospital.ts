import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  thana?: mongoose.Types.ObjectId;
  address?: string;
  phone?: string;
  email?: string;
  
  // Bangla Fields
  nameBn?: string;
  addressBn?: string;

  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    thana: {
      type: Schema.Types.ObjectId,
      ref: 'Thana',
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
    // Bangla Fields
    nameBn: { type: String, trim: true },
    addressBn: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

const Hospital = mongoose.models.Hospital || mongoose.model<IHospital>('Hospital', HospitalSchema);

export default Hospital;

