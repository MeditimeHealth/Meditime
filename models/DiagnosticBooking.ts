import mongoose, { Schema, Document } from 'mongoose';

export interface IDiagnosticBooking extends Document {
  userId?: mongoose.Types.ObjectId;
  patientName: string;
  mobileNumber: string;
  gender?: string;
  age?: number;
  patientType: 'new' | 'old' | 'report';
  appointmentDate: Date;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Cancelled';
  bookingId: string;
  venueId: mongoose.Types.ObjectId;
  tests: {
    _id: mongoose.Types.ObjectId;
    name: string;
    price: number;
    nameBn?: string;
  }[];
  totalPrice: number;
  affiliateCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const diagnosticBookingSchema = new Schema<IDiagnosticBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    patientName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
    },
    age: {
      type: Number,
    },
    patientType: {
      type: String,
      enum: ['new', 'old', 'report'],
      required: true,
      default: 'new',
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    tests: [{
      _id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      nameBn: {
        type: String,
      }
    }],
    totalPrice: {
      type: Number,
      required: true,
    },
    affiliateCode: {
      type: String,
    },
    bookingId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose overwrite error
const DiagnosticBooking = mongoose.models.DiagnosticBooking || mongoose.model<IDiagnosticBooking>('DiagnosticBooking', diagnosticBookingSchema);

export default DiagnosticBooking;
