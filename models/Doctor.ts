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
   * slugBn: Bangla text slug used for Bangla pages.
   */
  slug: string;
  slugBn?: string;

  // ── Location ────────────────────────────────────────────────────
  division?: string;
  divisionBn?: string;

  district?: string;
  districtBn?: string;

  thana?: string;
  thanaBn?: string;

  // ── Hospital / Department ───────────────────────────────────────
  hospital?: string;
  hospitalBn?: string;

  department?: string;
  departmentBn?: string;

  // ── Fees ────────────────────────────────────────────────────────
  reportShowFee?: number;
  reportShowFeeBn?: string; // Bangla representation, e.g. "৳৫০০"

  newPatientFee?: number;
  newPatientFeeBn?: string; // Bangla representation, e.g. "৳৮০০"

  // ── Diseases / Conditions ───────────────────────────────────────
  /**
   * diseases: Bangla disease/condition names for Bangla pages.
   * diseasesEn: English disease/condition names for English pages.
   */
  diseases?: string[];
  diseasesEn?: string[];

  // ── Bio ─────────────────────────────────────────────────────────
  bio?: string;
  bioBn?: string;

  // ── Availability ────────────────────────────────────────────────
  availability: Array<{
    days: string[];
    daysBn?: string[];
    time?: string;
    timeBn?: string;
  }>;

  // ── Contact (internal use only, not shown to visitors) ───────────
  email?: string;
  phoneNumber?: string;

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

    // slug (English) + slugBn (Bangla)
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    slugBn: {
      type: String,
      sparse: true,   // allows multiple nulls while still being unique when set
      index: true,
      trim: true,
    },

    // ── Location ──────────────────────────────────────────────────
    division: { type: String, trim: true },
    divisionBn: { type: String, trim: true },

    district: { type: String, trim: true },
    districtBn: { type: String, trim: true },

    thana: { type: String, trim: true },
    thanaBn: { type: String, trim: true },

    // ── Hospital / Department ─────────────────────────────────────
    hospital: { type: String, trim: true },
    hospitalBn: { type: String, trim: true },

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
    diseases: { type: [String], default: [] },   // Bangla names
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
                (!slot.daysBn || Array.isArray(slot.daysBn)) &&
                (!slot.time || typeof slot.time === 'string') &&
                (!slot.timeBn || typeof slot.timeBn === 'string')
              );
            });
          } else if (v && typeof v === 'object' && !Array.isArray(v)) {
            // Old format – single object (backward compatibility)
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
        message:
          'At least one availability slot must be provided with days, startTime, and endTime',
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
