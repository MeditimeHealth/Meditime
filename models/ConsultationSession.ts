import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultationSession extends Document {
  doctorId: mongoose.Types.ObjectId;
  liveConsultantId: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  roomId: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  queuePosition: number;
  joinedAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSessionSchema: Schema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    liveConsultantId: {
      type: Schema.Types.ObjectId,
      ref: 'LiveConsultant',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    patientEmail: {
      type: String,
      trim: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
      default: 'waiting',
    },
    queuePosition: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.ConsultationSession) {
  delete mongoose.models.ConsultationSession;
}

const ConsultationSession = mongoose.model<IConsultationSession>(
  'ConsultationSession',
  ConsultationSessionSchema
);

export default ConsultationSession;
