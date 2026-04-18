import mongoose, { Schema, Document } from 'mongoose';

export interface IDiagnosticBooking extends Document {
  patientName: string;
  mobileNumber: string;
  gender?: string;
  age?: number;
  patientType: 'new' | 'old' | 'report';
  appointmentDate: Date;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  venueId: mongoose.Types.ObjectId;
  tests: {
    _id: mongoose.Types.ObjectId;
    name: string;
    price: number;
    nameBn?: string;
  }[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const diagnosticBookingSchema = new Schema<IDiagnosticBooking>(
  {
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
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Confirmed',
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
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose overwrite error
const DiagnosticBooking = mongoose.models.DiagnosticBooking || mongoose.model<IDiagnosticBooking>('DiagnosticBooking', diagnosticBookingSchema);

export default DiagnosticBooking;
