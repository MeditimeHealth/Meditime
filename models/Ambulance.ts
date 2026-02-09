import mongoose, { Schema, Document } from 'mongoose';

export interface IAmbulance extends Document {
  name: string;
  nameBn?: string;
  phoneNumber: string;
  division?: string;
  divisionBn?: string;
  district?: string;
  districtBn?: string;
  thana?: string;
  thanaBn?: string;
  availabilityStatus: string;
  vehicleType: string;
  isApproved: boolean;
  ambulanceNumber?: string;
  drivingLicence?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AmbulanceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name/Company is required'],
      trim: true,
    },
    nameBn: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    division: {
      type: String,
      trim: true,
    },
    divisionBn: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    districtBn: {
      type: String,
      trim: true,
    },
    thana: {
      type: String,
      trim: true,
    },
    thanaBn: {
      type: String,
      trim: true,
    },
    availabilityStatus: {
      type: String,
      required: [true, 'Availability status is required'],
      enum: ['Available', 'Unavailable', 'On Call'],
      default: 'Available',
    },
    vehicleType: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: ['Basic Life Support', 'Advanced Life Support', 'Critical Care', 'Air Ambulance'],
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },

    ambulanceNumber: {
      type: String,
      trim: true,
    },
    drivingLicence: {
      type: String,
      trim: true,
    },
    
    userId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Ambulance = mongoose.models.Ambulance || mongoose.model<IAmbulance>('Ambulance', AmbulanceSchema);

export default Ambulance;

