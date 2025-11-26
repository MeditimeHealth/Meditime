import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientName: string;
  mobileNumber: string;
  gender?: string;
  age?: number;
  patientType: 'old' | 'new' | 'report';
  chamberName: string;
  appointmentDate: Date;
  appointmentTime?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  userId?: mongoose.Types.ObjectId;
  affiliateCode?: string;
  affiliateId?: mongoose.Types.ObjectId;
  hasCommission: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      trim: true,
    },
    age: {
      type: Number,
      min: [0, 'Age must be at least 0'],
    },
    patientType: {
      type: String,
      enum: ['old', 'new', 'report'],
      required: [true, 'Patient type is required'],
    },
    chamberName: {
      type: String,
      required: [true, 'Chamber name is required'],
      trim: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    affiliateCode: {
      type: String,
      trim: true,
    },
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: 'Affiliate',
    },
    hasCommission: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
AppointmentSchema.index({ mobileNumber: 1 });
AppointmentSchema.index({ status: 1 });

const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;

