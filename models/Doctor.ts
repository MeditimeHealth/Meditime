import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  specialty?: string;
  qualification: string;
  designation?: string;


  email?: string;
  phoneNumber?: string;
  hospital?: string;
  division?: string;
  district?: string;
  thana?: string;

  department?: string;
  consultationFee: number;
  oldPatientFee?: number;
  newPatientFee?: number;
  diseases?: string[];
  slotDuration?: number;
  availability: Array<{
    days: string[];
    time: string;
  }>;
  bio?: string;
  image?: string;
  rating?: number;
  
  // Bangla Fields
  nameBn?: string;
  specialtyBn?: string;
  qualificationBn?: string;
  designationBn?: string;
  bioBn?: string;

  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    specialty: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    hospital: {
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

    department: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      min: [0, 'Consultation fee must be at least 0'],
    },
    oldPatientFee: {
      type: Number,
      min: [0, 'Old patient fee must be at least 0'],
    },
    newPatientFee: {
      type: Number,
      min: [0, 'New patient fee must be at least 0'],
    },
    diseases: {
      type: [String],
      default: [],
    },
    slotDuration: {
      type: Number,
      min: [15, 'Slot duration must be at least 15 minutes'],
      default: 30,
    },
    availability: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function(v: any) {
          // Handle both old format (single object) and new format (array)
          if (Array.isArray(v)) {
            if (v.length === 0) return false;
            return v.every((slot: any) => {
              return (
                slot &&
                typeof slot === 'object' &&
                slot.days &&
                Array.isArray(slot.days) &&
                slot.days.length > 0 &&
                slot.time &&
                typeof slot.time === 'string'
              );
            });
          } else if (v && typeof v === 'object' && !Array.isArray(v)) {
            // Old format - single object (backward compatibility)
            return (
              v.days &&
              Array.isArray(v.days) &&
              v.days.length > 0 &&
              v.startTime &&
              typeof v.startTime === 'string' &&
              v.endTime &&
              typeof v.endTime === 'string'
            );
          }
          return false;
        },
        message: 'At least one availability slot must be provided with days, startTime, and endTime',
      },
    },
    bio: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    // Bangla Fields
    nameBn: { type: String, trim: true },
    specialtyBn: { type: String, trim: true },
    qualificationBn: { type: String, trim: true },
    designationBn: { type: String, trim: true },
    bioBn: { type: String, trim: true },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
    strict: false, // Allow fields not in schema
  }
);

// Pre-save hook to ensure availability is always an array
DoctorSchema.pre('save', function(next) {
  if (this.availability && !Array.isArray(this.availability)) {
    // Convert old format to array format
    this.availability = [this.availability];
  }
  next();
});

// Delete the model if it exists to avoid schema conflicts
if (mongoose.models.Doctor) {
  delete mongoose.models.Doctor;
}

const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default Doctor;

