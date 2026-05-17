import mongoose, { Schema, Document } from 'mongoose';

export interface IQueueEntry {
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  status: 'waiting' | 'in-call' | 'completed' | 'cancelled';
  joinedAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export interface ILiveConsultant extends Document {
  doctorId: mongoose.Types.ObjectId;
  isLive: boolean;
  newPatientFee: number;
  estimatedWaitTime: number; // minutes
  maxQueueSize: number;
  currentQueue: IQueueEntry[];
  roomId: string;
  specialization?: string;
  specializationBn?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QueueEntrySchema = new Schema({
  patientName: { type: String, required: true, trim: true },
  patientPhone: { type: String, required: true, trim: true },
  patientEmail: { type: String, trim: true },
  status: {
    type: String,
    enum: ['waiting', 'in-call', 'completed', 'cancelled'],
    default: 'waiting',
  },
  joinedAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  endedAt: { type: Date },
});

const LiveConsultantSchema: Schema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    newPatientFee: {
      type: Number,
      required: true,
      min: [0, 'Fee must be at least 0'],
    },
    estimatedWaitTime: {
      type: Number,
      default: 15,
      min: [1, 'Wait time must be at least 1 minute'],
    },
    maxQueueSize: {
      type: Number,
      default: 10,
      min: [1, 'Queue size must be at least 1'],
    },
    currentQueue: {
      type: [QueueEntrySchema],
      default: [],
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    specialization: { type: String, trim: true },
    specializationBn: { type: String, trim: true },
    language: { type: String, trim: true, default: 'Bengali' },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.LiveConsultant) {
  delete mongoose.models.LiveConsultant;
}

const LiveConsultant = mongoose.model<ILiveConsultant>('LiveConsultant', LiveConsultantSchema);

export default LiveConsultant;
