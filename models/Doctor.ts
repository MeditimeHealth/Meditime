import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  // ── Core identity ──────────────────────────────────────────────
  name: string;
  nameBn?: string;

  specialty?: string;
  specialtyBn?: string;

  qualification: string;
  qualificationBn?: string;

  designation?: string;
  designationBn?: string;

  /**
   * slug: English text slug used for English pages.
   */
  slug: string;

  // ── Department ─────────────────────────────────────────────────
  department?: string;
  departmentBn?: string;

  // ── Fees ────────────────────────────────────────────────────────
  reportShowFee?: number;
  reportShowFeeBn?: string; // Bangla representation, e.g. "৳৫০০"

  newPatientFee?: number;
  newPatientFeeBn?: string; // Bangla representation, e.g. "৳৮০০"

  // ── Diseases / Conditions ───────────────────────────────────────
  /**
   * diseases: Bangla disease/condition names (matches existing database).
   * diseasesEn: English disease/condition names.
   */
  diseases?: string[];
  diseasesEn?: string[];

  // ── Bio ─────────────────────────────────────────────────────────
  bio?: string;
  bioBn?: string;

  // ── Availability ────────────────────────────────────────────────
  /**
   * Each slot represents a schedule at a specific hospital.
   * hospital: slug of the hospital (required).
   */
  availability: Array<{
    days: string[];
    daysBn?: string[];
    time?: string;
    timeBn?: string;
    hospital: string; // hospital slug (required)
  }>;


  // ── UI-only / no Bangla needed ──────────────────────────────────
  slotDuration?: number;
  image?: string;
  rating?: number;

  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema(
  {
    // ── Core identity ─────────────────────────────────────────────
    name: { type: String, trim: true },
    nameBn: { type: String, trim: true },

    specialty: { type: String, trim: true },
    specialtyBn: { type: String, trim: true },

    qualification: { type: String, trim: true },
    qualificationBn: { type: String, trim: true },

    designation: { type: String, trim: true },
    designationBn: { type: String, trim: true },

    // slug (English)
    slug: {
      type: String,
      index: true,
      trim: true,
    },

    // ── Department ───────────────────────────────────────────────
    department: { type: String, trim: true },
    departmentBn: { type: String, trim: true },

    // ── Fees ──────────────────────────────────────────────────────
    reportShowFee: {
      type: Number,
      min: [0, 'Report show fee must be at least 0'],
    },
    reportShowFeeBn: { type: String, trim: true },

    newPatientFee: {
      type: Number,
      min: [0, 'New patient fee must be at least 0'],
    },
    newPatientFeeBn: { type: String, trim: true },

    // ── Diseases / Conditions ─────────────────────────────────────
    diseases: { type: [String], default: [] },   // Bangla names (matches existing database)
    diseasesEn: { type: [String], default: [] }, // English names

    // ── Bio ───────────────────────────────────────────────────────
    bio: { type: String, trim: true },
    bioBn: { type: String, trim: true },

    // ── Availability ──────────────────────────────────────────────
    availability: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (v: any) {
          if (!Array.isArray(v) || v.length === 0) return false;
          return v.every((slot: any) => {
            return (
              slot &&
              typeof slot === 'object' &&
              slot.days &&
              Array.isArray(slot.days) &&
              slot.days.length > 0 &&
              slot.hospital &&
              typeof slot.hospital === 'string' &&
              slot.hospital.trim().length > 0 &&
              (!slot.daysBn || Array.isArray(slot.daysBn)) &&
              (!slot.time || typeof slot.time === 'string') &&
              (!slot.timeBn || typeof slot.timeBn === 'string')
            );
          });
        },
        message:
          'At least one availability slot must be provided with days and a hospital slug',
      },
    },

    // ── Contact (internal use only, not shown to visitors) ─────────
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phoneNumber: { type: String, trim: true },

    // ── UI-only / no Bangla needed ────────────────────────────────
    slotDuration: {
      type: Number,
      min: [15, 'Slot duration must be at least 15 minutes'],
      default: 30,
    },
    image: { type: String, trim: true },
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

// Index for efficient hospital-based doctor queries
DoctorSchema.index({ 'availability.hospital': 1 });

// Pre-save hook to ensure availability is always an array
DoctorSchema.pre('save', function (next) {
  if (this.availability && !Array.isArray(this.availability)) {
    // Convert old format to array format
    this.availability = [this.availability];
  }
  next();
});

// Use existing model or create new one
const Doctor =
  mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default Doctor;
